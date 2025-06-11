import { GraphQLError } from "graphql";
import { userById } from "./service/user";
import { PubSub } from "graphql-subscriptions";
const publishSubscribe = new PubSub();
function subscribeNewTask(_, args, { user }) {
    return publishSubscribe.asyncIterableIterator("TASK_ADDED");
}
export const resolvers = {
    Query: {
        user: async (_, { id }) => {
            const user = await userById(id);
            if (!user) {
                throw new GraphQLError("User does not exist", {
                    extensions: {
                        code: "NOT_FOUND"
                    }
                });
            }
            return user;
        }
    },
    //Task: {
    //	user: async (task) => {
    //		return await getUser(task.user_id);
    //	},
    //	created_at: (task) => {
    //		return task.created_at.slice(0, "yyyy-mm-dd".length);
    //	}
    //},
    Mutation: {
    //createTask: async (_root, { input: { name, deadline } }, { auth }) => {
    //	if (!auth) {
    //		throw new GraphQLError("Usuario no autorizado", { extensions: { code: "UNAUTHORIZED" } })
    //	}
    //	const task = await createTask({ name, deadline, user_id: auth.sub })
    //	publishSubscribe.publish("TASK_ADDED", { newTask: task });
    //	return task
    //},
    //transferTask: async (_, { input: { task_id, user_id } }, { auth }) => {
    //	if (!auth) {
    //		throw new GraphQLError("Usuario no autorizado", { extensions: { code: "UNAUTHORIZED" } })
    //	}
    //	const task = await getTask(task_id)
    //	if (!task) {
    //		throw new GraphQLError("Tarea no existe", {
    //			extensions: {
    //				code: "NOT_FOUND"
    //			}
    //		})
    //	}
    //	if (auth.sub != task.user_id) {
    //		throw new GraphQLError("La tarea especificada no pertence a este usuario", { extensions: { code: "UNAUTHORIZED" } })
    //	}
    //	const updatedTask = await transferTask(task_id, user_id)
    //	return updatedTask
    //}
    },
    Subscription: {
        newTask: {
            subscribe: subscribeNewTask
        }
    }
};
