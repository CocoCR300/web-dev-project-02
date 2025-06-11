import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import cors from "cors";
import { expressMiddleware } from "@as-integrations/express5";
import { readFile } from "fs/promises";
import { createServer } from "node:http";
// @ts-ignore
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { resolvers } from "./graphql-resolvers";
import { decodeToken } from "./auth";
async function getContext({ req }) {
    return { auth: req.auth };
}
async function getWebSocketContext({ connectionParams }) {
    const accessToken = connectionParams?.accessToken;
    if (!accessToken) {
        return {};
    }
    const payload = await decodeToken(accessToken);
    return { user: payload };
}
const PORT = 9001;
const typeDefinitions = await readFile("./schema.graphql", "utf-8");
const schemaDefinition = {
    typeDefs: typeDefinitions,
    resolvers
};
const graphSchema = makeExecutableSchema(schemaDefinition);
const application = express();
const httpServer = createServer(application);
const webSocketServer = new WebSocketServer({
    server: httpServer, path: "/"
});
const serverCleanup = useServer({ context: getWebSocketContext, schema: graphSchema }, webSocketServer);
const apolloServer = new ApolloServer({
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
});
const apolloExpressMiddleware = expressMiddleware(apolloServer, { context: getContext });
application.use("/", cors(), express.json(), apolloExpressMiddleware);
// application.post("/login", getToken)
apolloServer.start();
await apolloServer.start();
const listenOptions = { port: PORT };
httpServer.listen(listenOptions, () => {
    console.log(`Listening on: http://localhost:${PORT}/`);
});
