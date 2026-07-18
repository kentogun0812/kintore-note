# AI Agent Rules — kintore-note

> These rules are **mandatory** for every code change, refactor, or new feature.
> Violations are considered bugs.

---

## 1. Project Structure — Do Not Break

```
app/            → Expo Router screens & layouts only (no business logic)
src/
  components/   → Reusable UI components (*.tsx)
  constants/    → Design tokens & app config (colors, spacing, typography, app)
  hooks/        → Custom React hooks (use-*.ts)
  i18n/         → i18next config + locale JSON files (en.json, ja.json)
  infra/        → Infrastructure layer
    api/        → Remote API clients (Supabase client, REST)
    db/         → WatermelonDB schema, models, database, sync
  lib/          → Pure utility functions (no React, no state)
  store/        → Zustand stores (*.store.ts)
database/       → Raw SQL (migrations, seeds)
assets/         → Static assets (images, fonts)
```

**Rules:**
- Never move, rename, or merge these directories without explicit approval.
- New files must go in the correct directory by type. When uncertain, ask.
- Screen files in `app/` must remain thin — delegate logic to hooks/stores/services.

---

## 2. Internationalization (i18n) — No Hardcoded Text

- **Every** user-facing string must use `t()` from `react-i18next`.
- Add keys to **both** `src/i18n/locales/en.json` and `src/i18n/locales/ja.json`.
- Use nested keys with dot notation: `t('screen.section.label')`.
- Never use string literals in JSX for labels, titles, messages, errors, or placeholders.
- Interpolation: `t('greeting', { name })` — never concatenate translated strings.

```tsx
// ✅ Correct
<Text>{t('home.welcomeBack')}</Text>

// ❌ Forbidden
<Text>Welcome Back</Text>
```

---

## 3. Constants — No Magic Values

| Type | Location |
|------|----------|
| Colors | `src/constants/colors.ts` |
| Spacing | `src/constants/spacing.ts` |
| Typography | `src/constants/typography.ts` |
| App config | `src/constants/app.ts` |

**Rules:**
- Never write inline hex colors, raw spacing numbers, or font sizes directly in components.
- Always reference the existing design token. If a token doesn't exist, add it first.
- Config values (timeouts, limits, feature flags) go in `src/constants/app.ts`.

---

## 4. Code Quality — Clean, DRY, Maintainable

- **No dead code.** Remove unused imports, variables, functions, and commented-out blocks.
- **No duplication.** If logic appears in 2+ places, extract to a shared hook, util, or component.
- **Single Responsibility.** Each file/function does one thing well.
- **Small functions.** If a function exceeds ~40 lines, consider splitting.
- **TypeScript strictly.** No `any` type. Define interfaces/types for all data shapes.
- **Explicit return types** on exported functions and hooks.

---

## 5. Behavior Preservation — Change Only What's Asked

- Do **not** alter existing behavior, UI, or logic unless the task explicitly requires it.
- Do **not** refactor adjacent code "while you're at it" without approval.
- Do **not** change API contracts, store shapes, or DB schemas as a side effect.
- When fixing a bug, write the minimal change that resolves the issue.

---

## 6. Side Effect Isolation

- Changes to one screen must **not** break other screens.
- Changes to a shared component must be verified against **all** consumers.
- Store mutations must not introduce unintended state changes in other slices.
- New dependencies require explicit approval.

---

## 7. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Screen file | `kebab-case.tsx` | `session-summary.tsx` |
| Component file | `PascalCase.tsx` | `ExerciseCard.tsx` |
| Hook file | `use-kebab-case.ts` | `use-app-lock.ts` |
| Store file | `kebab-case.store.ts` | `auth.store.ts` |
| Constant file | `kebab-case.ts` | `colors.ts` |
| Utility file | `kebab-case.ts` | `key-manager.ts` |
| Interface/Type | `PascalCase` | `AuthState` |
| Zustand store hook | `use[Name]Store` | `useAuthStore` |
| Custom hook | `use[Name]` | `useAppLock` |
| Boolean state | `is/has/should` prefix | `isLoading`, `hasError` |
| Handler function | `handle[Action]` | `handleSubmit` |
| Event prop | `on[Event]` | `onPress`, `onClose` |

---

## 8. Performance

### Re-renders
- Memoize expensive computations with `useMemo`.
- Memoize callbacks passed to children with `useCallback`.
- Use `React.memo` for pure presentational components that receive stable props.
- Select only needed state from Zustand stores: `useAuthStore(s => s.user)`, **not** `useAuthStore()`.

### Animations
- Use `react-native-reanimated` for all animations — never `Animated` from React Native.
- Run animations on the UI thread with worklets. Avoid `runOnJS` unless absolutely required.

### Lists
- Use `FlatList` or `SectionList` with `keyExtractor` for all scrollable lists.
- Provide `getItemLayout` when item sizes are known.

### API
- No redundant API calls. Deduplicate with `@tanstack/react-query` caching.
- Set appropriate `staleTime` and `gcTime` per query.
- Never call APIs inside render — always in `useEffect`, event handlers, or React Query hooks.

---

## 9. Architecture Layers — Strict Separation

```
┌─────────────────┐
│  Screen (app/)   │  → Layout + composition only
├─────────────────┤
│  Components      │  → Reusable UI, accepts props, no direct store/API access
├─────────────────┤
│  Hooks           │  → Orchestrates store + service calls, returns derived state
├─────────────────┤
│  Store (Zustand)  │  → Client state management
├─────────────────┤
│  Infra (API/DB)   │  → Data access, never imported directly in screens
├─────────────────┤
│  Lib             │  → Pure functions, zero dependencies on React
└─────────────────┘
```

**Rules:**
- Screens import hooks and components — never `infra/` directly.
- Components receive data via props — never read from stores directly (exception: global UI state like theme).
- Hooks are the bridge between screens and data layers.
- `lib/` functions must be pure — no side effects, no React imports.

---

## 10. State Management (Zustand)

- One store per domain: `auth.store.ts`, `training.store.ts`, `workout.store.ts`, etc.
- Store files export a single `use[Name]Store` hook.
- Keep stores flat — avoid deeply nested state.
- Derived state should be computed via selectors, not stored redundantly.
- Async operations (API calls) inside store actions must handle loading/error states.
- Reset functions: every store that holds session-scoped data must expose a `reset()` action.

```ts
// ✅ Selector — only re-renders when `user` changes
const user = useAuthStore(s => s.user);

// ❌ Subscribes to entire store — re-renders on any change
const store = useAuthStore();
```

---

## 11. API & Service Layer

- All remote calls go through `src/infra/api/`.
- All local DB calls go through `src/infra/db/`.
- Use `@tanstack/react-query` for server state. Zustand is for client-only state.
- Service functions must:
  - Accept typed parameters.
  - Return typed responses.
  - Throw typed errors (never swallow silently).
- Query keys must be constants, defined near the query function.

```ts
// ✅
export const exerciseKeys = {
  all: ['exercises'] as const,
  detail: (id: string) => ['exercises', id] as const,
};
```

---

## 12. Error Handling

- **Never** use empty `catch` blocks. At minimum, log the error.
- User-facing errors must use i18n translated messages.
- API errors: catch at the hook/query level, surface to UI via state.
- Validation errors: handle before API call, show inline feedback.
- Use `try/catch` only for operations that can genuinely fail (I/O, network, parsing).
- Critical failures (auth, DB init) must degrade gracefully — never crash silently.

```ts
// ✅
try {
  await saveExercise(data);
} catch (error) {
  console.error('[ExerciseService] saveExercise failed:', error);
  throw error; // let the caller (hook/query) handle UI feedback
}

// ❌
try {
  await saveExercise(data);
} catch (e) {
  // silently ignored
}
```

---

## 13. Logging & Debug

- Use descriptive prefixes: `[StoreName]`, `[ServiceName]`, `[ScreenName]`.
- Log levels:
  - `console.error` → Unexpected failures, caught exceptions.
  - `console.warn` → Recoverable issues, deprecations.
  - `console.log` → Development-only debug info (remove before PR).
- Never log sensitive data (tokens, passwords, PII).
- Never leave `console.log` statements in production code — use `__DEV__` guard.

```ts
if (__DEV__) {
  console.log('[TrainingStore] session started:', sessionId);
}
```

---

## 14. File Change Checklist

Before completing any task, verify:

- [ ] No hardcoded user-facing strings — all use `t()`.
- [ ] Both `en.json` and `ja.json` updated if new keys added.
- [ ] No inline colors/spacing — all reference `constants/`.
- [ ] No unused imports or dead code.
- [ ] No duplicated logic.
- [ ] Existing behavior unchanged (unless explicitly requested).
- [ ] TypeScript compiles with zero errors.
- [ ] Zustand selectors are granular (not subscribing to whole store).
- [ ] Errors are caught, logged, and surfaced appropriately.
- [ ] Naming conventions followed.
