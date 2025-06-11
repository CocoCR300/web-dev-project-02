import { User } from "./model/user";
declare function subscribeNewTask(_: any, args: any, { user }: {
    user: any;
}): import("graphql-subscriptions/dist/pubsub-async-iterable-iterator").PubSubAsyncIterableIterator<unknown>;
export declare const resolvers: {
    Query: {
        user: (_: any, { id }: {
            id: any;
        }) => Promise<User>;
    };
    Mutation: {};
    Subscription: {
        newTask: {
            subscribe: typeof subscribeNewTask;
        };
    };
};
export {};
//# sourceMappingURL=graphql-resolvers.d.ts.map