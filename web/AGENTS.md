# AGENTS.md

## Scope

These instructions apply to the React web app in `web/`.

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod

## Structure

Prefer this structure:

```text
src/
  app/
  components/
  features/
  lib/
  styles/
```

Feature folders should contain their own pages, components, API functions, types, and utilities when possible.

Example:

```text
src/features/applications/
  api/
  components/
  pages/
  types/
  utils/
```

## API Access

- Use `src/lib/apiClient.ts` for the shared Axios client.
- Use feature-level API files such as `src/features/applications/api/`.
- Do not call Axios directly inside UI components unless it is a very small temporary experiment.
- Use TanStack Query for GET requests and mutations.

## React

- Functional components only.
- Keep components small and focused.
- Extract reusable display logic into components.
- Extract reusable calculations into utils.
- Use clear loading, error, and empty states.
- Keep page components thin when logic starts to grow.

## TypeScript

- Do not use `any`.
- Type API responses.
- Keep frontend types aligned with the API.
- If API enum values are temporarily numeric, support both number and string only as a temporary bridge.

## Styling

- Keep styling simple until the feature works.
- Do not spend time on final UI polish before the feature is functional.
- Preserve the current app structure in `src/styles/` unless there is a good reason to reorganize it.

## Validation

Before calling web work complete:

- Run `npm run build`.
- Run `npm run lint` when relevant to the changed files.
- Verify changed routes and data-loading flows in the UI when possible.
