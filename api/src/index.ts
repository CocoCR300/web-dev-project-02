import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@as-integrations/express5";
import { readFile } from "fs/promises";
import { createServer } from "node:http"
// @ts-ignore
import { useServer } from "graphql-ws/use/ws";
import { IExecutableSchemaDefinition, makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { ListenOptions } from "node:net";
import { resolvers } from "./graphql-resolvers";
import { decodeToken } from "./auth";

interface ApolloServerContext
{
	auth?: string;
}

async function getContext({ req }): Promise<ApolloServerContext>
{
	return { auth: req.auth }
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

const PORT = 9001

const typeDefinitions = await readFile("./schema.graphql", "utf-8");
const schemaDefinition: IExecutableSchemaDefinition = {
	typeDefs: typeDefinitions,
	resolvers
};
const graphSchema = makeExecutableSchema(schemaDefinition);

const application = express()
const httpServer = createServer(application)
const webSocketServer = new WebSocketServer({
	server: httpServer, path: "/"
});
const serverCleanup = useServer({ context: getWebSocketContext, schema: graphSchema }, webSocketServer);
const apolloServer = new ApolloServer<ApolloServerContext>({
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

const apolloExpressMiddleware = expressMiddleware(apolloServer, { context: getContext });
application.use("/", cors<cors.CorsRequest>(), express.json(), apolloExpressMiddleware as any)
// application.post("/login", getToken)

const listenOptions: ListenOptions = { port: PORT };
httpServer.listen(listenOptions, () => {
	console.log(`Listening on: http://localhost:${PORT}/`)
})

