# todo-app

A modern todo list application built with Flowcore Pathways, featuring a beautiful web frontend and event-driven architecture.

## Features

- ✅ **Modern Web Interface**: Clean, responsive design with smooth animations
- 🔄 **Event-Driven Architecture**: Uses Flowcore Pathways for robust event handling
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎯 **Smart Filtering**: View all, active, or completed todos
- ✏️ **Inline Editing**: Edit todos directly in the list
- 🚀 **Real-time Updates**: Instant feedback with toast notifications
- 🎨 **Beautiful UI**: Modern design with gradient backgrounds and smooth transitions

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set up Database

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

The database will be initialized automatically with the required tables and sample data.

### 3. Configure Environment

Copy the example environment file and update with your Flowcore credentials:

```bash
cp .env.example .env
```

### 4. Run the Application

```bash
bun run index.ts
```

### 5. Access the Frontend

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/todos

## Usage

### Web Interface

The frontend provides an intuitive interface for managing your todos:

1. **Add New Todos**: Use the form at the top to add new todos with optional descriptions
2. **Mark as Complete**: Click the checkbox to toggle completion status
3. **Edit Todos**: Click the "Edit" button to modify title and description inline
4. **Delete Todos**: Click the "Delete" button to remove todos (with confirmation)
5. **Filter Views**: Use the filter buttons to view All, Active, or Completed todos
6. **Keyboard Shortcuts**: Press Enter in the title field to quickly add todos, Escape to cancel edits

### API Endpoints

The application also exposes REST API endpoints:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

This project was created using `bun init` in bun v1.2.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Environment Variables

| Variable                     | Type   | Description                                 | Default      | Required |
|------------------------------|--------|---------------------------------------------|--------------|----------|
| FLOWCORE_API_KEY             | string | API key for Flowcore                        | -            | ✓        |
| POSTGRES_URL                 | string | Postgres connection string                  | -            | ✓        |
| FLOWCORE_WEBHOOK_BASE_URL    | string | Base URL for Flowcore webhooks              | -            | ✓        |
| FLOWCORE_TENANT              | string | Flowcore tenant name                        | -            | ✓        |
| FLOWCORE_DATA_CORE           | string | Flowcore data core name                     | "todo-app"  |          |
