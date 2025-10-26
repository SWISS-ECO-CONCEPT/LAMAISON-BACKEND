import { Router } from "express";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import prisma from "../utils/db";

const route = Router()

route.post(
  '/clerk',
  bodyParser.raw({ type: 'application/json' }),
  async function (req: any, res: any) {
    try {
      const payloadString = req.body.toString();
      
      // Get the Clerk webhook headers
      const svixId = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Missing Clerk webhook headers');
        return res.status(400).json({
          success: false,
          message: 'Missing webhook headers',
        });
      }

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET as string);
      const evt: any = wh.verify(payloadString, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
      // evt.data may be missing or not shaped the way we expect. Be defensive and log useful info.
      const data = evt && evt.data ? evt.data : {};
      const id = data.id as string | undefined;
      // attributes will be a shallow copy of data without id so we can inspect unsafeMetadata etc.
      const { id: _unused, ...attributes } = data as any;

      // Handle the webhooks
      const eventType = evt && evt.type ? evt.type : undefined;
      console.log('Received event type:', eventType);
      // Log some diagnostics so we can see what shape the event had (safe stringify)
      try {
        console.log('Event data keys:', Object.keys(data || {}));
        console.log('Event data sample:', JSON.stringify(data || {}, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
      } catch (err) {
        console.log('Could not stringify evt.data for logging:', err);
      }

      if (eventType === 'user.created') {
        console.log(`User ${id} was ${eventType}`);

        // Defensive access: unsafeMetadata may be undefined
        const unsafeMetadata = attributes && attributes.unsafeMetadata ? attributes.unsafeMetadata : undefined;
        if (!unsafeMetadata) {
          console.log('Warning: unsafeMetadata missing on user.created event for id:', id);
        }

        const firstNameFromUnsafe = unsafeMetadata?.firstname ?? null;
        const roleFromUnsafe = unsafeMetadata?.role ?? null;

        // Try other common fields Clerk sends
        const firstNameFromTopLevel = data.first_name ?? null;
        const publicMetaFirst = attributes?.public_metadata?.firstname ?? null;

        // email fallback: use the local part of the first email address if present
        const primaryEmail = Array.isArray(data.email_addresses) && data.email_addresses.length > 0
          ? data.email_addresses[0].email_address
          : null;
        const firstFromEmail = typeof primaryEmail === 'string' && primaryEmail.includes('@')
          ? primaryEmail.split('@')[0]
          : null;

        // Final firstname: prefer unsafeMetadata -> top-level first_name -> public metadata -> email localpart -> 'Unknown'
        const derivedFirstName = (firstNameFromUnsafe as string) || (firstNameFromTopLevel as string) || (publicMetaFirst as string) || firstFromEmail || 'Unknown';

        // Role: prefer unsafeMetadata.role -> public_metadata.role -> default to 'PROSPECT'
        const roleCandidate = (roleFromUnsafe as string) || (attributes?.public_metadata?.role as string) || 'PROSPECT';

        // Map/validate roleCandidate against Prisma enum values (ADMIN, AGENT, PROSPECT)
        const roleUpper = typeof roleCandidate === 'string' ? roleCandidate.toUpperCase() : 'PROSPECT';
        const allowedRoles = ['ADMIN', 'AGENT', 'PROSPECT'];
        const derivedRole = allowedRoles.includes(roleUpper) ? roleUpper : 'PROSPECT';

        console.log('Parsed firstname and role (derived):', derivedFirstName, derivedRole);

        const user = {
          clerkId: id,
          firstname: derivedFirstName,
          role: derivedRole,
        };
        console.log('User object to save:', user);

        // Now we can attempt to create because required fields are filled with safe defaults
        if (typeof id === 'string' && typeof derivedFirstName === 'string' && typeof derivedRole === 'string') {
          try {
            await prisma.user.create({ data: { clerkId: id, firstname: derivedFirstName, role: derivedRole as any } });
            console.log('User saved to database');
          } catch (dbErr: any) {
            console.error('Prisma create failed:', dbErr && dbErr.message ? dbErr.message : dbErr);
            throw dbErr;
          }
        } else {
          console.log('Skipping user.create because required fields are missing or invalid even after derivation', { id, derivedFirstName, derivedRole });
        }
      }
      res.status(200).json({
        success: true,
        message: 'Webhook received',
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default route;