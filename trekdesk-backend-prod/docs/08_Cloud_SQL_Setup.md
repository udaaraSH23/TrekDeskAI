# 08 Cloud SQL Setup & Connection Guide

This document outlines the steps required to connect the local development environment to the **Google Cloud SQL (PostgreSQL)** instance.

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

1.  **Google Cloud CLI (gcloud)**: Used for authentication.
    - [Download here](https://cloud.google.com/sdk/docs/install)
2.  **Cloud SQL Auth Proxy**: The recommended way to connect securely.
    - [Download here](https://cloud.google.com/sql/docs/postgres/sql-proxy#install) (e.g., `cloud-sql-proxy.x64.exe` for Windows).

## 2. Authentication

The Cloud SQL Proxy uses **Application Default Credentials (ADC)** to verify your identity.

1.  Open your terminal.
2.  Run the following command:
    ```bash
    gcloud auth application-default login
    ```
3.  Complete the login in your browser. This saves a local JSON credential file that the proxy will automatically detect.

## 3. Starting the Proxy

To create a secure tunnel to the database, run the proxy in a dedicated terminal window.

**Instance Connection Name:** `YOUR_INSTANCE_CONNECTION_NAME`

```powershell
.\cloud-sql-proxy.x64.exe YOUR_INSTANCE_CONNECTION_NAME
```

- **Default Port**: The proxy maps the remote database to `127.0.0.1:5432`.
- **Port Conflicts**: If you have a local PostgreSQL running on 5432, you can use a different port:
  ```powershell
  .\cloud-sql-proxy.x64.exe --port 5433 YOUR_INSTANCE_CONNECTION_NAME
  ```

## 4. Environment Configuration

Update your `.env` file in the `trekdesk-backend-prod` directory to point to the proxy tunnel.

```env
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@127.0.0.1:5432/trekdesk
```

_Note: Ensure the database name `trekdesk` has been created in the Cloud SQL instance._

## 5. Database Initialization

### Creating the Database

If it's a fresh instance, you must create the `trekdesk` database. This can be done via the Google Cloud Console UI or via terminal if you have `psql` installed:

```sql
CREATE DATABASE trekdesk;
```

### Enabling Extensions (pgvector)

The backend requires `pgvector` for RAG capabilities. Connect to the `trekdesk` database and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Running Migrations

Once the database and extension are ready, scaffold the tables:

```bash
npm run migrate:up
```

## 6. Common Troubleshooting

| Issue                                    | Solution                                                                            |
| :--------------------------------------- | :---------------------------------------------------------------------------------- |
| **"Could not find default credentials"** | Run `gcloud auth application-default login`.                                        |
| **"address already in use"**             | Stop local PostgreSQL services or use the `--port` flag on the proxy.               |
| **"database does not exist"**            | Create the database manually in the Google Cloud Console under the "Databases" tab. |
| **"gen_random_uuid() not found"**        | Ensure you are using PostgreSQL 13+ (Cloud SQL defaults to 14/15/16).               |

---

_Last Updated: 2026-03-12_
