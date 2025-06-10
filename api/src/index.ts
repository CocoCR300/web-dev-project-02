import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import cors from "cors";
import { ExpressContextFunctionArgument, expressMiddleware } from "@as-integrations/express5";
import { readFile } from "fs/promises";
import { createServer } from "node:http"
// @ts-ignore
import { useServer } from "graphql-ws/use/ws";
import { IExecutableSchemaDefinition, makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { ListenOptions } from "node:net";
import { resolvers } from "./graphql-resolvers";
import { createToken, decodeToken, expressJwtMiddleware } from "./auth";
import { ApolloServerContext } from "./typedef";

async function login(req: any, res: any)
{
	const requestBody = req.body;
	const { name, password } = requestBody;
	const token = await createToken(name, password);

	if (token == "") {
		res.sendStatus(401);
	}
	else {
		res.json(token);
	}
}

async function getApolloContext(expressArgs: ExpressContextFunctionArgument): Promise<ApolloServerContext>
{
	const { req } = expressArgs;
	const token = req["auth"];
	const context: ApolloServerContext = { token };

	return context;
}

async function getWebSocketContext({ connectionParams })
{
	const accessToken = connectionParams?.accessToken;
	if (!accessToken) {
		return {};
	}

	const payload = await decodeToken(accessToken);
	return { user: payload };
}

const PORT = parseInt(process.env["PORT"]);
const GRAPHQL_ROOT = "/graphql";

const typeDefinitions = await readFile("./schema.graphql", "utf-8");
const schemaDefinition: IExecutableSchemaDefinition = {
	typeDefs: typeDefinitions,
	resolvers
};
const graphSchema = makeExecutableSchema(schemaDefinition);

const application = express()
const httpServer = createServer(application)
const webSocketServer = new WebSocketServer({
	server: httpServer, path: GRAPHQL_ROOT
});
const serverCleanup = useServer({ context: getWebSocketContext, schema: graphSchema }, webSocketServer);
const apolloServer = new ApolloServer<ApolloServerContext>({
	csrfPrevention: false,
	schema: graphSchema,
	plugins: [
		ApolloServerPluginDrainHttpServer({ httpServer }),
		{
			async serverWillStart() {
				return {
					async drainServer() {
						await serverCleanup.dispose();
					}
				};
			}
		}
	]
})

await apolloServer.start()
const apolloExpressMiddleware = expressMiddleware(apolloServer, { context: getApolloContext });

application.use(cors<cors.CorsRequest>(), express.json());
application.post("/login", login);
application.use(GRAPHQL_ROOT, expressJwtMiddleware as any, apolloExpressMiddleware as any)

const listenOptions: ListenOptions = { port: PORT };
httpServer.listen(listenOptions, () => {
	console.log(`Listening on: http://localhost:${PORT}`)
})

