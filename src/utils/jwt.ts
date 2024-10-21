import jwt from "jsonwebtoken";
import { Schema } from "mongoose";

const SECRET_KEY = process.env.JWT_SECRET!;

interface JwtPayload {
  id: unknown;
  email: string;
  username: string;
  phone: string;
  organization: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  role: string;
}

export const generateToken = (
  payload: JwtPayload,
  expiresIn: string = "24h",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET_KEY, { expiresIn }, (error, token) => {
      if (error) {
        reject(error);
      } else resolve(token as string);
    });
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
