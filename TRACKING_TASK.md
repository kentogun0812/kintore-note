# Tracking Task: Weekly Plan UI Refinements, Switch Alignment & Localization

- **Objective**: Refine the weekly plan list empty state UI, optimize plan activation logic, relocate and align the "Set Active" toggle inside the plan editor form, implement custom smooth animated switch matching text length, and add a search banner on the plans list page.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Refine empty state UI in `weekly-plans.tsx` (larger icon, better typography) ✅ Done
- [x] Optimize `WeeklyPlanRepository.activateWeeklyPlan` to ignore deleted records ✅ Done
- [x] Relocate `Set Active` toggle from list page to inside the detail form `[id].tsx` ✅ Done
- [x] Remove alert toast notification after plan activation state change ✅ Done
- [x] Localize toggle label dynamically with fully declared keys in `en.json` and `ja.json` ✅ Done
- [x] Adjust layout in `[id].tsx` to make the Start Date input longer and move the switch to the right ✅ Done
- [x] Implement custom Pressable switch with `width: '100%'` matching the label width ✅ Done
- [x] Add hardware-accelerated animated transition (`translateX` and opacity fade) to custom switch for smooth toggle effect ✅ Done
- [x] Clean up unused imports (`Switch`, `LayoutAnimation`, `useAuthStore`) in `[id].tsx` ✅ Done
- [x] Remove temporary unused `handleClearAll` method in `weekly-plans.tsx` ✅ Done
- [x] Add search banner UI in `weekly-plans.tsx` for searching weekly plans by name ✅ Done
- [x] Add localized empty state when search query returns no results in `en.json`, `ja.json` and list render ✅ Done
- [x] Fix `[object Object]` exercise list rendering bug in `select-workout.tsx` by using localized exercise name properties (`name_ja` / `name_en`) ✅ Done
- [x] Migrate weekly plan preset templates from hardcoded JS/i18n objects to SQLite database tables ✅ Done

## Decisions & Changes
- Resolved native `Switch` size limitations by implementing a custom CSS-like `Pressable` toggle switch that spans 100% of the parent container's width, which is automatically adjusted to match the label's width.
- Utilized React Native's `Animated` library with `useNativeDriver: true` for both the slider translation (`translateX` based on dynamic `onLayout` width measurement) and the background fade (through `opacity` overlay interpolation) to ensure butter-smooth 60fps transitions.
- Moved `Set Active` option back to the plan details form, removing the toast alert to make the experience less intrusive.
- Filtered out `syncStatus = 'deleted'` from SQLite queries in repository layer to fix zombie plans reappearing during active plan switching.
- Deleted unused imports and methods to keep codebase neat and clean.
- Migrated weekly plan preset templates to SQLite database tables `preset_weekly_plans` and `preset_weekly_plan_exercises`, removing hardcoded preset structures from typescript code and translating them dynamically using DB-seeding on startup.
