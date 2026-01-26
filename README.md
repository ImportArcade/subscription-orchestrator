# subscription-orchestrator

## Development

### Code Quality

This project uses **ESLint** and **Prettier** to maintain consistent code quality and formatting.

#### Linting

To check your code for style issues and errors:

```bash
npm run lint
```

The linter will check all TypeScript files in `src/` and `tests/` directories and report any violations.

#### Formatting

To automatically format your code:

```bash
npm run format
```

This will apply Prettier formatting rules to all TypeScript files.

#### Pre-commit Hooks with Husky

This project uses **Husky** to automatically run linting before each commit. This ensures that only code that passes linting checks can be committed to the repository.

When you attempt to commit:
1. Husky automatically runs `npm run lint`
2. If linting fails, the commit is blocked
3. Fix the issues and try committing again

**Note:** If you need to bypass the pre-commit hook (not recommended), you can use:
```bash
git commit --no-verify
```

**Setup:** Husky is automatically installed when you run `npm install`. The pre-commit hook is configured in `.husky/pre-commit`.