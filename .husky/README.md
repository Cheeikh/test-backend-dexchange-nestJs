# Husky Pre-commit Hooks

This directory contains Git hooks managed by Husky.

## Setup

If you haven't initialized a Git repository yet, run:

```bash
git init
```

Then install Husky hooks:

```bash
pnpm install
```

The `prepare` script in package.json will automatically set up Husky.

## What's Configured

### Pre-commit Hook

The pre-commit hook runs `lint-staged`, which will:

1. Run ESLint with auto-fix on staged `.ts` files
2. Run Prettier to format staged `.ts` files

This ensures code quality and consistent formatting before every commit.

## Manual Setup (if needed)

If Husky hooks aren't set up automatically:

```bash
pnpm exec husky install
```

## Bypassing Hooks (Not Recommended)

If you absolutely need to skip hooks:

```bash
git commit --no-verify -m "your message"
```

**Note:** Only use this in exceptional cases. Hooks are there to maintain code quality.
