# Architecture Rules

## Modular Monolith

Build the application as a **modular monolith**, not microservices.

Keep one Next.js application and one Postgres database, organized into clear business/feature modules.

```text
src/
  app/
  modules/
    tasks/
      domain.ts
      dal.ts
      actions.ts
      types.ts
      components/
    settings/
      domain.ts
      dal.ts
      actions.ts
      types.ts
      components/
```

Not every module needs every file. Do not create abstractions merely for structure.

## Keep Domains Independent

Each domain owns its own business rules and operations.

> **Callers compose domains; domains own business rules.**

The caller/presentation layer should decide what data or operation it needs and compose multiple domains where practical.

Avoid making one domain reach into another domain merely for presentation, filtering, or convenience.

If a genuine business rule requires one domain to use another:

- Make the dependency explicit.
- Call the other domain through its public interface.
- Never reach into its DAL or internal implementation.
- Treat cross-domain dependencies as an architectural decision.

## DAL

The DAL owns **database access only**.

Its responsibility is:

> How do we read/write this data?

The DAL may use Supabase.

Business rules do not belong in the DAL.

## Domain

The domain owns **business operations and rules**.

Its responsibility is:

> What does this operation mean, and is it allowed?

Business rules belong here, not in DALs, API routes, Server Actions, pages, or components.

The domain calls the DAL when persistence is required.

Prefer explicit domain operations that express caller intent.

For example:

```text
listActiveTasks()
listAllTasks()
listArchivedTasks()
```

The domain defines what these operations mean. The caller decides which one it needs.

## Server Actions

Server Actions are a **Next.js transport/adapter mechanism for web mutations**.

```text
Web form/button
    -> Server Action
        -> Domain
            -> DAL
                -> Supabase/Postgres
```

Server Actions should not contain business rules or direct database access.

## API

API routes are the transport layer for remote clients such as future Mobile or CLI applications.

```text
Mobile / CLI
    -> API
        -> Domain
            -> DAL
                -> Supabase/Postgres
```

API routes should not contain business rules or direct database access.

## Server-rendered Pages

Server-rendered Next.js pages should **not call our own API**.

They can call the domain and/or DAL directly as appropriate.

```text
Server-rendered page
    -> Domain / DAL
        -> Supabase/Postgres
```

Do not go through `/api/...` simply to reach the database.

Client Components may use Server Actions for mutations. If a Client Component genuinely needs an API endpoint, it may call the API.

## Dependency Direction

The intended direction is:

```text
Page
    -> Domain / DAL
        -> Database

Web mutation
    -> Server Action
        -> Domain
            -> DAL
                -> Database

Mobile / CLI
    -> API
        -> Domain
            -> DAL
                -> Database
```

Avoid these dependencies:

```text
Page -> Supabase
Component -> Supabase
API -> Supabase
Server Action -> Supabase
API -> Server Action
DAL -> API
```

Do not introduce a generic service layer. The domain layer is the application/business layer.

## Multi-user / Multi-tenant Safety

The application will eventually be multi-user and multi-tenant.

Never use module-scoped mutable state for request-specific, user-specific, or tenant-specific data.

For example, do not do:

```ts
let currentUser = ...
let currentTenant = ...
```

Module-scoped state may be shared across requests within a server process.

Request, user, and tenant context must be derived safely from the current request/session and passed through the appropriate layers.

## Separation of Responsibilities

Keep these responsibilities clear:

```text
app/
  Next.js routing, presentation, composition, transport

modules/*/domain.ts
  Business operations and rules

modules/*/dal.ts
  Persistence/database access

modules/*/actions.ts
  Next.js Server Actions

app/api/*
  HTTP/API transport
```

Pages and components should not contain database access or business rules.

API routes and Server Actions should not become alternate business layers.

## Avoid Accidental Coupling

When one module needs another, ask:

1. Is this a genuine business dependency?
2. Could the caller compose these concerns instead?
3. Am I doing this merely for convenience?
4. Am I bypassing the other domain's public interface?
5. Does this make the module harder to reuse independently?

If the dependency is not clearly justified, keep the domains independent.

## Prefer Simplicity

Use the simplest architecture that preserves these boundaries.

Do not create empty layers, generic services, interfaces, or abstractions without a concrete reason.

The architecture should remain practical for one engineer maintaining a small-to-mid-sized SaaS application.