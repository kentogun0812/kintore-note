# Kintore Note (Flutter Edition)

A high-performance, modern, offline-first gym workout log and analytics tracker built with Flutter, matching iOS 26 design specifications.

This repository was migrated from the original React Native (Expo) codebase to Flutter to improve startup performance, visual fluidness, haptic precision, and offline-first delta synchronization.

## Tech Stack

- **Framework:** [Flutter](https://flutter.dev/) (v3+)
- **State Management:** [Riverpod](https://riverpod.dev/) (v2.6.1) with generated providers
- **Local Database:** [Drift](https://drift.simonbinder.eu/) (v2.28.2) SQLite database builder
- **Remote DB & Auth:** [Supabase](https://supabase.com/)
- **Routing:** [GoRouter](https://pub.dev/packages/go_router)
- **Animations:** [Flutter Animate](https://pub.dev/packages/flutter_animate)
- **Haptic Vibration:** [Haptic Feedback](https://pub.dev/packages/haptic_feedback)

---

## Getting Started

### Prerequisites

- Flutter SDK (stable channel)
- Cocoapods (for iOS builds)
- Android SDK (for Android builds)

### Installation

1. Clone the repository.
2. Fetch package dependencies:
   ```bash
   flutter pub get
   ```
3. Run the code generator to generate drift databases and Riverpod providers:
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

### Running the App

- Start emulator/simulator or connect a physical device.
- Launch the application:
   ```bash
   flutter run
   ```

---

## Testing & Code Verification

Unit test suites cover the local Drift database tables, in-memory SQLite joins, and Riverpod state notifier flows:

- Run all unit tests:
  ```bash
  flutter test
  ```
- Run static code analysis:
  ```bash
  flutter analyze
  ```
