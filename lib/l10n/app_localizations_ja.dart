// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Japanese (`ja`).
class AppLocalizationsJa extends AppLocalizations {
  AppLocalizationsJa([String locale = 'ja']) : super(locale);

  @override
  String get commonSave => '保存';

  @override
  String get commonCancel => 'キャンセル';

  @override
  String get commonDelete => '削除';

  @override
  String get commonEdit => '編集';

  @override
  String get commonClose => '閉じる';

  @override
  String get commonSets => 'セット';

  @override
  String get commonReps => 'レップ';

  @override
  String get commonWeight => '重量';

  @override
  String get commonFinished => '完了！';

  @override
  String get commonGoodJob => 'お疲れ様でした！';

  @override
  String get commonMore => '件以上';

  @override
  String get commonExercises => '種目';

  @override
  String get commonError => 'エラー';

  @override
  String get commonWeekdaysSun => '日';

  @override
  String get commonWeekdaysMon => '月';

  @override
  String get commonWeekdaysTue => '火';

  @override
  String get commonWeekdaysWed => '水';

  @override
  String get commonWeekdaysThu => '木';

  @override
  String get commonWeekdaysFri => '金';

  @override
  String get commonWeekdaysSat => '土';

  @override
  String get homeWelcome => 'おはようございます';

  @override
  String homeWelcomeUser(Object name) {
    return 'ようこそ、$nameさん！';
  }

  @override
  String get homeWelcomeGuest => 'ようこそ、ゲストさん！';

  @override
  String get homeGuestWelcome => 'ようこそ！';

  @override
  String get homeGuestWarning =>
      'ゲストとして体験中です。データは同期されず、失われる可能性があります。記録を保護するためにログインしてください！';

  @override
  String homeStreak(Object count) {
    return '$count日連続！';
  }

  @override
  String get homeCurrentStreak => '現在の継続日数';

  @override
  String get homeHankoCalendar => 'ハンコカレンダー';

  @override
  String get homeLoginToSync => 'ログインするとデータを同期できます ☁️';

  @override
  String get homeTodayMenu => '今日のメニュー';

  @override
  String get homeStartSession => 'トレーニング開始';

  @override
  String get homeWeeklyGoal => '今週の目標';

  @override
  String homeWeeklyTarget(Object target) {
    return '/ $target日';
  }

  @override
  String get homeConsistencyMessage => '継続は力なり！ 🔥';

  @override
  String get homeNoTraining => 'トレーニング記録なし';

  @override
  String get recordTitle => 'トレーニング';

  @override
  String get recordQuickStart => 'クイックスタート';

  @override
  String get recordQuickStartDesc => 'メニューなしでトレーニングを開始し、その場で記録します。';

  @override
  String get recordStartEmpty => '空のセッションを開始';

  @override
  String get recordMenuBuilder => 'メニュービルダー';

  @override
  String get recordExerciseLibrary => '種目ライブラリ';

  @override
  String get recordSavedMenus => '保存済みメニュー';

  @override
  String get recordNoMenus => 'まだ保存されたメニューはありません。';

  @override
  String get statsTitle => '分析';

  @override
  String get statsComingSoon => 'フェーズ2で公開予定';

  @override
  String get statsComingSoonDesc => 'ヒートマップ、ボリューム推移グラフ、自己ベストのお祝い機能などを開発中です。';

  @override
  String get statsPreview => 'ボリュームチャート（プレビュー）';

  @override
  String get bodyTitle => 'ボディレコード';

  @override
  String get bodyEncrypted => '暗号化済み';

  @override
  String get bodyTakePhoto => '経過写真を撮影';

  @override
  String get bodyCameraDesc => 'AES-256暗号化 · セルフタイマー · カメラロールには保存されません';

  @override
  String get bodyPhotos => '枚';

  @override
  String get bodyNoPhotos => 'まだ写真がありません';

  @override
  String get bodyNoPhotosDesc => '暗号化された安全な写真で、体の変化を記録しましょう。';

  @override
  String get bodyNoAnglePhotos => 'この角度の写真はありません';

  @override
  String get bodyNoAnglePhotosDesc => 'この角度から写真を撮って、変化を確認しましょう。';

  @override
  String get bodyTakeFirst => '最初の写真を撮る';

  @override
  String get bodyLoading => '暗号化写真を読み込み中...';

  @override
  String get bodyFilterAll => 'すべて';

  @override
  String get bodyFilterFront => '正面';

  @override
  String get bodyFilterSide => '側面';

  @override
  String get bodyFilterBack => '背面';

  @override
  String get circleTitle => 'プライベートサークル';

  @override
  String get circleComingSoon => 'フェーズ2で公開予定';

  @override
  String get circleComingSoonDesc =>
      '友達とつながり、メニューの共有やハンコスタンプへのリアクションができる限定フィードです。';

  @override
  String get circleAddFriend => '友達を追加';

  @override
  String get settingsTitle => '設定';

  @override
  String get settingsPreferences => '基本設定';

  @override
  String get settingsLanguage => '言語';

  @override
  String get settingsNotifications => '通知';

  @override
  String get settingsWeightUnit => '重量単位';

  @override
  String get settingsSecurity => 'セキュリティ';

  @override
  String get settingsAppLock => 'アプリロック (Face ID / Touch ID)';

  @override
  String get settingsLegal => '規約・プライバシー';

  @override
  String get settingsPrivacyPolicy => 'プライバシーポリシー';

  @override
  String get settingsTermsOfUse => '利用規約';

  @override
  String get settingsAccount => 'アカウント';

  @override
  String get settingsDeleteAccount => 'アカウント削除';

  @override
  String get settingsSignOut => 'ログアウト';

  @override
  String get settingsSignIn => 'ログイン / 新規登録';

  @override
  String get settingsUpgradePro => 'PROにアップグレード';

  @override
  String get settingsUnlockStats => '高度な分析機能を解放';

  @override
  String get settingsVersion => '筋トレノート v1.0.0';

  @override
  String get deleteAccountTitle => 'アカウントを削除';

  @override
  String get deleteAccountDescription =>
      'この操作は取り消せません。すべてのデータがサーバーとデバイスから完全に削除されます。';

  @override
  String get deleteAccountWillDelete => '以下のデータが完全に削除されます：';

  @override
  String get deleteAccountItem1 => 'すべてのトレーニング記録・ワークアウトログ';

  @override
  String get deleteAccountItem2 => 'ボディ写真・暗号化キー';

  @override
  String get deleteAccountItem3 => 'ハンコスタンプ・連続記録';

  @override
  String get deleteAccountItem4 => 'プロフィール・アカウント情報';

  @override
  String deleteAccountConfirmLabel(Object text) {
    return '確認のため「$text」と入力してください';
  }

  @override
  String get deleteAccountConfirm => '削除する';

  @override
  String get deleteAccountError => 'アカウントの削除に失敗しました。もう一度お試しください。';

  @override
  String get deleteAccountSuccess => 'アカウントが正常に削除されました';

  @override
  String get welcomeTitle => '筋トレノートへようこそ！💪';

  @override
  String get welcomeSubtitle => 'トレーニングの旅が始まります。一緒に頑張りましょう！';

  @override
  String get welcomeButton => 'さあ、始めよう！';

  @override
  String get appLockSubtitle => 'トレーニングデータにアクセスするには認証が必要です';

  @override
  String get appLockAuthPrompt => '筋トレノートのロック解除';

  @override
  String get appLockUsePasscode => 'パスコードを使用';

  @override
  String get appLockFaceId => 'Face IDで解除';

  @override
  String get appLockTouchId => 'Touch IDで解除';

  @override
  String get appLockTryAgain => 'もう一度試す';

  @override
  String get appLockCancelled => '認証がキャンセルされました';

  @override
  String get appLockFailed => '認証に失敗しました';

  @override
  String get appLockError => 'エラーが発生しました';

  @override
  String get appLockSecured => '生体認証で保護されています';

  @override
  String get premiumTitle => '筋トレノート PRO';

  @override
  String get premiumSubtitle => 'プロフェッショナルなツールでトレーニングの質を高めましょう。';

  @override
  String get premiumFeaturesUnlimitedTitle => '無制限の記録';

  @override
  String get premiumFeaturesUnlimitedDesc => 'すべてのセッションを制限なく記録できます。';

  @override
  String get premiumFeaturesStatsTitle => '高度な分析';

  @override
  String get premiumFeaturesStatsDesc => 'トレーニングの推移を詳細に分析できます。';

  @override
  String get premiumFeaturesCloudTitle => 'クラウド同期';

  @override
  String get premiumFeaturesCloudDesc => 'デバイス間でデータを安全に同期します。';

  @override
  String get premiumFeaturesProgramsTitle => '限定プログラム';

  @override
  String get premiumFeaturesProgramsDesc => 'プロのトレーニングプランにアクセスできます。';

  @override
  String get premiumPlansAnnual => '年額プラン';

  @override
  String get premiumPlansPrice => '4,900円 / 年';

  @override
  String get premiumPlansSave => '50% お得';

  @override
  String get premiumStartTrial => '7日間の無料トライアルを開始';

  @override
  String get premiumTerms => 'いつでもキャンセル可能。利用規約とプライバシーポリシーが適用されます。';

  @override
  String get sessionTitle => 'トレーニング中';

  @override
  String get sessionFinish => '終了';

  @override
  String get sessionAddExercise => '種目を追加';

  @override
  String get sessionSets => 'セット';

  @override
  String get sessionKg => 'kg';

  @override
  String get sessionWeight => '重量';

  @override
  String get sessionReps => '回数';

  @override
  String get sessionStatus => '状態';

  @override
  String get sessionRestTimer => '休憩タイマー';

  @override
  String get sessionSummaryTitle => 'サマリー';

  @override
  String get sessionSummaryWorkoutComplete => 'トレーニング完了';

  @override
  String get sessionSummaryAwesomeJob => 'お疲れ様でした！';

  @override
  String get sessionSummaryTotalVolume => '総ボリューム';

  @override
  String get sessionSummaryTotalSets => '総セット数';

  @override
  String get sessionSummaryStampHanko => 'ハンコを押す';

  @override
  String get sessionSummaryDone => '完了';

  @override
  String get hankoWellDone => 'よくできました！';

  @override
  String hankoStreak(Object count) {
    return '$count日連続';
  }

  @override
  String get tabsHome => 'ホーム';

  @override
  String get tabsTraining => 'トレーニング';

  @override
  String get tabsBody => '記録';

  @override
  String get tabsCircle => 'サークル';

  @override
  String get tabsStats => '分析';

  @override
  String get menuBuilderTitle => 'メニュービルダー';

  @override
  String get menuBuilderMenuName => 'メニュー名';

  @override
  String get menuBuilderPlaceholder => '例：胸の日';

  @override
  String get menuBuilderExercises => '種目';

  @override
  String get menuBuilderAdd => '追加';

  @override
  String get menuBuilderNoExercises => '種目が追加されていません。';

  @override
  String get menuBuilderSaving => '保存中...';

  @override
  String get menuBuilderSaveMenu => 'メニューを保存';

  @override
  String get menuBuilderGuestLimitTitle => 'ゲスト制限';

  @override
  String get menuBuilderGuestLimitDesc =>
      'ゲストはメニューを1つしか作成できません。無制限に作成してクラウドに同期するには、ログインまたは登録してください！🏋️‍♂️';

  @override
  String get menuBuilderLater => '後で';

  @override
  String get menuBuilderLoginRegister => 'ログイン / 登録';

  @override
  String get libraryTitle => '種目ライブラリ';

  @override
  String get librarySearchPlaceholder => '種目を検索...';

  @override
  String get libraryLoadError => '種目の読み込みに失敗しました。';

  @override
  String get libraryNoResults => '種目が見つかりません。';

  @override
  String get exerciseDetailTitle => '詳細';

  @override
  String get exerciseDetailAddToMenu => 'メニューに追加';

  @override
  String get cameraPermissionTitle => 'カメラへのアクセスが必要です';

  @override
  String get cameraPermissionDesc => '写真はAES-256でローカル暗号化されます。カメラロールには保存されません。';

  @override
  String get cameraGrantPermission => '許可する';

  @override
  String get cameraEncrypting => '暗号化中...';

  @override
  String get cameraDecrypting => '復号中...';

  @override
  String get cameraAngleFront => '正面';

  @override
  String get cameraAngleSide => '側面';

  @override
  String get cameraAngleBack => '背面';

  @override
  String get onboardingStep1Title => '毎日の一歩を、かたちに';

  @override
  String get onboardingStep1Subtitle => '日本のハンコ文化から生まれた、シンプルで心地よいトレーニング記録。';

  @override
  String get onboardingStep1Button => 'はじめる';

  @override
  String get onboardingStep2Title => '進むべき道を選ぶ';

  @override
  String get onboardingStep2Subtitle => '現在のトレーニング経験に合わせて、あなたに最適な環境を整えます。';

  @override
  String get onboardingStep2Button => 'ポテンシャルを解放する';

  @override
  String get onboardingLevelsBeginnerTitle => 'ゆっくりスタート';

  @override
  String get onboardingLevelsBeginnerDesc => '無理せず、今日から少しずつ始めよう';

  @override
  String get onboardingLevelsIntermediateTitle => 'いい習慣に';

  @override
  String get onboardingLevelsIntermediateDesc => 'コツコツ続けて、いい流れができてきたね';

  @override
  String get onboardingLevelsAdvancedTitle => '自分のペースで';

  @override
  String get onboardingLevelsAdvancedDesc => '無理なく続けて、自分らしいスタイルへ';

  @override
  String get introSkip => 'スキップ';

  @override
  String get introNext => '次へ';

  @override
  String get introGetStarted => 'はじめる';

  @override
  String get introSlides => '[object Object],[object Object],[object Object]';

  @override
  String get authLoginTitle => '筋トレノート';

  @override
  String get authLoginSubtitle => 'おかえりなさい、トレーニングを始めましょう。';

  @override
  String get authLoginEmailPlaceholder => 'メールアドレス';

  @override
  String get authLoginPasswordPlaceholder => 'パスワード';

  @override
  String get authLoginSignIn => 'ログイン';

  @override
  String get authLoginEntering => 'ログイン中...';

  @override
  String get authLoginOrContinueWith => 'または以下で続ける';

  @override
  String get authLoginSignInApple => 'Appleでサインイン';

  @override
  String get authLoginNoAccount => 'アカウントを持っていませんか？ ';

  @override
  String get authLoginRegister => '新規登録';

  @override
  String get authLoginContinueAsGuest => 'ゲストとして続ける';

  @override
  String get authLoginErrorsMissingInfoTitle => '情報が不足しています';

  @override
  String get authLoginErrorsMissingInfoDesc => 'メールアドレスとパスワードを両方入力してください！💪';

  @override
  String get authLoginErrorsLoginFailedTitle => 'ログイン失敗';

  @override
  String get authLoginErrorsLoginFailedDesc =>
      'メールアドレスまたはパスワードが間違っています。もう一度確認してください！🧐';

  @override
  String get authLoginErrorsConnectionErrorTitle => '接続エラー';

  @override
  String get authLoginErrorsConnectionErrorDesc =>
      '現在Appleに接続できません。後でもう一度お試しください！🍎';

  @override
  String get authRegisterTitle => 'アカウント作成';

  @override
  String get authRegisterSubtitle => '筋トレノートに参加して、トレーニングを始めましょう。';

  @override
  String get authRegisterEmailPlaceholder => 'メールアドレス';

  @override
  String get authRegisterPasswordPlaceholder => 'パスワード';

  @override
  String get authRegisterConfirmPasswordPlaceholder => 'パスワード（確認用）';

  @override
  String get authRegisterContinue => '続ける';

  @override
  String get authRegisterCreating => 'アカウント作成中...';

  @override
  String get authRegisterOrContinueWith => 'または以下で続ける';

  @override
  String get authRegisterSignUpApple => 'Appleで登録';

  @override
  String get authRegisterHaveAccount => 'すでにアカウントを持っていますか？ ';

  @override
  String get authRegisterSignIn => 'ログイン';

  @override
  String get authRegisterErrorsMissingInfoTitle => '情報が不足しています';

  @override
  String get authRegisterErrorsMissingInfoDesc =>
      '新しいアカウントを作成するには、すべての情報を入力してください！✨';

  @override
  String get authRegisterErrorsPasswordMismatchTitle => 'パスワードが一致しません';

  @override
  String get authRegisterErrorsPasswordMismatchDesc =>
      'パスワードと確認用パスワードは同じである必要があります！🧐';

  @override
  String get authRegisterErrorsRegisterErrorTitle => '登録エラー';

  @override
  String get authRegisterErrorsRegisterErrorDesc =>
      'アカウントの作成中に問題が発生しました。メールアドレスまたはパスワード（6文字以上）をもう一度確認してください！🛠️';

  @override
  String get authRegisterErrorsRegisterSuccessTitle => '登録成功';

  @override
  String get authRegisterErrorsRegisterSuccessDesc =>
      'アカウントを認証するため、メールを確認してください！📧';

  @override
  String get authRegisterErrorsConnectionErrorTitle => '接続エラー';

  @override
  String get authRegisterErrorsConnectionErrorDesc => '現在Appleに接続できません。🍎';
}
