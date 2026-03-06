import jwt from "jsonwebtoken";

export interface TokenPayload {
    _id?: string; // Optional MongoDB ID
    uid: string;
    email: string;
    emailVerified: boolean;
    role: "user" | "admin" | "superadmin";
}

export const signAccessToken = (p: TokenPayload) => jwt.sign(p, process.env.JWT_SECRET!, { expiresIn: "15m" });
export const signRefreshToken = (p: TokenPayload) => jwt.sign(p, process.env.REFRESH_SECRET!, { expiresIn: "7d" });
export const verifyAccessToken = (t: string) => jwt.verify(t, process.env.JWT_SECRET!) as TokenPayload;
export const verifyRefreshToken = (t: string) => jwt.verify(t, process.env.REFRESH_SECRET!) as TokenPayload;
