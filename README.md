# todo-app

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.6. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Environment Variables

| Variable                     | Type   | Description                                 | Default      | Required |
|------------------------------|--------|---------------------------------------------|--------------|----------|
| FLOWCORE_API_KEY             | string | API key for Flowcore                        | -            | ✓        |
| POSTGRES_URL                 | string | Postgres connection string                  | -            | ✓        |
| FLOWCORE_WEBHOOK_BASE_URL    | string | Base URL for Flowcore webhooks              | -            | ✓        |
| FLOWCORE_TENANT              | string | Flowcore tenant name                        | -            | ✓        |
| FLOWCORE_DATA_CORE           | string | Flowcore data core name                     | "todo-app"  |          |
