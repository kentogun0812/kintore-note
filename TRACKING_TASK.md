# AI Agent Tracking Task

## Objective
Update the filter in the Statistics screen to use a calendar for selecting a specific month for the Heatmap tab, and a date range picker (Date A to Date B) for the Chart tab. Additionally, fix UI issues with the calendars. Redesign the Home Screen UI to match the Duolingo-style streak dashboard mockup.

## Status
- `[x]` Analyze Requirements
- `[x]` Perform Impact Analysis
- `[x]` Create Implementation Plan
- `[x]` Implement Changes
- `[x]` Self Review Code
- `[x]` Perform Bug Fixes and Regression Checks
- `[x]` Update Documentation
- `[x]` Fix bottom sheet being covered by tab bar (useRootNavigator)
- `[x]` Replace full-screen DateRangePicker with a modal bottom sheet picker
- `[x]` Rebuild Home Screen UI based on Duolingo mockup

## Changes
* Modified `models/stats_models.dart`: Replaced `TimeRangeFilter` enum with specific `startDate` and `endDate` fields in `StatsState`. Renamed `MonthlyActivityStats` to `ActivityStats`.
* Modified `stats_notifier.dart`: Updated logic to query the database using the new specific `startDate` and `endDate` parameters instead of predefined enums.
* Modified `stats_screen.dart`: Replaced the generic `CupertinoActionSheet` with dynamic pickers. Used `CupertinoDatePicker` (Month/Year mode) for the Heatmap tab and custom `_DateRangePickerSheet` for the Statistics/Chart tab.
* Modified `charts_tab.dart`: Updated the days chart calculation logic to evaluate active days strictly between `startDate` and `endDate`.
* Modified `home_screen.dart`: Simplified Home Screen banner UI. Showcased the evolving Mascot dynamically based on `highestMilestone`. Added 1-day milestone badge. Set up `isActive` flag for the current milestone badge.
* Modified `milestone_badge.dart`: Refactored to include `MascotFacePainter` for procedurally generating different mascot accessories based on streak days. Added `flutter_animate` glow/shimmer effects when `isActive == true`.
* Modified `hanko_calendar.dart`: Rewritten for dynamic month navigation. Replaced generic stamps with `MascotFacePainter` matching the user's highest milestone. Added `flutter_animate` pulse effect for today and bounce-stamp effect for checked-in dates. Added manual tap-to-stamp functionality.

## Decisions
* Procedurally generate the evolving mascot accessories (sprout, mask, crown, aura) using Flutter's `Canvas` instead of loading external images to maintain crisp vectors and reduce asset weight.
* Utilize `flutter_animate` for seamless 60FPS UI interactions (pulse, stamp-down, shimmer) without heavy `AnimationController` boilerplate.
* Allow manual toggling of the Hanko stamp by tapping on dates in the calendar to provide immediate UI feedback to the user.

✅ Done

