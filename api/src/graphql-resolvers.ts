import { GraphQLError } from "graphql";
import { createUser, deleteUser, updateUser, userById, users } from "./service/user";
import { Category } from "./model/category";
import { User } from "./model/user";
import { Transaction } from "./model/transaction";
import { PubSub } from "graphql-subscriptions";
import { ApolloServerContext, IdResult } from "./typedef";
import { createTransaction, deleteTransaction, transactions, updateTransaction } from "./service/transaction";
import { categories, createCategory, deleteCategory, updateCategory } from "./service/category";

// SQLite error codes:
//	SQLITE_CONSTRAINT_FOREIGNKEY

const publishSubscribe = new PubSub();

function subscribeNewTask(_, args, { user }) {
	return publishSubscribe.asyncIterableIterator("TASK_ADDED");
}

export const resolvers = {
	Query: {
		me: async (_, args, context: ApolloServerContext): Promise<User> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNATHENTICATED" } });
			}

			const id = token.sub;
			const user = await userById(id);

			return user;
		},
		user: async (_, { id }): Promise<User> => {
			const user = await userById(id);
			if (user == null) {
				throw new GraphQLError("User does not exist", { extensions: { code: "NOT_FOUND" } });
			}

			return user
		},
		users: async (_, { limit }): Promise<User[]> => {
			if (!limit) { limit = 0; }

			return users(limit);
		},
		transactions: async (_, { limit, offset, search_filter }, context: ApolloServerContext): Promise<Transaction[]> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNATHENTICATED" } });
			}

			const id = token.sub;
			const items = await transactions(id, limit, offset, search_filter);

			for (const item of items) {
				item.category = {
					id: item.category_id,
					name: item.category_name
				};
			}

			return items;
		},
		categories: async (_, args, context: ApolloServerContext): Promise<Category[]> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNATHENTICATED" } });
			}

			const id = token.sub;
			const items = await categories(id);

			return items;
		}
	},
	Mutation: {
		createUser: (_, { input }): Promise<User> => {
			const { name, full_name, password } = input;
			const newUser = createUser(name, full_name, password);

			return newUser;
		},
		deleteSelf: async (_, args, context: ApolloServerContext): Promise<IdResult> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const id = token.sub;
			const deleted = await deleteUser(id);
			if (!deleted) {
				throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
			}

			return { id };
		},
		updateSelf: async (_, { input }, context: ApolloServerContext): Promise<User> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const id = token.sub;
			const { name, full_name, password } = input;
			const updatedUser = await updateUser(id, name, full_name, password);
			if (updatedUser == null) {
				throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
			}

			return updatedUser;
		},

		createTransaction: async (_, { input }, context: ApolloServerContext): Promise<Transaction> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const { amount, category_id, date, description } = input;
			const user_id = token.sub;

			try {
				const newTransaction = await createTransaction(user_id, amount, date, description, category_id);
				return newTransaction;
			}
			catch (err) {
				console.error(err);

				if (err.code) {
					throw new GraphQLError("Database schema violation", { extensions: { code: err.code } });
				}
			}
		},
		updateTransaction: (_, { input }, context: ApolloServerContext): Promise<Transaction> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const { id, amount, category_id, date, description } = input;
			const user_id = token.sub;

			try {
				const newTransaction = updateTransaction(user_id, id, amount, date, category_id, description);
				return newTransaction;
			}
			catch (err) {
				console.error(err);

				if (err.code) {
					throw new GraphQLError("Database schema violation", { extensions: { code: err.code } });
				}
			}
		},
		deleteTransaction: async (_, args, context: ApolloServerContext): Promise<IdResult> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const { id } = args;

			const user_id = token.sub;
			const deleted = await deleteTransaction(user_id, id);
			if (!deleted) {
				throw new GraphQLError("Transaction not found", { extensions: { code: "NOT_FOUND" } });
			}

			return { id };
		},

		createCategory: async (_, { input }, context: ApolloServerContext): Promise<Category> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const { name } = input;
			const user_id = token.sub;

			try {
				const newCategory = await createCategory(user_id, name);
				return newCategory;
			}
			catch (err) {
				console.error(err);

				if (err.code) {
					throw new GraphQLError("Database schema violation", { extensions: { code: err.code } });
				}
			}
		},
		updateCategory: async (_, { input }, context: ApolloServerContext): Promise<Category> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const { id, name } = input;
			const user_id = token.sub;

			try {
				const newCategory = await updateCategory(user_id, id, name);
				return newCategory;
			}
			catch (err) {
				console.error(err);

				if (err.code) {
					throw new GraphQLError("Database schema violation", { extensions: { code: err.code } });
				}
			}
		},
		deleteCategory: async (_, args, context: ApolloServerContext): Promise<IdResult> => {
			const { token } = context;
			if (!token) {
				throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
			}

			const { id } = args;

			const user_id = token.sub;
			const deleted = await deleteCategory(user_id, id);
			if (!deleted) {
				throw new GraphQLError("Category not found", { extensions: { code: "NOT_FOUND" } });
			}

			return { id };
		},
		//createTask: async (_root, { input: { name, deadline } }, { token }) => {
		//	if (!token) {
		//		throw new GraphQLError("Usuario no autorizado", { extensions: { code: "UNAUTHORIZED" } })
		//	}
		//	const task = await createTask({ name, deadline, user_id: token.sub })
		//	publishSubscribe.publish("TASK_ADDED", { newTask: task });

		//	return task
		//},
	},
	//Subscription: {
	//	newTask: {
	//		subscribe: subscribeNewTask
	//	}
	//}
};
