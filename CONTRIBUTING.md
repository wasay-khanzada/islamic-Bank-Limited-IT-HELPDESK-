# Contributing to IT HelpDesk System

Thanks for your interest in contributing! This document outlines the process for proposing changes.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/islamic-Bank-Limited-IT-HELPDESK-.git`
3. Create a new branch for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Install dependencies for both `frontend/` and `backend/` (see README)

## Development Workflow

- Keep pull requests focused on a single feature or fix
- Write clear, descriptive commit messages (e.g. `fix: correct SLA deadline calculation for High priority tickets`)
- Follow the existing code style (TypeScript on the frontend, ESLint/Prettier conventions)
- Test your changes locally before opening a PR

## Commit Message Convention

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — a new feature
- `fix:` — a bug fix
- `docs:` — documentation only changes
- `refactor:` — code change that doesn't fix a bug or add a feature
- `chore:` — maintenance tasks (deps, configs, etc.)

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a pull request against `master`
3. Describe what your change does and why
4. Link any related issues

## Reporting Issues

Please include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if UI-related
- Environment details (OS, Node version, browser)

## Code of Conduct

Be respectful and constructive. This is a learning/portfolio project — feedback is always welcome.
