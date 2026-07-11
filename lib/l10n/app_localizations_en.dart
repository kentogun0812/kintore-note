// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get commonSave => 'Save';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonClose => 'Close';

  @override
  String get commonSets => 'sets';

  @override
  String get commonReps => 'reps';

  @override
  String get commonWeight => 'weight';

  @override
  String get commonFinished => 'Finished!';

  @override
  String get commonGoodJob => 'Good job!';

  @override
  String get commonMore => 'more';

  @override
  String get commonExercises => 'exercises';

  @override
  String get commonError => 'Error';

  @override
  String get commonWeekdaysSun => 'Sun';

  @override
  String get commonWeekdaysMon => 'Mon';

  @override
  String get commonWeekdaysTue => 'Tue';

  @override
  String get commonWeekdaysWed => 'Wed';

  @override
  String get commonWeekdaysThu => 'Thu';

  @override
  String get commonWeekdaysFri => 'Fri';

  @override
  String get commonWeekdaysSat => 'Sat';

  @override
  String get homeWelcome => 'Good morning';

  @override
  String homeWelcomeUser(Object name) {
    return 'Welcome, $name!';
  }

  @override
  String get homeWelcomeGuest => 'Welcome, Guest!';

  @override
  String get homeGuestWelcome => 'Welcome!';

  @override
  String get homeGuestWarning =>
      'You are experiencing the app as a Guest. Data will not be synced and may be lost. Please log in to protect your progress!';

  @override
  String homeStreak(Object count) {
    return '$count day streak!';
  }

  @override
  String get homeCurrentStreak => 'Current Streak';

  @override
  String get homeHankoCalendar => 'Hanko Calendar';

  @override
  String get homeLoginToSync => 'Sign in to keep your data in sync ☁️';

  @override
  String get homeTodayMenu => 'Today\'s Menu';

  @override
  String get homeStartSession => 'Start Session';

  @override
  String get homeWeeklyGoal => 'This Week\'s Goal';

  @override
  String homeWeeklyTarget(Object target) {
    return '/ $target days';
  }

  @override
  String get homeConsistencyMessage => 'Great consistency! 🔥';

  @override
  String get homeNoTraining => 'No training recorded';

  @override
  String get recordTitle => 'Training';

  @override
  String get recordQuickStart => 'Quick Start';

  @override
  String get recordQuickStartDesc =>
      'Start an empty session and log exercises as you go.';

  @override
  String get recordStartEmpty => 'Start Empty Session';

  @override
  String get recordMenuBuilder => 'Menu Builder';

  @override
  String get recordExerciseLibrary => 'Exercise Library';

  @override
  String get recordSavedMenus => 'Saved Menus';

  @override
  String get recordNoMenus => 'No saved menus yet.';

  @override
  String get statsTitle => 'Analytics';

  @override
  String get statsComingSoon => 'Coming in Phase 2';

  @override
  String get statsComingSoonDesc =>
      'Detailed muscle heatmaps, volume progression charts, and PR celebrations are currently in development.';

  @override
  String get statsPreview => 'Volume Chart Preview';

  @override
  String get bodyTitle => 'Body Records';

  @override
  String get bodyEncrypted => 'E2E Encrypted';

  @override
  String get bodyTakePhoto => 'Take Progress Photo';

  @override
  String get bodyCameraDesc =>
      'AES-256 encrypted · Self-timer · Never saved to Camera Roll';

  @override
  String get bodyPhotos => 'Photos';

  @override
  String get bodyNoPhotos => 'No Progress Photos Yet';

  @override
  String get bodyNoPhotosDesc =>
      'Start tracking your body transformation with encrypted, private photos.';

  @override
  String get bodyNoAnglePhotos => 'No Photos for This Angle';

  @override
  String get bodyNoAnglePhotosDesc =>
      'Take a photo from this angle to see your progress here.';

  @override
  String get bodyTakeFirst => 'Take First Photo';

  @override
  String get bodyLoading => 'Loading encrypted photos...';

  @override
  String get bodyFilterAll => 'All';

  @override
  String get bodyFilterFront => 'Front';

  @override
  String get bodyFilterSide => 'Side';

  @override
  String get bodyFilterBack => 'Back';

  @override
  String get circleTitle => 'Private Circle';

  @override
  String get circleComingSoon => 'Coming in Phase 2';

  @override
  String get circleComingSoonDesc =>
      'Connect with friends, share your training menus, and react to their daily hanko stamps in a private, supportive feed.';

  @override
  String get circleAddFriend => 'Add Friend';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsPreferences => 'Preferences';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get settingsNotifications => 'Notifications';

  @override
  String get settingsWeightUnit => 'Weight Unit';

  @override
  String get settingsSecurity => 'Security';

  @override
  String get settingsAppLock => 'App Lock (Face ID / Touch ID)';

  @override
  String get settingsLegal => 'Legal';

  @override
  String get settingsPrivacyPolicy => 'Privacy Policy';

  @override
  String get settingsTermsOfUse => 'Terms of Use';

  @override
  String get settingsAccount => 'Account';

  @override
  String get settingsDeleteAccount => 'Delete Account';

  @override
  String get settingsSignOut => 'Sign Out';

  @override
  String get settingsSignIn => 'Sign In / Register';

  @override
  String get settingsUpgradePro => 'Upgrade to PRO';

  @override
  String get settingsUnlockStats => 'Unlock advanced stats & analytics';

  @override
  String get settingsVersion => 'Kintore Note v1.0.0';

  @override
  String get deleteAccountTitle => 'Delete Account';

  @override
  String get deleteAccountDescription =>
      'This action is permanent and cannot be undone. All your data will be permanently deleted from our servers and your device.';

  @override
  String get deleteAccountWillDelete => 'This will permanently delete:';

  @override
  String get deleteAccountItem1 => 'All training sessions & workout logs';

  @override
  String get deleteAccountItem2 => 'Body progress photos & encryption keys';

  @override
  String get deleteAccountItem3 => 'Hanko stamps & streak records';

  @override
  String get deleteAccountItem4 => 'Your profile & account information';

  @override
  String deleteAccountConfirmLabel(Object text) {
    return 'Type \"$text\" to confirm';
  }

  @override
  String get deleteAccountConfirm => 'Delete';

  @override
  String get deleteAccountError =>
      'Failed to delete account. Please try again.';

  @override
  String get deleteAccountSuccess => 'Account deleted successfully';

  @override
  String get welcomeTitle => 'Welcome to Kintore Note! 💪';

  @override
  String get welcomeSubtitle =>
      'Your training journey starts now. Let\'s build something great together!';

  @override
  String get welcomeButton => 'Let\'s Lift!';

  @override
  String get appLockSubtitle => 'Authenticate to access your training data';

  @override
  String get appLockAuthPrompt => 'Unlock Kintore Note';

  @override
  String get appLockUsePasscode => 'Use Passcode';

  @override
  String get appLockFaceId => 'Unlock with Face ID';

  @override
  String get appLockTouchId => 'Unlock with Touch ID';

  @override
  String get appLockTryAgain => 'Try Again';

  @override
  String get appLockCancelled => 'Authentication cancelled';

  @override
  String get appLockFailed => 'Authentication failed';

  @override
  String get appLockError => 'An error occurred';

  @override
  String get appLockSecured => 'Protected by biometric authentication';

  @override
  String get premiumTitle => 'Kintore Note PRO';

  @override
  String get premiumSubtitle =>
      'Take your training to the ultimate level with professional tools.';

  @override
  String get premiumFeaturesUnlimitedTitle => 'Unlimited Workouts';

  @override
  String get premiumFeaturesUnlimitedDesc =>
      'Log as many sessions as you lift.';

  @override
  String get premiumFeaturesStatsTitle => 'Advanced Analytics';

  @override
  String get premiumFeaturesStatsDesc => 'Deep dive into your progress curves.';

  @override
  String get premiumFeaturesCloudTitle => 'Cloud Sync';

  @override
  String get premiumFeaturesCloudDesc => 'Keep your data safe across devices.';

  @override
  String get premiumFeaturesProgramsTitle => 'Exclusive Programs';

  @override
  String get premiumFeaturesProgramsDesc =>
      'Access to professional training plans.';

  @override
  String get premiumPlansAnnual => 'Annual Plan';

  @override
  String get premiumPlansPrice => '\$49.99 / year';

  @override
  String get premiumPlansSave => 'SAVE 50%';

  @override
  String get premiumStartTrial => 'Start 7-Day Free Trial';

  @override
  String get premiumTerms =>
      'Cancel anytime. Terms of Use & Privacy Policy apply.';

  @override
  String get sessionTitle => 'Workout Session';

  @override
  String get sessionFinish => 'Finish';

  @override
  String get sessionAddExercise => 'Add Exercise';

  @override
  String get sessionSets => 'SETS';

  @override
  String get sessionKg => 'kg';

  @override
  String get sessionWeight => 'WEIGHT';

  @override
  String get sessionReps => 'REPS';

  @override
  String get sessionStatus => 'STATUS';

  @override
  String get sessionRestTimer => 'Rest Timer';

  @override
  String get sessionSummaryTitle => 'Summary';

  @override
  String get sessionSummaryWorkoutComplete => 'Workout Complete';

  @override
  String get sessionSummaryAwesomeJob => 'Awesome job!';

  @override
  String get sessionSummaryTotalVolume => 'Total Volume';

  @override
  String get sessionSummaryTotalSets => 'Total Sets';

  @override
  String get sessionSummaryStampHanko => 'Stamp Hanko';

  @override
  String get sessionSummaryDone => 'Done';

  @override
  String get hankoWellDone => 'Well done!';

  @override
  String hankoStreak(Object count) {
    return '$count days streak';
  }

  @override
  String get tabsHome => 'Home';

  @override
  String get tabsTraining => 'Training';

  @override
  String get tabsBody => 'Body';

  @override
  String get tabsCircle => 'Circle';

  @override
  String get tabsStats => 'Stats';

  @override
  String get menuBuilderTitle => 'Menu Builder';

  @override
  String get menuBuilderMenuName => 'Menu Name';

  @override
  String get menuBuilderPlaceholder => 'Ex: Chest Day';

  @override
  String get menuBuilderExercises => 'Exercises';

  @override
  String get menuBuilderAdd => 'Add';

  @override
  String get menuBuilderNoExercises => 'No exercises added yet.';

  @override
  String get menuBuilderSaving => 'Saving...';

  @override
  String get menuBuilderSaveMenu => 'Save Menu';

  @override
  String get menuBuilderGuestLimitTitle => 'Guest Limit';

  @override
  String get menuBuilderGuestLimitDesc =>
      'Guests can only create 1 training menu. Please login or register to create unlimited menus and sync them to the cloud! 🏋️‍♂️';

  @override
  String get menuBuilderLater => 'Later';

  @override
  String get menuBuilderLoginRegister => 'Login / Register';

  @override
  String get libraryTitle => 'Exercise Library';

  @override
  String get librarySearchPlaceholder => 'Search exercises...';

  @override
  String get libraryLoadError => 'Failed to load exercises.';

  @override
  String get libraryNoResults => 'No exercises found.';

  @override
  String get exerciseDetailTitle => 'Details';

  @override
  String get exerciseDetailAddToMenu => 'Add to Menu';

  @override
  String get cameraPermissionTitle => 'Camera Access Required';

  @override
  String get cameraPermissionDesc =>
      'Your photos are encrypted locally using AES-256 and never saved to your Camera Roll.';

  @override
  String get cameraGrantPermission => 'Grant Permission';

  @override
  String get cameraEncrypting => 'Encrypting...';

  @override
  String get cameraDecrypting => 'Decrypting...';

  @override
  String get cameraAngleFront => 'Front';

  @override
  String get cameraAngleSide => 'Side';

  @override
  String get cameraAngleBack => 'Back';

  @override
  String get onboardingStep1Title => 'Every Step Matters';

  @override
  String get onboardingStep1Subtitle =>
      'A simple and mindful training log inspired by Japanese Hanko tradition.';

  @override
  String get onboardingStep1Button => 'Get Started';

  @override
  String get onboardingStep2Title => 'Your Progress, Your Way';

  @override
  String get onboardingStep2Subtitle =>
      'Let\'s tailor the experience to your current training rhythm.';

  @override
  String get onboardingStep2Button => 'Unlock My Journey';

  @override
  String get onboardingLevelsBeginnerTitle => 'Easy Start';

  @override
  String get onboardingLevelsBeginnerDesc =>
      'Take it slow and start your journey today';

  @override
  String get onboardingLevelsIntermediateTitle => 'Good Habit';

  @override
  String get onboardingLevelsIntermediateDesc =>
      'Keeping it steady and finding your rhythm';

  @override
  String get onboardingLevelsAdvancedTitle => 'My Own Pace';

  @override
  String get onboardingLevelsAdvancedDesc =>
      'Consistency is key to finding your style';

  @override
  String get introSkip => 'Skip';

  @override
  String get introNext => 'Next';

  @override
  String get introGetStarted => 'Get Started';

  @override
  String get introSlides => '[object Object],[object Object],[object Object]';

  @override
  String get authLoginTitle => 'Kintore Note';

  @override
  String get authLoginSubtitle => 'Welcome back, let\'s lift.';

  @override
  String get authLoginEmailPlaceholder => 'Email address';

  @override
  String get authLoginPasswordPlaceholder => 'Password';

  @override
  String get authLoginSignIn => 'Sign In';

  @override
  String get authLoginEntering => 'Entering...';

  @override
  String get authLoginOrContinueWith => 'OR CONTINUE WITH';

  @override
  String get authLoginSignInApple => 'Sign In with Apple';

  @override
  String get authLoginNoAccount => 'Don\'t have an account? ';

  @override
  String get authLoginRegister => 'Register';

  @override
  String get authLoginContinueAsGuest => 'Continue as Guest';

  @override
  String get authLoginErrorsMissingInfoTitle => 'Missing Information';

  @override
  String get authLoginErrorsMissingInfoDesc =>
      'Please enter both email and password! 💪';

  @override
  String get authLoginErrorsLoginFailedTitle => 'Login Failed';

  @override
  String get authLoginErrorsLoginFailedDesc =>
      'Incorrect email or password. Please try again! 🧐';

  @override
  String get authLoginErrorsConnectionErrorTitle => 'Connection Error';

  @override
  String get authLoginErrorsConnectionErrorDesc =>
      'Could not connect to Apple. Please try again later! 🍎';

  @override
  String get authRegisterTitle => 'Create Account';

  @override
  String get authRegisterSubtitle => 'Join Kintore Note and start lifting.';

  @override
  String get authRegisterEmailPlaceholder => 'Email address';

  @override
  String get authRegisterPasswordPlaceholder => 'Password';

  @override
  String get authRegisterConfirmPasswordPlaceholder => 'Confirm Password';

  @override
  String get authRegisterContinue => 'Continue';

  @override
  String get authRegisterCreating => 'Creating Account...';

  @override
  String get authRegisterOrContinueWith => 'OR CONTINUE WITH';

  @override
  String get authRegisterSignUpApple => 'Sign Up with Apple';

  @override
  String get authRegisterHaveAccount => 'Already have an account? ';

  @override
  String get authRegisterSignIn => 'Sign In';

  @override
  String get authRegisterErrorsMissingInfoTitle => 'Missing Information';

  @override
  String get authRegisterErrorsMissingInfoDesc =>
      'Please fill in all information to create a new account! ✨';

  @override
  String get authRegisterErrorsPasswordMismatchTitle => 'Password Mismatch';

  @override
  String get authRegisterErrorsPasswordMismatchDesc =>
      'Password and confirm password must match! 🧐';

  @override
  String get authRegisterErrorsRegisterErrorTitle => 'Registration Error';

  @override
  String get authRegisterErrorsRegisterErrorDesc =>
      'There was a problem creating your account. Please check your email or password (min 6 characters)! 🛠️';

  @override
  String get authRegisterErrorsRegisterSuccessTitle =>
      'Registration Successful';

  @override
  String get authRegisterErrorsRegisterSuccessDesc =>
      'Please check your email to verify your account! 📧';

  @override
  String get authRegisterErrorsConnectionErrorTitle => 'Connection Error';

  @override
  String get authRegisterErrorsConnectionErrorDesc =>
      'Could not connect to Apple right now. 🍎';
}
