---
trigger: model_decision
---

# Coding Rules for AI Agents

This document defines the coding standards, patterns, and architectural rules that must be followed for all code changes in the `kintore-note` project.

---

## 1. General Principles

* **Scope Adherence:** Never implement features outside the requested scope. Do not change business logic outside the scope of the request.
* **Side Effect Isolation:** Always identify potential side effects before making changes. Ensure changes to one component or screen do not break others.
* **Component & Code Reuse:** Reuse existing components, hooks, services, and utilities whenever possible. Do not write duplicate code.
* **No Magic Values:** Prefer using constants from the `src/constants/` folder. Do not hardcode values such as colors, text, spacing, enums, routes, configuration values, etc.
* **Performance Optimization:** Optimize performance and avoid unnecessary re-renders, duplicate code, and redundant fallbacks. Use memoization (`useMemo`, `useCallback`, `React.memo`) appropriately.
* **Pragmatic Refactoring:** Refactor only when there is a clear, demonstrable benefit. Do not perform "while you're at it" refactors.
* **Maintainability & Stability:** Keep code clean, maintainable, and scalable. Maintain project stability at all times.

---

## 2. Project Architecture & Structure

The project follows a strict layered architecture. Directory roles are defined as follows:

| Directory | Path | Responsibility | Rules |
| :--- | :--- | :--- | :--- |
| **Screens & Layouts** | `app/` | Expo Router screen files and layouts. | Keep extremely thin. Delegate business logic to stores, hooks, or services. |
| **Components** | `src/components/` | Reusable presentational/UI components. | Must accept data/callbacks via props. Avoid direct state store/API access (except global configurations like theme). |
| **Hooks** | `src/hooks/` | Custom hooks orchestrating state & APIs. | Bridge between screens and data layer. Return derived state/actions. |
| **Constants** | `src/constants/` | Spacing, colors, typography, app configs. | No inline hex colors, magic spacing numbers, or raw configurations. |
| **i18n** | `src/i18n/` | Localization config and JSON translations. | Zero hardcoded user-facing strings in JSX. Every string must use `t()`. |
| **Infrastructure** | `src/infra/` | Remote API clients (Supabase/REST) and DB models (WatermelonDB). | Screens must never import infra layers directly. Use custom hooks instead. |
| **State Stores** | `src/store/` | Zustand stores for client state. | One store per domain (e.g. `auth.store.ts`). Use granular selectors to avoid unnecessary re-renders. |
| **Utilities** | `src/lib/` | Pure JavaScript/TypeScript functions. | Zero dependencies on React or component state. Pure and side-effect-free. |

---

## 3. Naming Conventions

| Element | Case/Format | Example |
| :--- | :--- | :--- |
| **Screen files** | `kebab-case.tsx` | `session-summary.tsx` |
| **Component files** | `PascalCase.tsx` | `ExerciseCard.tsx` |
| **Hook files** | `use-kebab-case.ts` | `use-app-lock.ts` |
| **Store files** | `kebab-case.store.ts` | `auth.store.ts` |
| **Constant files** | `kebab-case.ts` | `colors.ts` |
| **Utility files** | `kebab-case.ts` | `key-manager.ts` |
| **Interfaces / Types** | `PascalCase` | `AuthState` |
| **Zustand store hook** | `use[Name]Store` | `useAuthStore` |
| **Custom hook** | `use[Name]` | `useAppLock` |
| **Boolean variables/state** | Prefix with `is/has/should` | `isLoading`, `hasError` |
| **Handler functions** | Prefix with `handle` | `handleSubmit` |
| **Event callback props** | Prefix with `on` | `onPress`, `onClose` |

---

## 4. Internationalization (i18n)

* **No Hardcoded User-Facing Text:** All labels, placeholders, titles, error messages, and descriptions must use `t()` from `react-i18next`.
* **Synchronized Translations:** Always update **both** `src/i18n/locales/en.json` and `src/i18n/locales/ja.json` with matching keys.
* **Notation:** Use nested keys with dot notation (e.g., `t('auth.login.submit')`).
* **Interpolation:** Use i18next dynamic interpolation rather than string concatenation in JS/TS.

---

## 5. Performance & Styling

* **Re-renders:** Select only the required slice from Zustand stores.
  * *Correct:* `const user = useAuthStore(s => s.user);`
  * *Incorrect:* `const store = useAuthStore();`
* **Animations:** Use `react-native-reanimated` for all animations. Execute animations on the UI thread using worklets.
* **Lists:** Use `FlatList` or `SectionList` with a `keyExtractor`. Provide `getItemLayout` for fixed-size lists.
* **Styling Tokens:** Never use raw hex values or numbers. Import and use theme tokens:
  * Colors: `src/constants/colors.ts`
  * Spacing: `src/constants/spacing.ts`
  * Typography: `src/constants/typography.ts`

---

## 6. API, State & Database

* **TanStack Query (React Query):** Use for server/remote state. Define query keys as constants near the hook.
* **Zustand:** Use strictly for client-only state.
* **Error Handling:** Never use empty `catch` blocks. Catch and log errors with appropriate prefixes, and propagate them to the hook/UI layer for graceful user feedback.
* **Logging:** Remove all development-only logs (`console.log`) before completing a task. Wrap remaining logs in a `__DEV__` guard if appropriate.

---

## 7. Quality Assurance Checklist

Verify all items below before submitting changes:
- [ ] No hardcoded user-facing strings (all translated via `t()`).
- [ ] Key definitions added to both `en.json` and `ja.json`.
- [ ] No inline styling magic values; all reference `src/constants/`.
- [ ] TypeScript compiles cleanly with zero warnings/errors. No `any` type usage.
- [ ] Zombie/dead code, debug console logs, and unused imports are fully removed.
- [ ] Verified that modifications do not break existing components/screens.
