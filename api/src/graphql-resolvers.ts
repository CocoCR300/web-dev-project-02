import { GraphQLError } from "graphql";
import { createUser, deleteUser, updateUser, userById, users } from "./service/user";
import { User } from "./model/user";
import { PubSub } from "graphql-subscriptions";

const publishSubscribe = new PubSub();

function subscribeNewTask(_, args, { user }) {
	return publishSubscribe.asyncIterableIterator("TASK_ADDED");
}

export const resolvers = {
	Query: {
		user: async (_, { id }): Promise<User> => {
			const user = await userById(id)
			if (!user) {
				throw new GraphQLError("User does not exist", {
					extensions: {
						code: "NOT_FOUND"
					}
				})
			}

			return user
		},
		users: async (_, { limit }): Promise<User[]> => {
			if (!limit) { limit = 0; }

			return users(limit);
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
		createUser: (_, { input }): Promise<User> => {
			const { name, full_name, password } = input;
			const newUser = createUser(name, full_name, password);

			return newUser;
		},
		deleteUser: (_, { id }): Promise<User | null> => {
			const deletedUser = deleteUser(id);
			if (!deletedUser) {
				throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
			}

			return deletedUser;
		},
		updateUser: async (_, { input }): Promise<User> => {
			const { id, name, full_name, password } = input;
			const updatedUser = await updateUser(id, name, full_name, password);
			if (!updatedUser) {
				throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
			}

			return updatedUser;
		},
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
	//Subscription: {
	//	newTask: {
	//		subscribe: subscribeNewTask
	//	}
	//}
};
