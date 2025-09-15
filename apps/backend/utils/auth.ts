import { UserRoleSchema, UserRole } from "@repo/db/client";

interface UserJwtPayload {
  sub: string;
  user: {
    id: string;
    role: UserRole;
  };
  iat: number;
  exp: number;
}


export const verifyToken = async (token: string) => {

  try {
    const { jwtVerify } = await import("jose");
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return verified.payload as any as UserJwtPayload;
  } catch (error) {
    console.log("error", error);
    throw new Error("Your Token has expired");
  }
};

export const generateToken = async ({
  id,
  role,
}: {
  id: string;
  role: UserRole;
}) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secretsuperlongsecretintheworldofhumansonplanetearthinmilkywaygalaxy");
  const { SignJWT } = await import("jose");
  const token = await new SignJWT({ user: { id, role } })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(id)
    .setExpirationTime("100h")
    .sign(secret);
  return token;
};

// Removed refresh token generation/verification and token pair creation
