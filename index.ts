import type { FlowcoreLegacyEvent } from "@flowcore/pathways";
import { pathwaysRouter, pathways, sql } from "./pathways";
import "./handlers";

const server = Bun.serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url);

		// CORS headers for frontend
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		// Handle preflight requests
		if (req.method === "OPTIONS") {
			return new Response(null, { status: 200, headers: corsHeaders });
		}

		// Serve the frontend HTML file
		if (req.method === "GET" && url.pathname === "/") {
			const html = await Bun.file("./frontend/index.html").text();
			return new Response(html, {
				headers: { "Content-Type": "text/html", ...corsHeaders },
			});
		}

		// Serve static files
		if (req.method === "GET" && url.pathname.startsWith("/frontend/")) {
			const filePath = `.${url.pathname}`;
			const file = Bun.file(filePath);
			const exists = await file.exists();
			
			if (!exists) {
				return new Response("Not Found", { status: 404 });
			}

			const mimeType = filePath.endsWith('.css') ? 'text/css' : 
			               filePath.endsWith('.js') ? 'application/javascript' : 
			               'text/plain';
			
			return new Response(file, {
				headers: { "Content-Type": mimeType, ...corsHeaders },
			});
		}

		// GET /api/todos - Get all todos
		if (req.method === "GET" && url.pathname === "/api/todos") {
			try {
				const todos = await sql`SELECT * FROM todo ORDER BY title`;
				return new Response(JSON.stringify(todos), {
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			} catch (error) {
				console.error("Error fetching todos:", error);
				return new Response(
					JSON.stringify({ error: "Failed to fetch todos" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			}
		}

		// POST /api/todos - Create a new todo
		if (req.method === "POST" && url.pathname === "/api/todos") {
			try {
				const body = await req.json();
				const { title, description } = body;

				if (!title) {
					return new Response(
						JSON.stringify({ error: "Title is required" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json", ...corsHeaders },
						},
					);
				}

				const id = crypto.randomUUID();
				
				// Use pathways to create the todo
				await pathways.write("todo-items/todo-item.created.v0", {
					data: {
						id,
						title,
						description: description || "",
						done: false,
					},
				});

				return new Response(
					JSON.stringify({ id, title, description, done: false }),
					{
						status: 201,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			} catch (error) {
				console.error("Error creating todo:", error);
				return new Response(
					JSON.stringify({ error: "Failed to create todo" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			}
		}

		// PUT /api/todos/:id - Update a todo
		if (req.method === "PUT" && url.pathname.startsWith("/api/todos/")) {
			try {
				const id = url.pathname.split("/").pop();
				const body = await req.json();
				const { title, done } = body;

				if (title) {
					await pathways.write("todo-items/todo-item.renamed.v0", {
						data: { id, newTitle: title },
					});
				}

				if (done !== undefined) {
					const eventType = done ? "todo-item.completed.v0" : "todo-item.reopened.v0";
					await pathways.write(`todo-items/${eventType}`, {
						data: { id },
					});
				}

				return new Response(JSON.stringify({ success: true }), {
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			} catch (error) {
				console.error("Error updating todo:", error);
				return new Response(
					JSON.stringify({ error: "Failed to update todo" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			}
		}

		// DELETE /api/todos/:id - Delete a todo
		if (req.method === "DELETE" && url.pathname.startsWith("/api/todos/")) {
			try {
				const id = url.pathname.split("/").pop();
				
				await pathways.write("todo-items/todo-item.deleted.v0", {
					data: { id },
				});

				return new Response(JSON.stringify({ success: true }), {
					headers: { "Content-Type": "application/json", ...corsHeaders },
				});
			} catch (error) {
				console.error("Error deleting todo:", error);
				return new Response(
					JSON.stringify({ error: "Failed to delete todo" }),
					{
						status: 500,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			}
		}

		// POST endpoint to receive events from Flowcore platform
		if (
			req.method === "POST" &&
			(url.pathname === "/api/transformer" ||
				url.pathname === "/api/transformer/")
		) {
			try {
				const body = await req.json();
				const event = body as FlowcoreLegacyEvent;
				const secret = req.headers.get("x-secret") ?? "";

				await pathwaysRouter.processEvent(event, secret);

				return new Response("OK", {
					status: 200,
					headers: { "Content-Type": "text/plain", ...corsHeaders },
				});
			} catch (error) {
				console.error("❌ Error processing Flowcore event:", error);
				return new Response(
					JSON.stringify({ error: (error as Error).message }),
					{
						status: 500,
						headers: { "Content-Type": "application/json", ...corsHeaders },
					},
				);
			}
		}

		return new Response("Not Found", { status: 404 });
	},
});

console.log(`🚀 Server running on http://localhost:${server.port}`);
console.log(`🌐 Frontend available at: http://localhost:${server.port}`);
console.log(
	`📡 Transformer endpoint: http://localhost:${server.port}/api/transformer`,
);
