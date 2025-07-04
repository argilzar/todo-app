import {
	PathwayRouter,
	PathwaysBuilder,
	createPostgresPathwayState,
} from "@flowcore/pathways";
import {
	todoCreated,
	todoRenamed,
	todoCompleted,
	todoReopened,
	todoDeleted,
} from "./schemas";
import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

const apiKey = requireEnv("FLOWCORE_API_KEY");
const postgresUrl = requireEnv("POSTGRES_URL");

// Initialize the database connection
export const sql = postgres(postgresUrl);

export const pathways = new PathwaysBuilder({
	baseUrl: requireEnv("FLOWCORE_WEBHOOK_BASE_URL"),
	tenant: requireEnv("FLOWCORE_TENANT"),
	dataCore: process.env.FLOWCORE_DATA_CORE || "todo-app",
	apiKey,
})
	.withPathwayState(
		createPostgresPathwayState({ connectionString: postgresUrl }),
	)
	.register({
		flowType: "todo-items",
		eventType: "todo-item.created.v0",
		schema: todoCreated,
	})
	.register({
		flowType: "todo-items",
		eventType: "todo-item.renamed.v0",
		schema: todoRenamed,
	})
	.register({
		flowType: "todo-items",
		eventType: "todo-item.completed.v0",
		schema: todoCompleted,
	})
	.register({
		flowType: "todo-items",
		eventType: "todo-item.reopened.v0",
		schema: todoReopened,
	})
	.register({
		flowType: "todo-items",
		eventType: "todo-item.deleted.v0",
		schema: todoDeleted,
	});

export const pathwaysRouter = new PathwayRouter(pathways, "1234");
