import { jwtVerify ,SignJWT} from "jose";
// console.log(process.env)
interface UserJwtPayload {

  //standard
  jti: string;
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

export const generateToken = async (id: string) => {
    console.log(process.env.JWT_SECRET);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ sub: id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    return token;
  };