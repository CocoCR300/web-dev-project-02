import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { userByName } from "./service/user";

const secret = Buffer.from("contraseñaSuperSecreta", "base64");

export const expressJwtMiddleware = expressjwt({
    algorithms: ["HS256"],
    credentialsRequired: false,
    secret,
});

export async function getToken(request, response)
{
    const { name, password } = request.body;
    const user = await userByName(name);

    if(!user || user.password !== password){
        response.sendStatus(401)
    }
	else{
        const claims = {
            sub: user.id,
            name: user.name,
        }
        const token = jwt.sign(claims, secret)
        response.json({token})
    }
}
export async function decodeToken(token: string)
{
    try {
        return jwt.verify(token, secret)
    }
	catch(err) {
        console.log("Error:", err)
        return null
    }
}
