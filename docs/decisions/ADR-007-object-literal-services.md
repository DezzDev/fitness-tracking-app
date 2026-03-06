# ADR-007: Object Literals Over Classes for Services

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend

## Context

Backend services contain the business logic of the application. A pattern is needed for how these services are defined and exported. Common options are ES6 classes (instantiated or singleton) or plain object literals with functions.

## Decision

Export services as **plain object literals**, not classes.

```typescript
// Pattern used
export const userService = {
  async getById(id: string) { ... },
  async create(data: UserCreateData) { ... },
};

// Pattern NOT used
export class UserService {
  async getById(id: string) { ... }
}
```

## Rationale

- **Stateless**: Services in this application hold no instance state. There are no constructor parameters, no injected dependencies stored as properties. An object literal accurately reflects this -- it is a namespace for related functions.
- **Simpler**: No `new` keyword, no `this` context issues, no need for singleton patterns or DI containers.
- **Tree-shakeable**: Named exports from object literals can be individually imported and tree-shaken by bundlers. Class methods cannot.
- **Easier mocking**: `jest.mock()` and `jest.spyOn()` work naturally with exported object properties. Class mocking requires additional setup.

## Consequences

- **No inheritance**: If a service needed to extend another, classes would be more natural. This has not been needed.
- **No interfaces via `implements`**: TypeScript interfaces on classes provide a contract. With object literals, the contract is the `typeof` the export or a manually defined type.
- **Convention-dependent**: Nothing enforces that all services follow this pattern. It is a project convention documented in AGENTS.md.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| ES6 classes (singleton) | Adds `this` context, constructor boilerplate, and a singleton pattern for no benefit when services are stateless |
| ES6 classes with DI (NestJS-style) | Requires a DI container; excessive for a project using plain Express |
| Standalone exported functions | Loses the namespace grouping that object literals provide (e.g., `userService.create` vs. `createUser`) |

## References

- Service layer: `docs/architecture/02-backend.md` (section 2)
- AGENTS.md naming conventions: "Services: Exported as object literals, not classes"
