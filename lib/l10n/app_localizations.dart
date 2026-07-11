import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_ja.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('ja'),
  ];

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @commonEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// No description provided for @commonClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// No description provided for @commonSets.
  ///
  /// In en, this message translates to:
  /// **'sets'**
  String get commonSets;

  /// No description provided for @commonReps.
  ///
  /// In en, this message translates to:
  /// **'reps'**
  String get commonReps;

  /// No description provided for @commonWeight.
  ///
  /// In en, this message translates to:
  /// **'weight'**
  String get commonWeight;

  /// No description provided for @commonFinished.
  ///
  /// In en, this message translates to:
  /// **'Finished!'**
  String get commonFinished;

  /// No description provided for @commonGoodJob.
  ///
  /// In en, this message translates to:
  /// **'Good job!'**
  String get commonGoodJob;

  /// No description provided for @commonMore.
  ///
  /// In en, this message translates to:
  /// **'more'**
  String get commonMore;

  /// No description provided for @commonExercises.
  ///
  /// In en, this message translates to:
  /// **'exercises'**
  String get commonExercises;

  /// No description provided for @commonError.
  ///
  /// In en, this message translates to:
  /// **'Error'**
  String get commonError;

  /// No description provided for @commonWeekdaysSun.
  ///
  /// In en, this message translates to:
  /// **'Sun'**
  String get commonWeekdaysSun;

  /// No description provided for @commonWeekdaysMon.
  ///
  /// In en, this message translates to:
  /// **'Mon'**
  String get commonWeekdaysMon;

  /// No description provided for @commonWeekdaysTue.
  ///
  /// In en, this message translates to:
  /// **'Tue'**
  String get commonWeekdaysTue;

  /// No description provided for @commonWeekdaysWed.
  ///
  /// In en, this message translates to:
  /// **'Wed'**
  String get commonWeekdaysWed;

  /// No description provided for @commonWeekdaysThu.
  ///
  /// In en, this message translates to:
  /// **'Thu'**
  String get commonWeekdaysThu;

  /// No description provided for @commonWeekdaysFri.
  ///
  /// In en, this message translates to:
  /// **'Fri'**
  String get commonWeekdaysFri;

  /// No description provided for @commonWeekdaysSat.
  ///
  /// In en, this message translates to:
  /// **'Sat'**
  String get commonWeekdaysSat;

  /// No description provided for @homeWelcome.
  ///
  /// In en, this message translates to:
  /// **'Good morning'**
  String get homeWelcome;

  /// No description provided for @homeWelcomeUser.
  ///
  /// In en, this message translates to:
  /// **'Welcome, {name}!'**
  String homeWelcomeUser(Object name);

  /// No description provided for @homeWelcomeGuest.
  ///
  /// In en, this message translates to:
  /// **'Welcome, Guest!'**
  String get homeWelcomeGuest;

  /// No description provided for @homeGuestWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome!'**
  String get homeGuestWelcome;

  /// No description provided for @homeGuestWarning.
  ///
  /// In en, this message translates to:
  /// **'You are experiencing the app as a Guest. Data will not be synced and may be lost. Please log in to protect your progress!'**
  String get homeGuestWarning;

  /// No description provided for @homeStreak.
  ///
  /// In en, this message translates to:
  /// **'{count} day streak!'**
  String homeStreak(Object count);

  /// No description provided for @homeCurrentStreak.
  ///
  /// In en, this message translates to:
  /// **'Current Streak'**
  String get homeCurrentStreak;

  /// No description provided for @homeHankoCalendar.
  ///
  /// In en, this message translates to:
  /// **'Hanko Calendar'**
  String get homeHankoCalendar;

  /// No description provided for @homeLoginToSync.
  ///
  /// In en, this message translates to:
  /// **'Sign in to keep your data in sync ☁️'**
  String get homeLoginToSync;

  /// No description provided for @homeTodayMenu.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Menu'**
  String get homeTodayMenu;

  /// No description provided for @homeStartSession.
  ///
  /// In en, this message translates to:
  /// **'Start Session'**
  String get homeStartSession;

  /// No description provided for @homeWeeklyGoal.
  ///
  /// In en, this message translates to:
  /// **'This Week\'s Goal'**
  String get homeWeeklyGoal;

  /// No description provided for @homeWeeklyTarget.
  ///
  /// In en, this message translates to:
  /// **'/ {target} days'**
  String homeWeeklyTarget(Object target);

  /// No description provided for @homeConsistencyMessage.
  ///
  /// In en, this message translates to:
  /// **'Great consistency! 🔥'**
  String get homeConsistencyMessage;

  /// No description provided for @homeNoTraining.
  ///
  /// In en, this message translates to:
  /// **'No training recorded'**
  String get homeNoTraining;

  /// No description provided for @recordTitle.
  ///
  /// In en, this message translates to:
  /// **'Training'**
  String get recordTitle;

  /// No description provided for @recordQuickStart.
  ///
  /// In en, this message translates to:
  /// **'Quick Start'**
  String get recordQuickStart;

  /// No description provided for @recordQuickStartDesc.
  ///
  /// In en, this message translates to:
  /// **'Start an empty session and log exercises as you go.'**
  String get recordQuickStartDesc;

  /// No description provided for @recordStartEmpty.
  ///
  /// In en, this message translates to:
  /// **'Start Empty Session'**
  String get recordStartEmpty;

  /// No description provided for @recordMenuBuilder.
  ///
  /// In en, this message translates to:
  /// **'Menu Builder'**
  String get recordMenuBuilder;

  /// No description provided for @recordExerciseLibrary.
  ///
  /// In en, this message translates to:
  /// **'Exercise Library'**
  String get recordExerciseLibrary;

  /// No description provided for @recordSavedMenus.
  ///
  /// In en, this message translates to:
  /// **'Saved Menus'**
  String get recordSavedMenus;

  /// No description provided for @recordNoMenus.
  ///
  /// In en, this message translates to:
  /// **'No saved menus yet.'**
  String get recordNoMenus;

  /// No description provided for @statsTitle.
  ///
  /// In en, this message translates to:
  /// **'Analytics'**
  String get statsTitle;

  /// No description provided for @statsComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming in Phase 2'**
  String get statsComingSoon;

  /// No description provided for @statsComingSoonDesc.
  ///
  /// In en, this message translates to:
  /// **'Detailed muscle heatmaps, volume progression charts, and PR celebrations are currently in development.'**
  String get statsComingSoonDesc;

  /// No description provided for @statsPreview.
  ///
  /// In en, this message translates to:
  /// **'Volume Chart Preview'**
  String get statsPreview;

  /// No description provided for @bodyTitle.
  ///
  /// In en, this message translates to:
  /// **'Body Records'**
  String get bodyTitle;

  /// No description provided for @bodyEncrypted.
  ///
  /// In en, this message translates to:
  /// **'E2E Encrypted'**
  String get bodyEncrypted;

  /// No description provided for @bodyTakePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take Progress Photo'**
  String get bodyTakePhoto;

  /// No description provided for @bodyCameraDesc.
  ///
  /// In en, this message translates to:
  /// **'AES-256 encrypted · Self-timer · Never saved to Camera Roll'**
  String get bodyCameraDesc;

  /// No description provided for @bodyPhotos.
  ///
  /// In en, this message translates to:
  /// **'Photos'**
  String get bodyPhotos;

  /// No description provided for @bodyNoPhotos.
  ///
  /// In en, this message translates to:
  /// **'No Progress Photos Yet'**
  String get bodyNoPhotos;

  /// No description provided for @bodyNoPhotosDesc.
  ///
  /// In en, this message translates to:
  /// **'Start tracking your body transformation with encrypted, private photos.'**
  String get bodyNoPhotosDesc;

  /// No description provided for @bodyNoAnglePhotos.
  ///
  /// In en, this message translates to:
  /// **'No Photos for This Angle'**
  String get bodyNoAnglePhotos;

  /// No description provided for @bodyNoAnglePhotosDesc.
  ///
  /// In en, this message translates to:
  /// **'Take a photo from this angle to see your progress here.'**
  String get bodyNoAnglePhotosDesc;

  /// No description provided for @bodyTakeFirst.
  ///
  /// In en, this message translates to:
  /// **'Take First Photo'**
  String get bodyTakeFirst;

  /// No description provided for @bodyLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading encrypted photos...'**
  String get bodyLoading;

  /// No description provided for @bodyFilterAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get bodyFilterAll;

  /// No description provided for @bodyFilterFront.
  ///
  /// In en, this message translates to:
  /// **'Front'**
  String get bodyFilterFront;

  /// No description provided for @bodyFilterSide.
  ///
  /// In en, this message translates to:
  /// **'Side'**
  String get bodyFilterSide;

  /// No description provided for @bodyFilterBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get bodyFilterBack;

  /// No description provided for @circleTitle.
  ///
  /// In en, this message translates to:
  /// **'Private Circle'**
  String get circleTitle;

  /// No description provided for @circleComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming in Phase 2'**
  String get circleComingSoon;

  /// No description provided for @circleComingSoonDesc.
  ///
  /// In en, this message translates to:
  /// **'Connect with friends, share your training menus, and react to their daily hanko stamps in a private, supportive feed.'**
  String get circleComingSoonDesc;

  /// No description provided for @circleAddFriend.
  ///
  /// In en, this message translates to:
  /// **'Add Friend'**
  String get circleAddFriend;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @settingsPreferences.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get settingsPreferences;

  /// No description provided for @settingsLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get settingsLanguage;

  /// No description provided for @settingsNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get settingsNotifications;

  /// No description provided for @settingsWeightUnit.
  ///
  /// In en, this message translates to:
  /// **'Weight Unit'**
  String get settingsWeightUnit;

  /// No description provided for @settingsSecurity.
  ///
  /// In en, this message translates to:
  /// **'Security'**
  String get settingsSecurity;

  /// No description provided for @settingsAppLock.
  ///
  /// In en, this message translates to:
  /// **'App Lock (Face ID / Touch ID)'**
  String get settingsAppLock;

  /// No description provided for @settingsLegal.
  ///
  /// In en, this message translates to:
  /// **'Legal'**
  String get settingsLegal;

  /// No description provided for @settingsPrivacyPolicy.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get settingsPrivacyPolicy;

  /// No description provided for @settingsTermsOfUse.
  ///
  /// In en, this message translates to:
  /// **'Terms of Use'**
  String get settingsTermsOfUse;

  /// No description provided for @settingsAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get settingsAccount;

  /// No description provided for @settingsDeleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get settingsDeleteAccount;

  /// No description provided for @settingsSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get settingsSignOut;

  /// No description provided for @settingsSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In / Register'**
  String get settingsSignIn;

  /// No description provided for @settingsUpgradePro.
  ///
  /// In en, this message translates to:
  /// **'Upgrade to PRO'**
  String get settingsUpgradePro;

  /// No description provided for @settingsUnlockStats.
  ///
  /// In en, this message translates to:
  /// **'Unlock advanced stats & analytics'**
  String get settingsUnlockStats;

  /// No description provided for @settingsVersion.
  ///
  /// In en, this message translates to:
  /// **'Kintore Note v1.0.0'**
  String get settingsVersion;

  /// No description provided for @deleteAccountTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccountTitle;

  /// No description provided for @deleteAccountDescription.
  ///
  /// In en, this message translates to:
  /// **'This action is permanent and cannot be undone. All your data will be permanently deleted from our servers and your device.'**
  String get deleteAccountDescription;

  /// No description provided for @deleteAccountWillDelete.
  ///
  /// In en, this message translates to:
  /// **'This will permanently delete:'**
  String get deleteAccountWillDelete;

  /// No description provided for @deleteAccountItem1.
  ///
  /// In en, this message translates to:
  /// **'All training sessions & workout logs'**
  String get deleteAccountItem1;

  /// No description provided for @deleteAccountItem2.
  ///
  /// In en, this message translates to:
  /// **'Body progress photos & encryption keys'**
  String get deleteAccountItem2;

  /// No description provided for @deleteAccountItem3.
  ///
  /// In en, this message translates to:
  /// **'Hanko stamps & streak records'**
  String get deleteAccountItem3;

  /// No description provided for @deleteAccountItem4.
  ///
  /// In en, this message translates to:
  /// **'Your profile & account information'**
  String get deleteAccountItem4;

  /// No description provided for @deleteAccountConfirmLabel.
  ///
  /// In en, this message translates to:
  /// **'Type \"{text}\" to confirm'**
  String deleteAccountConfirmLabel(Object text);

  /// No description provided for @deleteAccountConfirm.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get deleteAccountConfirm;

  /// No description provided for @deleteAccountError.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete account. Please try again.'**
  String get deleteAccountError;

  /// No description provided for @deleteAccountSuccess.
  ///
  /// In en, this message translates to:
  /// **'Account deleted successfully'**
  String get deleteAccountSuccess;

  /// No description provided for @welcomeTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome to Kintore Note! 💪'**
  String get welcomeTitle;

  /// No description provided for @welcomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your training journey starts now. Let\'s build something great together!'**
  String get welcomeSubtitle;

  /// No description provided for @welcomeButton.
  ///
  /// In en, this message translates to:
  /// **'Let\'s Lift!'**
  String get welcomeButton;

  /// No description provided for @appLockSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Authenticate to access your training data'**
  String get appLockSubtitle;

  /// No description provided for @appLockAuthPrompt.
  ///
  /// In en, this message translates to:
  /// **'Unlock Kintore Note'**
  String get appLockAuthPrompt;

  /// No description provided for @appLockUsePasscode.
  ///
  /// In en, this message translates to:
  /// **'Use Passcode'**
  String get appLockUsePasscode;

  /// No description provided for @appLockFaceId.
  ///
  /// In en, this message translates to:
  /// **'Unlock with Face ID'**
  String get appLockFaceId;

  /// No description provided for @appLockTouchId.
  ///
  /// In en, this message translates to:
  /// **'Unlock with Touch ID'**
  String get appLockTouchId;

  /// No description provided for @appLockTryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get appLockTryAgain;

  /// No description provided for @appLockCancelled.
  ///
  /// In en, this message translates to:
  /// **'Authentication cancelled'**
  String get appLockCancelled;

  /// No description provided for @appLockFailed.
  ///
  /// In en, this message translates to:
  /// **'Authentication failed'**
  String get appLockFailed;

  /// No description provided for @appLockError.
  ///
  /// In en, this message translates to:
  /// **'An error occurred'**
  String get appLockError;

  /// No description provided for @appLockSecured.
  ///
  /// In en, this message translates to:
  /// **'Protected by biometric authentication'**
  String get appLockSecured;

  /// No description provided for @premiumTitle.
  ///
  /// In en, this message translates to:
  /// **'Kintore Note PRO'**
  String get premiumTitle;

  /// No description provided for @premiumSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Take your training to the ultimate level with professional tools.'**
  String get premiumSubtitle;

  /// No description provided for @premiumFeaturesUnlimitedTitle.
  ///
  /// In en, this message translates to:
  /// **'Unlimited Workouts'**
  String get premiumFeaturesUnlimitedTitle;

  /// No description provided for @premiumFeaturesUnlimitedDesc.
  ///
  /// In en, this message translates to:
  /// **'Log as many sessions as you lift.'**
  String get premiumFeaturesUnlimitedDesc;

  /// No description provided for @premiumFeaturesStatsTitle.
  ///
  /// In en, this message translates to:
  /// **'Advanced Analytics'**
  String get premiumFeaturesStatsTitle;

  /// No description provided for @premiumFeaturesStatsDesc.
  ///
  /// In en, this message translates to:
  /// **'Deep dive into your progress curves.'**
  String get premiumFeaturesStatsDesc;

  /// No description provided for @premiumFeaturesCloudTitle.
  ///
  /// In en, this message translates to:
  /// **'Cloud Sync'**
  String get premiumFeaturesCloudTitle;

  /// No description provided for @premiumFeaturesCloudDesc.
  ///
  /// In en, this message translates to:
  /// **'Keep your data safe across devices.'**
  String get premiumFeaturesCloudDesc;

  /// No description provided for @premiumFeaturesProgramsTitle.
  ///
  /// In en, this message translates to:
  /// **'Exclusive Programs'**
  String get premiumFeaturesProgramsTitle;

  /// No description provided for @premiumFeaturesProgramsDesc.
  ///
  /// In en, this message translates to:
  /// **'Access to professional training plans.'**
  String get premiumFeaturesProgramsDesc;

  /// No description provided for @premiumPlansAnnual.
  ///
  /// In en, this message translates to:
  /// **'Annual Plan'**
  String get premiumPlansAnnual;

  /// No description provided for @premiumPlansPrice.
  ///
  /// In en, this message translates to:
  /// **'\$49.99 / year'**
  String get premiumPlansPrice;

  /// No description provided for @premiumPlansSave.
  ///
  /// In en, this message translates to:
  /// **'SAVE 50%'**
  String get premiumPlansSave;

  /// No description provided for @premiumStartTrial.
  ///
  /// In en, this message translates to:
  /// **'Start 7-Day Free Trial'**
  String get premiumStartTrial;

  /// No description provided for @premiumTerms.
  ///
  /// In en, this message translates to:
  /// **'Cancel anytime. Terms of Use & Privacy Policy apply.'**
  String get premiumTerms;

  /// No description provided for @sessionTitle.
  ///
  /// In en, this message translates to:
  /// **'Workout Session'**
  String get sessionTitle;

  /// No description provided for @sessionFinish.
  ///
  /// In en, this message translates to:
  /// **'Finish'**
  String get sessionFinish;

  /// No description provided for @sessionAddExercise.
  ///
  /// In en, this message translates to:
  /// **'Add Exercise'**
  String get sessionAddExercise;

  /// No description provided for @sessionSets.
  ///
  /// In en, this message translates to:
  /// **'SETS'**
  String get sessionSets;

  /// No description provided for @sessionKg.
  ///
  /// In en, this message translates to:
  /// **'kg'**
  String get sessionKg;

  /// No description provided for @sessionWeight.
  ///
  /// In en, this message translates to:
  /// **'WEIGHT'**
  String get sessionWeight;

  /// No description provided for @sessionReps.
  ///
  /// In en, this message translates to:
  /// **'REPS'**
  String get sessionReps;

  /// No description provided for @sessionStatus.
  ///
  /// In en, this message translates to:
  /// **'STATUS'**
  String get sessionStatus;

  /// No description provided for @sessionRestTimer.
  ///
  /// In en, this message translates to:
  /// **'Rest Timer'**
  String get sessionRestTimer;

  /// No description provided for @sessionSummaryTitle.
  ///
  /// In en, this message translates to:
  /// **'Summary'**
  String get sessionSummaryTitle;

  /// No description provided for @sessionSummaryWorkoutComplete.
  ///
  /// In en, this message translates to:
  /// **'Workout Complete'**
  String get sessionSummaryWorkoutComplete;

  /// No description provided for @sessionSummaryAwesomeJob.
  ///
  /// In en, this message translates to:
  /// **'Awesome job!'**
  String get sessionSummaryAwesomeJob;

  /// No description provided for @sessionSummaryTotalVolume.
  ///
  /// In en, this message translates to:
  /// **'Total Volume'**
  String get sessionSummaryTotalVolume;

  /// No description provided for @sessionSummaryTotalSets.
  ///
  /// In en, this message translates to:
  /// **'Total Sets'**
  String get sessionSummaryTotalSets;

  /// No description provided for @sessionSummaryStampHanko.
  ///
  /// In en, this message translates to:
  /// **'Stamp Hanko'**
  String get sessionSummaryStampHanko;

  /// No description provided for @sessionSummaryDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get sessionSummaryDone;

  /// No description provided for @hankoWellDone.
  ///
  /// In en, this message translates to:
  /// **'Well done!'**
  String get hankoWellDone;

  /// No description provided for @hankoStreak.
  ///
  /// In en, this message translates to:
  /// **'{count} days streak'**
  String hankoStreak(Object count);

  /// No description provided for @tabsHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get tabsHome;

  /// No description provided for @tabsTraining.
  ///
  /// In en, this message translates to:
  /// **'Training'**
  String get tabsTraining;

  /// No description provided for @tabsBody.
  ///
  /// In en, this message translates to:
  /// **'Body'**
  String get tabsBody;

  /// No description provided for @tabsCircle.
  ///
  /// In en, this message translates to:
  /// **'Circle'**
  String get tabsCircle;

  /// No description provided for @tabsStats.
  ///
  /// In en, this message translates to:
  /// **'Stats'**
  String get tabsStats;

  /// No description provided for @menuBuilderTitle.
  ///
  /// In en, this message translates to:
  /// **'Menu Builder'**
  String get menuBuilderTitle;

  /// No description provided for @menuBuilderMenuName.
  ///
  /// In en, this message translates to:
  /// **'Menu Name'**
  String get menuBuilderMenuName;

  /// No description provided for @menuBuilderPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Ex: Chest Day'**
  String get menuBuilderPlaceholder;

  /// No description provided for @menuBuilderExercises.
  ///
  /// In en, this message translates to:
  /// **'Exercises'**
  String get menuBuilderExercises;

  /// No description provided for @menuBuilderAdd.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get menuBuilderAdd;

  /// No description provided for @menuBuilderNoExercises.
  ///
  /// In en, this message translates to:
  /// **'No exercises added yet.'**
  String get menuBuilderNoExercises;

  /// No description provided for @menuBuilderSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving...'**
  String get menuBuilderSaving;

  /// No description provided for @menuBuilderSaveMenu.
  ///
  /// In en, this message translates to:
  /// **'Save Menu'**
  String get menuBuilderSaveMenu;

  /// No description provided for @menuBuilderGuestLimitTitle.
  ///
  /// In en, this message translates to:
  /// **'Guest Limit'**
  String get menuBuilderGuestLimitTitle;

  /// No description provided for @menuBuilderGuestLimitDesc.
  ///
  /// In en, this message translates to:
  /// **'Guests can only create 1 training menu. Please login or register to create unlimited menus and sync them to the cloud! 🏋️‍♂️'**
  String get menuBuilderGuestLimitDesc;

  /// No description provided for @menuBuilderLater.
  ///
  /// In en, this message translates to:
  /// **'Later'**
  String get menuBuilderLater;

  /// No description provided for @menuBuilderLoginRegister.
  ///
  /// In en, this message translates to:
  /// **'Login / Register'**
  String get menuBuilderLoginRegister;

  /// No description provided for @libraryTitle.
  ///
  /// In en, this message translates to:
  /// **'Exercise Library'**
  String get libraryTitle;

  /// No description provided for @librarySearchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search exercises...'**
  String get librarySearchPlaceholder;

  /// No description provided for @libraryLoadError.
  ///
  /// In en, this message translates to:
  /// **'Failed to load exercises.'**
  String get libraryLoadError;

  /// No description provided for @libraryNoResults.
  ///
  /// In en, this message translates to:
  /// **'No exercises found.'**
  String get libraryNoResults;

  /// No description provided for @exerciseDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get exerciseDetailTitle;

  /// No description provided for @exerciseDetailAddToMenu.
  ///
  /// In en, this message translates to:
  /// **'Add to Menu'**
  String get exerciseDetailAddToMenu;

  /// No description provided for @cameraPermissionTitle.
  ///
  /// In en, this message translates to:
  /// **'Camera Access Required'**
  String get cameraPermissionTitle;

  /// No description provided for @cameraPermissionDesc.
  ///
  /// In en, this message translates to:
  /// **'Your photos are encrypted locally using AES-256 and never saved to your Camera Roll.'**
  String get cameraPermissionDesc;

  /// No description provided for @cameraGrantPermission.
  ///
  /// In en, this message translates to:
  /// **'Grant Permission'**
  String get cameraGrantPermission;

  /// No description provided for @cameraEncrypting.
  ///
  /// In en, this message translates to:
  /// **'Encrypting...'**
  String get cameraEncrypting;

  /// No description provided for @cameraDecrypting.
  ///
  /// In en, this message translates to:
  /// **'Decrypting...'**
  String get cameraDecrypting;

  /// No description provided for @cameraAngleFront.
  ///
  /// In en, this message translates to:
  /// **'Front'**
  String get cameraAngleFront;

  /// No description provided for @cameraAngleSide.
  ///
  /// In en, this message translates to:
  /// **'Side'**
  String get cameraAngleSide;

  /// No description provided for @cameraAngleBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get cameraAngleBack;

  /// No description provided for @onboardingStep1Title.
  ///
  /// In en, this message translates to:
  /// **'Every Step Matters'**
  String get onboardingStep1Title;

  /// No description provided for @onboardingStep1Subtitle.
  ///
  /// In en, this message translates to:
  /// **'A simple and mindful training log inspired by Japanese Hanko tradition.'**
  String get onboardingStep1Subtitle;

  /// No description provided for @onboardingStep1Button.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get onboardingStep1Button;

  /// No description provided for @onboardingStep2Title.
  ///
  /// In en, this message translates to:
  /// **'Your Progress, Your Way'**
  String get onboardingStep2Title;

  /// No description provided for @onboardingStep2Subtitle.
  ///
  /// In en, this message translates to:
  /// **'Let\'s tailor the experience to your current training rhythm.'**
  String get onboardingStep2Subtitle;

  /// No description provided for @onboardingStep2Button.
  ///
  /// In en, this message translates to:
  /// **'Unlock My Journey'**
  String get onboardingStep2Button;

  /// No description provided for @onboardingLevelsBeginnerTitle.
  ///
  /// In en, this message translates to:
  /// **'Easy Start'**
  String get onboardingLevelsBeginnerTitle;

  /// No description provided for @onboardingLevelsBeginnerDesc.
  ///
  /// In en, this message translates to:
  /// **'Take it slow and start your journey today'**
  String get onboardingLevelsBeginnerDesc;

  /// No description provided for @onboardingLevelsIntermediateTitle.
  ///
  /// In en, this message translates to:
  /// **'Good Habit'**
  String get onboardingLevelsIntermediateTitle;

  /// No description provided for @onboardingLevelsIntermediateDesc.
  ///
  /// In en, this message translates to:
  /// **'Keeping it steady and finding your rhythm'**
  String get onboardingLevelsIntermediateDesc;

  /// No description provided for @onboardingLevelsAdvancedTitle.
  ///
  /// In en, this message translates to:
  /// **'My Own Pace'**
  String get onboardingLevelsAdvancedTitle;

  /// No description provided for @onboardingLevelsAdvancedDesc.
  ///
  /// In en, this message translates to:
  /// **'Consistency is key to finding your style'**
  String get onboardingLevelsAdvancedDesc;

  /// No description provided for @introSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get introSkip;

  /// No description provided for @introNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get introNext;

  /// No description provided for @introGetStarted.
  ///
  /// In en, this message translates to:
  /// **'Get Started'**
  String get introGetStarted;

  /// No description provided for @introSlides.
  ///
  /// In en, this message translates to:
  /// **'[object Object],[object Object],[object Object]'**
  String get introSlides;

  /// No description provided for @authLoginTitle.
  ///
  /// In en, this message translates to:
  /// **'Kintore Note'**
  String get authLoginTitle;

  /// No description provided for @authLoginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome back, let\'s lift.'**
  String get authLoginSubtitle;

  /// No description provided for @authLoginEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authLoginEmailPlaceholder;

  /// No description provided for @authLoginPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authLoginPasswordPlaceholder;

  /// No description provided for @authLoginSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authLoginSignIn;

  /// No description provided for @authLoginEntering.
  ///
  /// In en, this message translates to:
  /// **'Entering...'**
  String get authLoginEntering;

  /// No description provided for @authLoginOrContinueWith.
  ///
  /// In en, this message translates to:
  /// **'OR CONTINUE WITH'**
  String get authLoginOrContinueWith;

  /// No description provided for @authLoginSignInApple.
  ///
  /// In en, this message translates to:
  /// **'Sign In with Apple'**
  String get authLoginSignInApple;

  /// No description provided for @authLoginNoAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? '**
  String get authLoginNoAccount;

  /// No description provided for @authLoginRegister.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get authLoginRegister;

  /// No description provided for @authLoginContinueAsGuest.
  ///
  /// In en, this message translates to:
  /// **'Continue as Guest'**
  String get authLoginContinueAsGuest;

  /// No description provided for @authLoginErrorsMissingInfoTitle.
  ///
  /// In en, this message translates to:
  /// **'Missing Information'**
  String get authLoginErrorsMissingInfoTitle;

  /// No description provided for @authLoginErrorsMissingInfoDesc.
  ///
  /// In en, this message translates to:
  /// **'Please enter both email and password! 💪'**
  String get authLoginErrorsMissingInfoDesc;

  /// No description provided for @authLoginErrorsLoginFailedTitle.
  ///
  /// In en, this message translates to:
  /// **'Login Failed'**
  String get authLoginErrorsLoginFailedTitle;

  /// No description provided for @authLoginErrorsLoginFailedDesc.
  ///
  /// In en, this message translates to:
  /// **'Incorrect email or password. Please try again! 🧐'**
  String get authLoginErrorsLoginFailedDesc;

  /// No description provided for @authLoginErrorsConnectionErrorTitle.
  ///
  /// In en, this message translates to:
  /// **'Connection Error'**
  String get authLoginErrorsConnectionErrorTitle;

  /// No description provided for @authLoginErrorsConnectionErrorDesc.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to Apple. Please try again later! 🍎'**
  String get authLoginErrorsConnectionErrorDesc;

  /// No description provided for @authRegisterTitle.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get authRegisterTitle;

  /// No description provided for @authRegisterSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Join Kintore Note and start lifting.'**
  String get authRegisterSubtitle;

  /// No description provided for @authRegisterEmailPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authRegisterEmailPlaceholder;

  /// No description provided for @authRegisterPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authRegisterPasswordPlaceholder;

  /// No description provided for @authRegisterConfirmPasswordPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get authRegisterConfirmPasswordPlaceholder;

  /// No description provided for @authRegisterContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get authRegisterContinue;

  /// No description provided for @authRegisterCreating.
  ///
  /// In en, this message translates to:
  /// **'Creating Account...'**
  String get authRegisterCreating;

  /// No description provided for @authRegisterOrContinueWith.
  ///
  /// In en, this message translates to:
  /// **'OR CONTINUE WITH'**
  String get authRegisterOrContinueWith;

  /// No description provided for @authRegisterSignUpApple.
  ///
  /// In en, this message translates to:
  /// **'Sign Up with Apple'**
  String get authRegisterSignUpApple;

  /// No description provided for @authRegisterHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account? '**
  String get authRegisterHaveAccount;

  /// No description provided for @authRegisterSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authRegisterSignIn;

  /// No description provided for @authRegisterErrorsMissingInfoTitle.
  ///
  /// In en, this message translates to:
  /// **'Missing Information'**
  String get authRegisterErrorsMissingInfoTitle;

  /// No description provided for @authRegisterErrorsMissingInfoDesc.
  ///
  /// In en, this message translates to:
  /// **'Please fill in all information to create a new account! ✨'**
  String get authRegisterErrorsMissingInfoDesc;

  /// No description provided for @authRegisterErrorsPasswordMismatchTitle.
  ///
  /// In en, this message translates to:
  /// **'Password Mismatch'**
  String get authRegisterErrorsPasswordMismatchTitle;

  /// No description provided for @authRegisterErrorsPasswordMismatchDesc.
  ///
  /// In en, this message translates to:
  /// **'Password and confirm password must match! 🧐'**
  String get authRegisterErrorsPasswordMismatchDesc;

  /// No description provided for @authRegisterErrorsRegisterErrorTitle.
  ///
  /// In en, this message translates to:
  /// **'Registration Error'**
  String get authRegisterErrorsRegisterErrorTitle;

  /// No description provided for @authRegisterErrorsRegisterErrorDesc.
  ///
  /// In en, this message translates to:
  /// **'There was a problem creating your account. Please check your email or password (min 6 characters)! 🛠️'**
  String get authRegisterErrorsRegisterErrorDesc;

  /// No description provided for @authRegisterErrorsRegisterSuccessTitle.
  ///
  /// In en, this message translates to:
  /// **'Registration Successful'**
  String get authRegisterErrorsRegisterSuccessTitle;

  /// No description provided for @authRegisterErrorsRegisterSuccessDesc.
  ///
  /// In en, this message translates to:
  /// **'Please check your email to verify your account! 📧'**
  String get authRegisterErrorsRegisterSuccessDesc;

  /// No description provided for @authRegisterErrorsConnectionErrorTitle.
  ///
  /// In en, this message translates to:
  /// **'Connection Error'**
  String get authRegisterErrorsConnectionErrorTitle;

  /// No description provided for @authRegisterErrorsConnectionErrorDesc.
  ///
  /// In en, this message translates to:
  /// **'Could not connect to Apple right now. 🍎'**
  String get authRegisterErrorsConnectionErrorDesc;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'ja'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'ja':
      return AppLocalizationsJa();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
