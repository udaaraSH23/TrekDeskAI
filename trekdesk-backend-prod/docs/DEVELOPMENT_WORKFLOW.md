# 07 Development Workflow

## Overview

The TrekDesk AI backend enforces strict code quality and formatting standards using automated tools and Git hooks. This ensures a clean, identical codebase regardless of the developer environment and prevents basic syntactic errors from entering version control.

## Tooling Stack

- **ESLint**: Static code analysis tool configured with `@typescript-eslint` to identify and reporting on patterns found in TypeScript code, preventing runtime errors and enforcing logical consistency.
- **Prettier**: An opinionated code formatter that enforces uniform style (e.g., spacing, line lengths, quotes).
- **Husky**: A Git hook management tool that allows us to run scripts right before key Git actions (like `commit` or `push`).
- **lint-staged**: A utility that runs linters and formatters _only_ against files staged for commit. This dramatically speeds up the pre-commit process by only checking changed code.

## The Git Pre-Commit Hook

When a developer runs `git commit`, Husky intercepts the action and executes `.husky/pre-commit`.

1. The hook triggers `lint-staged`.
2. `lint-staged` inspects all staged `.ts`, `.json`, and `.md` files.
3. It runs `prettier --write` on these files to forcibly fix formatting.
4. It then runs `eslint --fix` on the TypeScript files to correct any automatically fixable linting errors.
5. If ESLint detects a critical error that it cannot fix automatically (e.g., an unused variable or missing import type), it throws a non-zero exit code.
6. **Husky aborts the commit.** The developer must manually fix the issue before the code is allowed into the repository.

## NPM Scripts

The following scripts are exposed in `package.json` for manual execution:

- `npm run format`: Runs Prettier aggressively across the entire codebase (`src/`, `docs/`, config files), ignoring paths listed in `.prettierignore`.
- `npm run lint`: Runs ESLint across the `src/` directory to analyze `.ts` files and lists errors/warnings in the console.
- `npm run lint:fix`: Runs ESLint with the `--fix` flag to automatically resolve as many structural issues as possible.

## Best Practices

- Always ensure your IDE is configured with Prettier and ESLint plugins so you receive visual feedback while typing.
- Never bypass the Git hooks (`--no-verify`) unless strictly necessary in an emergency fix. Code committed without formatting will be flagged in CI/CD pipelines.

---

## Related Docs

- `ARCHITECTURE.md`
- `CLOUD_SQL_SETUP.md`
