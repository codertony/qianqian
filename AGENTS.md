# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

QianQian (乾乾) is a cross-platform AI asset management CLI tool built with TypeScript and Commander.js. It manages AI Prompts, Skills, Agents, and Flows across different AI IDEs (Cursor, OpenCode, Claude Code, etc.) using a private GitHub repository as storage.

### Running the CLI

The CLI is the main application entry point. Use `tsx` to run TypeScript files directly during development:

```bash
npx tsx bin/cli.ts --help
npx tsx bin/cli.ts doctor
npx tsx bin/cli.ts config set <key> <value>
```

### Known Build Issues

- `npm run build` (`tsc`) fails because `src/index.ts` imports from unimplemented `src/features/` modules (`asset-manager`, `github-sync`, `platform-adapters`). These are planned features not yet created.
- The CLI code (`src/cli/`) is independent of the features modules and works correctly via `tsx`.
- `npm run typecheck` (`tsc --noEmit`) similarly fails due to the missing features and type re-export ambiguities in `src/index.ts`.

### Lint & Typecheck

- **Lint**: `npx eslint 'src/**/*.ts'` — passes with warnings only (unused imports in scaffolded commands).
- **Typecheck**: `npm run typecheck` — fails on `src/index.ts` (see above). Individual CLI modules typecheck fine when excluded from the library entry.

### Dev Workflow

- `npm run dev` runs `tsc --watch` but will report errors from the incomplete library entry point.
- For active CLI development, use `npx tsx bin/cli.ts <command>` to run commands directly.
- The `init` command uses interactive `inquirer` prompts — it requires a TTY. In non-interactive environments, use `config set` instead.

### Testing

- `package.json` specifies `bun test` as the test runner, but no test files exist yet and Bun is not installed. When tests are added, either install Bun or switch to a Node.js-based test runner.
