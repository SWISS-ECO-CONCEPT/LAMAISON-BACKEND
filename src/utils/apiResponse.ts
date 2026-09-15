import { Response } from "express";

// Format de réponse uniforme pour toute l'API.
// Objectif : que le frontend (web ET futur mobile) puisse toujours faire
// `if (json.success) { ... json.data ... } else { ... json.error ... }`
// sans avoir à deviner la forme de la réponse selon l'endpoint.

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;   // ex: "P2025" (code Prisma), "VALIDATION_ERROR"...
    details?: unknown; // stack trace ou objet d'erreur brut, utile en dev
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  status = 200,
  message?: string
) => {
  const body: ApiSuccess<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(status).json(body);
};

export const sendError = (
  res: Response,
  status: number,
  message: string,
  code?: string,
  details?: unknown
) => {
  const body: ApiError = { success: false, error: { message, code, details } };
  return res.status(status).json(body);
};