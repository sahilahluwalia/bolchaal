// @ts-nocheck because of jose don't have types
import { jwtVerify ,SignJWT} from "jose";
import { randomBytes } from "crypto";
import { UserRoleSchema } from "@repo/db/client";

// console.log(process.env)
interface UserJwtPayload {
  sub: {
    id: string;
    role: UserRoleSchema;
  };
  //standard
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

export const verifyToken = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    console.log('verified',verified)
    return verified.payload as any as UserJwtPayload;
  } catch (error) {
    throw new Error("Your Token has expired");
  }
};

export const generateToken = async ({
  id,
  role,
}: {
  id: string;
  role: UserRoleSchema;
}) => {
    console.log(process.env.JWT_SECRET);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ sub: {id, role} })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    return token;
  };

export const generateRefreshToken = async (userId: string) => {
  const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  const tokenId = randomBytes(16).toString('hex');

  const refreshToken = await new SignJWT({ userId, tokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Refresh tokens last 7 days
    .sign(secret);

  return { refreshToken, tokenId };
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const verified = await jwtVerify(token, secret);
    return verified.payload as RefreshTokenPayload;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const generateTokenPair = async ({
  id,
  role,
}: {
  id: string;
  role: UserRoleSchema;
}) => {
  const accessToken = await generateToken({ id, role });
  const { refreshToken } = await generateRefreshToken(id);

  return {
    accessToken,
    refreshToken,
  };
};