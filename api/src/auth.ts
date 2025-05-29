import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { userByName } from "./service/user";
import { TokenClaims } from "./typedef";

const ISSUER = "https://una.ac.cr";
const RAW_SECRET = process.env["JWT_SECRET"];
const SECRET = Buffer.from(RAW_SECRET, "base64");

export const expressJwtMiddleware = expressjwt({
    algorithms: ["HS256"],
    credentialsRequired: false,
	issuer: ISSUER,
    secret: SECRET
});

export async function createToken(name: string, password: string): Promise<string>
{
    const user = await userByName(name);

    if (!user || user.password !== password) {
        return "";
    }

	const claims: TokenClaims = {
		iat: Date.now(),
		iss: ISSUER,
		name: user.name,
		sub: user.id
	};

	const token = jwt.sign(claims, SECRET);
	return token;
}
export async function decodeToken(token: string)
{
    try {
        return jwt.verify(token, SECRET);
    }
	catch(err) {
        console.log("Error:", err)
        return "";
    }
}
