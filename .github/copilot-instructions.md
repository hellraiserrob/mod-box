# ModBox — Copilot Instructions

ModBox is a Chrome Extension (Manifest V3) for modifying HTTP headers, blocking requests, and redirecting URLs. Built with Vue 3 + TypeScript + Vite, it runs as a browser popup and falls back to localStorage for local development.

## Architecture

```
App.vue → FolderPanel → Folder → Tab → [Editor, Dropdown, DropdownMenu, RuleDragger]
```

- **Data flows props-down, events-up.** No state management library — a single reactive `ref<DataType>` in `App.vue` is the source of truth, persisted via a deep watcher.
- **Four rule types**: request headers, response headers, blocked requests, redirect requests. Each has its own interface, type guard, and table section in `Tab.vue`.
- **`interfaces.ts`** defines all data types _and_ runtime type guards (`isValid*` functions). Every interface change must update the matching type guard.
- **`utils.ts`** converts `DataType` into Chrome `declarativeNetRequest` rules. It also exports `isChrome` for environment detection.
- **Composables** in `src/composables/` provide reusable reactive logic (e.g., `useOutsideClick`).

## Code Style

### Vue Components

- Always use `<script setup lang="ts">` — no Options API.
- Define props with `defineProps()` using `PropType<T>` for complex types.
- Define emits with `defineEmits<{}>()` using strict type signatures.
- Use `ref()` for local state, `computed()` for derived values, `toRefs()` for destructured props.
- Keep templates declarative — avoid complex expressions; move logic to computed properties or functions.

### TypeScript

- Strict mode is enforced (`noUnusedLocals`, `noUnusedParameters`).
- Prefer interfaces over type aliases for object shapes.
- All rule data interfaces live in `src/interfaces.ts` — do not scatter type definitions across components.
- Every data interface that is loaded from storage or imported from JSON **must** have a matching `isValid*` type guard in the same file.
- Optional fields on rule interfaces (e.g., `note?: string`) must be validated in their type guard with `(field === undefined || typeof field === 'string')`.

### Styling

- Global SCSS in `src/style.scss` — no scoped styles or CSS modules.
- **BEM-inspired naming**: block (`editor`), element (`editor__trigger`), modifier (`editor__trigger--locked`).
- Use existing SCSS variables (`$bg--active`, etc.) before introducing new ones.
- Utility classes for spacing: `.mb10`, `.mb15`, `.mb20`, `.mt10`, etc.
- Transitions: use `transition: all ease 0.2s` for interactive states.
- System font stack — do not add web fonts.
- Icons are inline SVGs from Bootstrap Icons — do not introduce icon libraries.

## Chrome Extension

- **Manifest V3** — `declarativeNetRequest` for all network rule handling. Never use `webRequest` or `webRequestBlocking`.
- `isChrome` from `utils.ts` gates all Chrome API calls. Every Chrome API path must have a localStorage fallback so the app works in a normal browser during development.
- Badge text reflects the count of active generated rules.
- Service worker in `public/scripts/service-worker.js` handles `onInstalled` and `onStartup` lifecycle events.
- The popup entry point is `index.html` — keep it lean.

## Data & Persistence

- The full `DataType` object is serialised to JSON and stored in `chrome.storage.local` (or `localStorage`).
- Adding a new field to any rule interface automatically includes it in persistence, import, and export because the entire object tree is `JSON.stringify`'d. Ensure new optional fields default to a sensible value (typically `""` or `false`) in the corresponding `add*()` function in `Tab.vue`.
- Import validation uses `isValidExportPayload` which chains through `isValidFolder` → `isValidTab` → individual rule guards. A new field that is optional will pass existing imports; a required field will break them.

## Testing

- **Vitest** for all tests. Test files live alongside source: `*.test.ts`.
- Type guards in `interfaces.ts` must have tests covering: valid input, missing fields, wrong types, and optional field presence/absence.
- Rule generation in `utils.ts` must have tests covering: active/inactive states, edge cases (empty arrays, null data), and correct Chrome rule output shape.
- Use factory helpers (`createData`, `createTab`, `createHeaderRule`, etc.) already in `utils.test.ts` — extend them when adding fields rather than duplicating setup.
- Run `npx vitest run` to verify. Run `npx vue-tsc --noEmit` to type-check.

## Adding a New Rule Field

Follow this checklist when adding a property to any rule type:

1. Add the field (typically optional) to the interface in `interfaces.ts`.
2. Update the matching `isValid*` type guard in the same file.
3. Add the field with a default value in the `add*()` function in `Tab.vue`.
4. Add the UI column/cell in the corresponding `<table>` section of `Tab.vue`.
5. Add type guard tests in `interfaces.test.ts` (valid, undefined, wrong type).
6. Run tests and type-check before considering it done.

## Adding a New Rule Type

1. Define the interface and type guard in `interfaces.ts`.
2. Add the array to `TabType` and update `isValidTab`.
3. Add generation logic in `utils.ts` `generateRules()`.
4. Add the table, drag handler, add/delete functions, and actions in `Tab.vue`.
5. Add the array to `fallbackData` in `App.vue`.
6. Write tests for the type guard and rule generation.

## Build & CI

```bash
npm run test:run   # Vitest
npm run build      # vue-tsc type check + Vite production build
```

CI (`.github/workflows/ci.yml`) runs tests → type-check → build on push to `main`/`master`. Never merge if any step fails.
