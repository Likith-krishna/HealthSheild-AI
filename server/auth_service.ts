import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserTable } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "production_grade_aegis_secure_credential_system_key_2026_jwt";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "production_grade_aegis_secure_refresh_key_256_bit_token";

export interface JWTPayload {
  sub: string; // userId
  email: string;
  fullName: string;
}

export const SecurityService = {
  // Hash a plain physical password securely
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12); // Production standard 12 rounds
    return bcrypt.hash(password, salt);
  },

  // Compare raw password to database hashed password
  async verifyPassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  },

  // Sign a premium short-lived access JWT token (15 mins duration)
  generateAccessToken(user: UserTable): string {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  },

  // Sign a longer refresh token (7 days duration)
  generateRefreshToken(user: UserTable): string {
    return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
  },

  // Verify short-lived access token
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (e) {
      return null;
    }
  },

  // Verify long Refresh JWT token
  verifyRefreshToken(token: string): { sub: string } | null {
    try {
      return jwt.verify(token, REFRESH_SECRET) as { sub: string };
    } catch (e) {
      return null;
    }
  }
};
