import { Router } from "express";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import prisma from "../utils/db";

const route = Router()

route.post(
  '/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  async function (req: any, res: any) {
    try {
      const payloadString = req.body.toString();
      const svixHeaders = req.headers;

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SIGNING_SECRET as string);
      const evt: any = wh.verify(payloadString, svixHeaders);
      const { id, ...attributes } = evt.data;
      // Handle the webhooks
      const eventType = evt.type;
      console.log(evt.data)
      if (eventType === 'user.created') {
        console.log(`User ${id} was ${eventType}`);
        console.log(attributes);
        const firstName = attributes.unsafeMetadata.firstname;
        const role = attributes.unsafeMetadata.role;

        const user = {
          clerkId: id,
          firstname: firstName,
          role: role,
        };

        await prisma.user.create({
          data: user,
        });
        console.log('User saved to database');
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