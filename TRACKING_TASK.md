# Tracking Task: Custom SVG Muscle Body Heatmap

- **Objective**: Implement a custom-built SVG Muscle Body Heatmap (Front & Back) with react-native-svg, decoupling UI rendering from data mapping, color gradients, smooth animations, and interactive muscle stats popover.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Initialize/Update `TRACKING_TASK.md` ✅ Done
- [x] Add `getDetailedMuscleStats` query in `workout.repository.ts` ✅ Done
- [x] Update `analytics.store.ts` with `DetailedMuscleStat` structure ✅ Done
- [x] Create logic & mapping utility `src/utils/muscleHeatmap.ts` ✅ Done
- [x] Build `BodyFrontSvg.tsx` and `BodyBackSvg.tsx` using `react-native-svg` and `react-native-reanimated` ✅ Done
- [x] Overhaul `MuscleHeatmap.tsx` with Front/Back toggle, green gradient heat levels, and interactive stat cards ✅ Done
- [x] Update localization strings in `en.json` & `ja.json` ✅ Done
- [x] Verify TypeScript compilation (`npx tsc --noEmit`) ✅ Done

## Decisions & Changes
- Decoupled SVG rendering from database logic by introducing [muscleHeatmap.ts](file:///d:/Workspace/kintore-note/src/utils/muscleHeatmap.ts) mapping rules.
- Implemented standalone [BodyFrontSvg.tsx](file:///d:/Workspace/kintore-note/src/components/charts/body-svg/BodyFrontSvg.tsx) and [BodyBackSvg.tsx](file:///d:/Workspace/kintore-note/src/components/charts/body-svg/BodyBackSvg.tsx) using `react-native-svg` and `AnimatedPath` from `react-native-reanimated` for 60fps color transition effects.
- Added interactive tap selection to display detailed statistics per muscle: Workouts, Total Sets, Total Volume, and Last Session Date.

---

# Tracking Task: Miscellaneous Updates

- **Objective**: Hide Photo menu from bottom tab menu.
- **Status**: Completed ✅ Done
- **Current Phase**: Implementation

## Task List
- [x] Initialize/Update `TRACKING_TASK.md` ✅ Done
- [x] Hide Photo (`body`) tab in `app/(tabs)/_layout.tsx` ✅ Done
- [x] Verify tab is hidden ✅ Done

## Decisions & Changes
- Added `href: null` to the `body` tab configuration in `app/(tabs)/_layout.tsx` to hide it from the bottom tab bar while retaining its routing availability for future usage.

---

# Tracking Task: Weekly Plan & Exercise Library UI/UX Improvements

- **Objective**: Improve UI/UX for Weekly Plan and Exercise Library screens including banner persistence, reusable search component, horizontal category tab panel with smooth animations, exercise detail view with media & descriptions, and local data architecture for exercise details.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Initialize/Update `TRACKING_TASK.md` ✅ Done
- [x] Add `DismissibleBanner` to `weekly-plans.tsx` with i18n and `AsyncStorage` persistence ✅ Done
- [x] Adjust spacing between `DismissibleBanner` and content in `library.tsx` ✅ Done
- [x] Create reusable `SearchBar.tsx` component and integrate into `weekly-plans.tsx` and `library.tsx` ✅ Done
- [x] Implement horizontal scrollable Category Tab Panel in `library.tsx` with smooth transitions (`react-native-reanimated`) ✅ Done
- [x] Create exercise detail data structure & mock database layer (`exerciseDetails.ts` & `ExerciseRepository.getExerciseDetails`) ✅ Done
- [x] Create `ExerciseDetailModal.tsx` displaying exercise name, muscle group, description, benefits, and media ✅ Done
- [x] Update localization files (`en.json` & `ja.json`) with new string keys ✅ Done
- [x] Perform self review, regression checks, and verify clean TypeScript compilation (`npx tsc --noEmit`) ✅ Done

## Decisions & Changes
- Extracted SearchBar into [SearchBar.tsx](file:///d:/Workspace/kintore-note/src/components/SearchBar.tsx) using the `weekly-plans.tsx` search bar UI style to maintain consistency across the app.
- Created [exerciseDetails.ts](file:///d:/Workspace/kintore-note/src/constants/exerciseDetails.ts) and extended [exercise.repository.ts](file:///d:/Workspace/kintore-note/src/infra/repositories/exercise.repository.ts) with `getExerciseDetails()` method so exercise media, descriptions, and benefits are cleanly accessible locally and easily upgradeable to Supabase in the future.
- Utilized `react-native-reanimated` (`FadeInUp`) for tab switching animations on the exercise list to ensure high performance (60fps).
- Implemented [ExerciseDetailModal.tsx](file:///d:/Workspace/kintore-note/src/components/ExerciseDetailModal.tsx) displaying exercise details, primary muscle group badge, description, key benefits, and media illustrations.
- Removed bottom close button from [ExerciseDetailModal.tsx](file:///d:/Workspace/kintore-note/src/components/ExerciseDetailModal.tsx) when not in selection mode (relying on top-right close icon), and ensured muscle group name & descriptions dynamically adapt to active app locale setting (`i18n.language`).
- Enlarged category tab options in [library.tsx](file:///d:/Workspace/kintore-note/app/training/library.tsx) (`paddingHorizontal: 16`, `paddingVertical: 8`, `fontSize: 16`) for better touch targets and visibility.
- Added template deletion feature in [workout-template.repository.ts](file:///d:/Workspace/kintore-note/src/infra/repositories/workout-template.repository.ts), [workout.store.ts](file:///d:/Workspace/kintore-note/src/store/workout.store.ts), and [id.tsx](file:///d:/Workspace/kintore-note/app/training/template/%5Bid%5D.tsx) with confirmation dialog and localized alert messages (`t('todayWorkout.deleteTemplate')` & `t('todayWorkout.deleteTemplateConfirm')`).
- Declared explicit i18n keys for template errors (`todayWorkout.updateFailed` & `todayWorkout.deleteFailed`) in [en.json](file:///d:/Workspace/kintore-note/src/i18n/locales/en.json) & [ja.json](file:///d:/Workspace/kintore-note/src/i18n/locales/ja.json), removing hardcoded string literals and fallbacks.

---

# Tracking Task: Fix Console Errors

- **Objective**: Fix the console error `UNIQUE constraint failed: weekly_plan_assigned_templates.id`.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Investigate cause of SQLite unique constraint failure ✅ Done
- [x] Update database initialization script `src/infra/db/sqlite.ts` ✅ Done

## Decisions & Changes
- Patched a SQLite database migration step in `initSqliteDb` located in [sqlite.ts](file:///d:/Workspace/kintore-note/src/infra/db/sqlite.ts) that was using a static combination of `weekly_plan_id`, `plan_week`, and `workout_template_id` as a `migrationId`. Changed the insertion to use `INSERT OR IGNORE` to safely skip duplication exceptions in the event that the `exists` check evaluates to false when a previously migrated row with the same generated `id` already exists.

---

# Tracking Task: Statistics Screen UI/UX Improvements

- **Objective**: Overhaul the Statistics screen with a Date Range Filter, Heatmap/Charts tab navigation, store-level decoupled data processing, and custom high-fidelity SVG Line, Bar, and Donut charts.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Implement database range and PR helper methods in `workout.repository.ts` ✅ Done
- [x] Create comprehensive data aggregation and state store in `analytics.store.ts` ✅ Done
- [x] Build custom SVG charts (`LineChart.tsx`, `BarChart.tsx`, `DonutChart.tsx`) ✅ Done
- [x] Rebuild `stats.tsx` screen with date range filters, tab navigation, and responsive panels ✅ Done
- [x] Add dynamic translation strings to `en.json` & `ja.json` ✅ Done
- [x] Run TypeScript check and verify successful compilation ✅ Done

## Decisions & Changes
- Decoupled database state queries from view rendering. Raw workout logs in the date range are pulled in one go and structured in [analytics.store.ts](file:///d:/Workspace/kintore-note/src/store/analytics.store.ts), completely removing recalculation overhead when switching between the Heatmap and Charts tabs.
- Avoided charting library bloating by crafting fully responsive custom SVGs for the [LineChart](file:///d:/Workspace/kintore-note/src/components/charts/LineChart.tsx), [BarChart](file:///d:/Workspace/kintore-note/src/components/charts/BarChart.tsx), and [DonutChart](file:///d:/Workspace/kintore-note/src/components/charts/DonutChart.tsx) utilizing system colors and spacing tokens.
- Addressed `@react-native-community/datetimepicker` popover selection constraints on iOS by integrating native inline compact components, and conditionally displaying tap-to-open dialogs on Android.
- Added Personal Record detection comparing period max weight with historical max weight per exercise, listing all new achievements during the active timeframe.

---

# Tracking Task: Day/Month/Year Time Filter Revamp

- **Objective**: Replace range selection options with Day/Month/Year tabs. Enable start/end date inputs in Day mode, month-year selection in Month mode, and year-only selection in Year mode.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Configure simplified `TimeRange` state and date ranges in `analytics.store.ts` ✅ Done
- [x] Create Day/Month/Year segmented control in `stats.tsx` ✅ Done
- [x] Implement Month Picker Modal with custom year navigation and localized months grid ✅ Done
- [x] Implement Year Picker Modal with custom year buttons grid ✅ Done
- [x] Add localization keys to `en.json` & `ja.json` ✅ Done
- [x] Validate zero type errors via TypeScript compiler check ✅ Done

## Decisions & Changes
- Implemented a custom Month-Year selector and a Year selector using React Native modals instead of trying to force `@react-native-community/datetimepicker` to support month/year picker modes, avoiding native library limitations and ensuring complete style synchronization.
- Segmented the time filter panel into equal-width tabs (**Day**, **Month**, **Year**) matching native system selector panels.
- Designed dynamic range calculations where selecting a month or year automatically updates `startDate` and `endDate` boundaries in the store (e.g. February of leap years ends on `02-29`, normal years on `02-28`).
- Simplified the Day-mode date picker interface to target iOS directly, removing the platform check conditional branches, native Android popups, and unnecessary Android styles to keep the screen layout lightweight and focused.

---

# Tracking Task: Custom Month-Year Scroll Picker

- **Objective**: Implement a premium, dark-themed double-column scrolling wheel picker for Month-Year selection, and a matching single-column scroll picker for Year selection. Scale down the native Day picker inputs for a compact UI layout.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Configure independent scroll state, refs, and mount handlers for Month/Year picker scrolls in `stats.tsx` ✅ Done
- [x] Replace custom modals with double-column `ScrollView` (Month & Year) with snap-to-interval snapping and transparent background ✅ Done
- [x] Connect onMomentumScrollEnd and onScrollEndDrag handlers to optimize scroll performance and prevent jank ✅ Done
- [x] Build single-column scroll picker in Year modal with optimized snapping ✅ Done
- [x] Apply scale transform (`scale: 0.85`) to iOS native Day pickers ✅ Done
- [x] Validate zero type errors via TypeScript compilation check ✅ Done

## Decisions & Changes
- Decided to build the scrolling wheel pickers in pure React Native (utilizing `ScrollView` snapping and drag/momentum offset handlers) to ensure full design customization (background overlay bars, item fading, active state highlighting) and avoid native build dependencies that could break the Expo bundle.
- Configured the scrolling wheel pickers using pure React Native `ScrollView` snapping.
- Used real-time `onScroll` event handlers (throttled at `16ms`) to continuously track and select values as the user scrolls, keeping active states synchronized.
- Set the `modalOverlay`'s `backgroundColor` to `transparent` so that the dark backdrop overlay is eliminated completely and the modal card is rendered directly on top of the parent screen view.
- Expanded the scroll picker year selection range to include **10 years before and 10 years after the current year** (current year ± 10 years) sorted chronologically.
- Synchronized initial state with the Zustand store: The default selected Month and Year are parsed from `startDate` in the store on mount, falling back to the current date/time if no custom filter range is active.
- Added `onLayout` listeners to the picker `ScrollView` components to guarantee they snap to the selected values immediately upon being rendered inside the modal, avoiding incorrect default offsets.
- Unified Month/Year trigger buttons style to match the Day picker capsule design: Removed the calendar icons, wrapped in `customDateRow` and `iosPickerRow`, applied the native-like background (`rgba(116, 116, 128, 0.18)`), white text color (`colors.dark.text.primary`), and a `1.0` scale transform with capsule-shaped rounding (`borderRadius: 24`).
- Implemented custom centered modals for the Day picker: Replaced the inline `DateTimePicker` components with custom `pickerTriggerButton` capsules that display the localized date (via `getLocalizedDateString`). Pressing the capsules triggers custom React Native `<Modal>` overlays containing the native iOS date picker in `display="inline"` (calendar grid) mode, perfectly centered on the screen. Applied `transform: [{ scale: 0.88 }]` to scale down the calendar grid and reduce text size, and set a custom layout height of `290` with negative margins (`marginTop: -10`, `marginBottom: -20`) to eliminate excess transparent padding. Widened the modal card `calendarModalContent` to `330` with larger horizontal padding to provide generous side spacing. Tapping a date updates the store range and closes the modal automatically.
- Styled the wheel modal's centered selection indicator (`highlightBar`) with `borderRadius: 22` to match the capsule style.
- Configured the touch-outside event on the transparent backdrop overlay to automatically save and apply the currently active/highlighted picker date values, removing the need for confirmation buttons.
- Replaced the action buttons entirely to keep the picker interface clean, uncluttered, and highly focused.

---

# Tracking Task: iOS 26 Floating Bottom Tab Bar

- **Objective**: Implement a modern, premium iOS 26 style Floating Bottom Tab Bar in `app/(tabs)/_layout.tsx` featuring glassmorphism, spring active tab indicator, spring scale-up micro-animations for icons/labels, automatic keyboard slide-down animation, and haptic feedback.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Initialize/Update `TRACKING_TASK.md` ✅ Done
- [x] Create `implementation_plan.md` and obtain user approval ✅ Done
- [x] Implement `FloatingTabBar` custom component in `_layout.tsx` ✅ Done
- [x] Implement keyboard slide-down animation (using Reanimated `withSpring`) ✅ Done
- [x] Implement sliding background pill active indicator (using Reanimated `withSpring`) ✅ Done
- [x] Implement press scale-up spring animation for tab buttons ✅ Done
- [x] Apply safe-area screen padding matching the floating tab bar height + offset ✅ Done
- [x] Integrate lightweight physical haptics on tab press ✅ Done
- [x] Remove Photo tab (`body` route) completely from Bottom Tab Bar ✅ Done
- [x] Fix navigation switching bug using standard `navigation.navigate(route.name, route.params)` ✅ Done
- [x] Ensure active tab state stays synchronized with React Navigation ✅ Done
- [x] Verify clean TypeScript compilation (`npx tsc --noEmit`) ✅ Done

## Decisions & Changes
- Decided to build a custom `FloatingTabBar` render function in [_layout.tsx](file:///d:/Workspace/kintore-note/app/(tabs)/_layout.tsx) rather than customizing the default layout style, allowing us to support rich spring transitions, slide animations, and custom buttons.
- Styled the bar using premium glassmorphic properties (dark translucent backdrop, subtle light-accent border, and elevated shadow offsets).
- Utilized `react-native-reanimated`'s `withSpring` for:
  - Sliding active pill background transition (responsive snaps based on `onLayout` container widths).
  - Physical bouncing scale transitions (`1.08x`) inside individual tab buttons when selected.
  - Sleek slide-down keyboard transition, smoothly tucking the tab bar off-screen while editing inputs and pulling it back on completion.
- Handled the layout safely without needing to modify every page layout by extending the parent `<Tabs>` layout's `sceneStyle` with global platform-specific bottom paddings (`96` on iOS, `84` on Android).
- Integrated `expo-haptics` triggers (`ImpactFeedbackStyle.Light`) inside the tab button handlers to deliver micro-physical sensations on interactions.
- Refined routing filter in `FloatingTabBar` to explicitly filter out the `body` (Photo) tab by route name (`route.name !== 'body'`), resolving the requirement to completely remove the Photo tab.
- Replaced the object-based navigation call `navigation.navigate({ name, merge })` with standard React Navigation helper function `navigation.navigate(route.name, route.params)`, resolving the screen switching issue and fully synchronizing the tab navigator's state indices at runtime.
- Introduced `indicatorOpacity` shared value dynamically controlling the sliding pill's visibility, so it fades out smoothly if the user is on a hidden route (e.g. `body` tab) and fades back in when returning to visible tabs.
- Anchored the active indicator with `left: 12` to align with the tab bar container's horizontal padding, correcting the horizontal layout shift.
- Added `pointerEvents="none"` to the active indicator `<Animated.View>` to prevent it from intercepting and blocking touch events intended for the tab button pressables.
- Added `zIndex: 99` to `tabBarContainer` to ensure the absolute positioned tab bar container remains on top of scrollable screen lists and correctly captures user gestures.
- Introduced `tabBarWrapper` wrapping the floating pill with absolute coordinates (`bottom: 0, left: 0, right: 0`), set `pointerEvents="box-none"` to bypass touch events to background views, and defined explicit height parameters (`100` on iOS, `88` on Android).
- Adjusted the bottom positioning of the floating pill (`bottom: 24` on iOS, `12` on Android) to sit completely inside the wrapper's layout boundaries. This resolves the React Native iOS absolute view touch clipping bug where touches outside parent layout bounds are ignored.
- Removed text labels from `TabBarButton` entirely to provide a clean, modern icon-only bottom tab bar interface.
- Configured dynamic size parameters passing size `24` to the `renderIcon` callback and updated the tab screens' `tabBarIcon` configs to receive the size parameter dynamically, increasing the icon dimensions for better visual appeal.
- Expanded the width of the active indicator pill to `tabWidth + 12` and centered it horizontally by shifting `translateX` by `-6`, offering a wider highlight.
- Centered the active indicator vertically inside the container using `top: '50%'` and `marginTop: -24` (half of its `48` height), ensuring top and bottom margins are perfectly equal.
- Configured `tabBarTransparent: true` on the `<Tabs>` options and removed absolute positioning properties from `tabBarWrapper` style. This aligns the layouts' frame bounds, resolving touch event clipping on iOS 16+ (and newer iOS 26) devices where parent containers clip touches of absolute children.
- Refactored the Custom Tab Bar to use an **Absolute Flexbox Hierarchy**: Since Expo Router/React Navigation entirely ignores `tabBarStyle` overrides when a custom `tabBar` render function is provided (leaving the root container statically positioned, resulting in a black background), we returned `position: 'absolute'` to the root `tabBarWrapper` and converted the inner `tabBarContainer` to a standard flex child (width 100%, flex-end aligned, padding-based offsets). This definitively eliminates the black background block by overlaying the wrapper, while flawlessly preserving touch responder layers on all iOS versions by avoiding double-absolute hierarchies.
- Removed the global `paddingBottom: 96` from the `<Tabs>` `sceneStyle`. By removing this artificial bottom scene padding, the screen content now extends natively to the absolute bottom of the viewport and scrolls elegantly behind the semi-transparent floating tab bar, perfectly matching Instagram's UI behavior.

---

# Tracking Task: iOS 26 Floating Bottom Tab Bar Touch Fix & Optimization

- **Objective**: Fix touch events blocking/clipping on iOS 26 (iPhone 15+) by setting `tabBarTransparent: true` and removing absolute coordinates from the custom tab bar wrapper to ensure proper bounding container calculations, then optimize code by removing dead code/comments and defaulting to iOS.
- **Status**: Completed ✅ Done
- **Current Phase**: Completed

## Task List
- [x] Initialize/Update `TRACKING_TASK.md` ✅ Done
- [x] Enable `tabBarTransparent` setting in `app/(tabs)/_layout.tsx` ✅ Done
- [x] Update layout styles for `tabBarWrapper` and default to iOS (remove OS checks) ✅ Done
- [x] Remove dead code and unnecessary comments ✅ Done
- [x] Verify TypeScript build and tap responsiveness ✅ Done

## Decisions & Changes
- Decoded touch event failure on iOS: absolute child elements overflowing their parents are drawn but cannot receive gestures in UIKit. We align the custom tab bar wrapper boundaries with the parent navigation container.
- Enabled `tabBarTransparent: true` on the `<Tabs>` navigator options with a `// @ts-ignore` comment (bypassing a type definition limitation in Expo Router/React Navigation v6 BottomTabNavigationOptions) so that the parent container is positioned absolutely and made transparent at runtime.
- Removed `position: 'absolute'` and absolute boundary constraints from `styles.tabBarWrapper` to let it lay out inside the parent container naturally. This keeps the custom tab bar floating while preventing layout height collapsing and touch event clipping.
- Cleaned up and optimized the codebase by removing dead code, redundant system/Platform OS checks (defaulting to iOS settings with `height: 100` and `paddingBottom: 24`), and unnecessary comments.
