import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    // Check for Bearer token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Optional: fallback to cookie-based auth if token not found
    if (!token && req.cookies?.refreshToken) {
      const decodedCookie = jwt.verify(req.cookies.refreshToken, process.env.JWT_SECRET as string) as { id: string };
      req.user = await User.findById(decodedCookie.id).select("-password");
      next();
      return;
    }

    if (!token) {
      res.status(401).json({ message: "No token provided, authorization denied" });
      return;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // Attach user (without password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};
