# DotActiv Store Operations Dashboard

A secure, role-based store operations dashboard built for DotActiv technical assessment. The application features server-side provincial access control, real-time filtering, custom pill-styled UI components, and a robust .NET Web API backend.

---

## Tech Stack
* **Backend:** C#, ASP.NET Core Web API, Entity Framework Core, LINQ, SQL Server, xUnit (Unit Tests).
* **Frontend:** AngularJS (SPA), HTML5, CSS3, Bootstrap 5 (Customized DotActiv Branding).
* **Documentation & Tools:** Swagger / OpenAPI, Postman.

---

## Architecture & Design Trade-off Decisions

Key architectural decisions and their alternatives are outlined below:

| Component / Decision | Chosen Approach | Next Best Alternative | Rationale & Trade-offs |
| :--- | :--- | :--- | :--- |
| **Data Access** | Repository Pattern + EF Core | Generic Repository / Dapper | Balances abstraction and testability with full LINQ capabilities without over-engineering simple CRUD flows. |
| **Security & RBAC** | Stateless JWT Authentication | Cookie-Based / Session Auth | Simplifies decoupled client-server architecture and allows seamless testing via Swagger and Postman. |
| **Error Handling** | RFC 7807 `ProblemDetails` (`IExceptionHandler`) | Global Try-Catch Middleware | Standardizes API error responses uniformly across the application following modern .NET best practices. |
| **Frontend Setup** | AngularJS via CDN  | Node.js / Angular CLI (TypeScript) | Optimizes delivery for the 3–5 hour assessment window, avoiding heavy build-tool configurations while keeping code clean. |

---

## Setup Instructions & Database Configuration

### 1. Database Setup
1. Ensure **SQL Server** is running locally.
2. Execute the provided SQL script located in `/database/schema_and_seed.sql` to create the tables (`tRoles`, `tUsers`, `tStores`) and seed the test credentials and initial store data.

### 2. Running the Backend API
1. Navigate to the `/backend` directory.
2. Update your connection string in `appsettings.json` if necessary to point to your local SQL Server instance.
3. Run the application:
   ```bash
   dotnet restore
   dotnet run
