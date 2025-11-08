
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "15m";  // short-lived
const REFRESH_TOKEN_EXPIRES_IN = "7d";  // long-lived

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};
