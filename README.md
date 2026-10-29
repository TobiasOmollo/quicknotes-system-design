# QuickNotes System Design

## Description

QuickNotes is a lightweight notes client and a system-design project. The client provides a browser interface for creating, listing, and deleting notes. The documentation describes a REST API, a scalable service architecture, and a relational data model for users, notes, and tags.

The current browser client sends requests to the JSONPlaceholder test API; it is a frontend demo, not a connection to a production QuickNotes backend.

## Run the API client

1. Install Python 3 if it is not already available.
2. From the project root, start a local static web server:

   ```powershell
   py -m http.server 8000
   ```

3. Open [http://localhost:8000/](http://localhost:8000/) in a browser.
4. Use **Load saved notes** to list sample notes or **Add note** to submit one.
5. Stop the server with `Ctrl+C` in the terminal when finished.

An internet connection is needed for the demo API and externally hosted fonts.

## Design documents

- [API design](docs/api-design.md) — REST endpoints, JSON examples, and error responses.
- [Architecture](docs/architecture.md) — requirements, load assumptions, system diagram, request flows, and trade-offs.
- [Data model](docs/data-model.md) — entities, SQL schema, relationships, indexes, and example queries.

## What I learned

- **Work decomposition and strategy:** Break a broad system-design problem into focused parts—API contract, architecture, and data model—then keep their assumptions and terminology consistent.
- **CDNs:** A CDN is useful for delivering static assets close to users and reducing origin load; authenticated, user-specific API responses should not be shared-cached as public content.
- **Load balancers:** A load balancer becomes relevant when multiple app-server instances need to share traffic, scale horizontally, and route around unhealthy instances; it is unnecessary overhead for a single-instance prototype.
- **Consistency and resilience:** Caches and read replicas improve performance and capacity but introduce staleness and failover considerations, so writes and read-after-write requests need a clearly defined authoritative path.
- **Relational modeling:** Foreign keys, transactions, and a junction table make ownership and note-to-tag relationships explicit and enforceable.
