# Tracking Task: Refactor Workout Selection Screen & Global Error Handling

- **Objective**: Implement Global Error Handling and refactor screens to utilize it.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Create centralized Global Error Handler `src/lib/error-handler.ts` ✅ Done
- [x] Categorize errors: System, Network, Database, Validation, Business ✅ Done
- [x] Refactor `app/training/weekly-plan/select-workout.tsx` to route all errors through `AppErrorHandler` ✅ Done
- [x] Refactor `src/features/training/hooks/use-active-session.ts` to route all errors through `AppErrorHandler` ✅ Done
- [x] Refactor `app/training/template/[id].tsx` to route all errors through `AppErrorHandler` & clean up imports ✅ Done
- [x] Refactor auth screens (`app/auth/register.tsx`, `app/auth/login.tsx`) to route all errors through `AppErrorHandler` ✅ Done
- [x] Add `getExerciseById` to `src/infra/repositories/exercise.repository.ts` ✅ Done
- [x] Refactor `app/training/exercise/[id].tsx` to load dynamic exercise details and remove mock data ✅ Done
- [x] Clean up unused imports, variables, and align rest day icons in `home.tsx` and `weekly-plan/[id].tsx` ✅ Done
- [x] Verify everything by type-checking and manual check ✅ Done

## Decisions & Changes
- Created `AppErrorHandler` to log errors silently and only show alerts for `BusinessError` and `ValidationError`.
- Replaced direct `Alert.alert` error calls across UI files with delegating calls to `AppErrorHandler.handleError`.
- Allowed user confirmation alerts (like deletes) and success messages to continue using native `Alert.alert`.
- Converted `app/training/exercise/[id].tsx` from a hardcoded "Bench Press" screen into a dynamic details page loading from SQL database.
- Standardized icons for rest days (using `bed-outline` consistently instead of mixing with `cafe-outline`).
