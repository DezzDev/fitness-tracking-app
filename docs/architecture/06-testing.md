# Testing Architecture

## 1. Test Structure

```
backend/src/__tests__/
├── unit/                         # Isolated unit tests with mocks
│   ├── services/
│   │   └── user.service.test.ts
│   ├── repositories/
│   │   └── user.repository.test.ts
│   └── utils/
│       └── jwt.utils.test.ts
├── integration/                  # Tests with real middleware chain
│   ├── auth.test.ts
│   └── users.test.ts
└── e2e/                          # Full request lifecycle tests
    └── user-flow.test.ts
```

---

## 2. Test Utilities

```
backend/src/test-utils/
├── setup.ts       # Test environment setup
├── helpers.ts     # Test helper functions
└── fixtures.ts    # Test fixtures
```

---

## 3. Configuration

| Aspect          | Detail                                                      |
|-----------------|-------------------------------------------------------------|
| Framework       | Jest 30 with ts-jest                                        |
| Mocking         | `jest-mock-extended` + `jest.mock()`                        |
| Timeout         | 10 seconds                                                  |
| Coverage target | 70% across all metrics                                      |
| Test env setup  | `NODE_ENV=test`, `JWT_SECRET=test-secret`, `LOG_LEVEL=error`|
| Global teardown | Cleans mock users (`email LIKE 'mocked-%'`)                 |
| Imports         | `@jest/globals` for test primitives                         |
| Test files      | Relative imports (not `@/` aliases)                         |

---

## 4. Commands

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `pnpm run test`          | Run all tests                        |
| `pnpm run test:unit`     | Run unit tests only (`__tests__/unit/`)         |
| `pnpm run test:integration` | Run integration tests only (`__tests__/integration/`) |
| `pnpm run test:e2e`      | Run e2e tests only (`__tests__/e2e/`)           |
| `pnpm run test:coverage` | Run tests with coverage (threshold: 70%)        |

**Run a single test file or test name:**
```bash
pnpm test -- --testPathPatterns=user.service.test.ts
pnpm test -- --testNamePattern="should create user"
```
