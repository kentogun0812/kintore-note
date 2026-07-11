import 'package:flutter/material.dart';

class AppColors {
  static const Color transparent = Colors.transparent;
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);

  // Dark Theme
  static const Color bgPrimary = Color(0xFF0A0A0A);
  static const Color bgSecondary = Color(0xFF141414);
  static const Color bgTertiary = Color(0xFF1E1E1E);
  static const Color bgElevated = Color(0xFF242424);

  static const Color textPrimary = Color(0xFFF5F5F5);
  static const Color textSecondary = Color(0xFFA0A0A0);
  static const Color textTertiary = Color(0xFF666666);
  static const Color textInverse = Color(0xFF0A0A0A);
  static const Color textLogo = Color(0xFFE54D42);

  static const Color accentPrimary = Color(0xFFE54D42);
  static const Color accentSecondary = Color(0xFFFF6B5B);
  static const Color accentSuccess = Color(0xFF34C759);
  static const Color accentWarning = Color(0xFFFF9500);
  static const Color accentInfo = Color(0xFF5AC8FA);

  static const Color borderDefault = Color(0xFF2A2A2A);
  static const Color borderSubtle = Color(0xFF1A1A1A);
  static const Color borderFocus = Color(0xFFE54D42);

  static const Color hankoInk = Color(0xFFC41E1E);
  static const Color hankoInkLight = Color(0xFFE54D42);
  static const Color hankoPaper = Color(0xFFFFF8F0);

  static const Color white80 = Color(0xCCFFFFFF);
  static const Color white50 = Color(0x80FFFFFF);
  static const Color black80 = Color(0xCC000000);
  static const Color black70 = Color(0xB2000000);
  static const Color black60 = Color(0x99000000);
  static const Color black50 = Color(0x80000000);
  static const Color accent06 = Color(0x0FE54D42);
  static const Color accent10 = Color(0x1AE54D42);
  static const Color accent12 = Color(0x1FE54D42);
  static const Color accent15 = Color(0x26E54D42);
  static const Color accent20 = Color(0x33E54D42);
  static const Color warning10 = Color(0x1AFF9500);
  static const Color warning20 = Color(0x33FF9500);

  // Reactions
  static const Color reactionMuscle = Color(0xFFFF6B35);
  static const Color reactionFire = Color(0xFFFF4444);
  static const Color reactionFlower = Color(0xFFFF69B4);

  // Glassmorphism Token Colors
  static const Color glassBgDark = Color(0x1A141414); // 10% opacity black-ish
  static const Color glassBgLight = Color(0x26FFFFFF); // 15% opacity white-ish
  static const Color glassBorderDark = Color(0x1FFFFFFF); // 12% opacity white border
  static const Color glassBorderLight = Color(0x1F000000); // 12% opacity black border
}

class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double base = 16.0;
  static const double medium = 18.0;
  static const double lg = 20.0;
  static const double xl = 24.0;
  static const double xxl = 40.0;
  static const double twoXl = 32.0;
  static const double threeXl = 40.0;
  static const double fourXl = 48.0;
}

class AppRadius {
  static const double sm = 6.0;
  static const double md = 10.0;
  static const double lg = 14.0;
  static const double xl = 20.0;
  static const double full = 9999.0;
}

class AppTypography {
  static const String fontJa = 'NotoSansJP';
  static const String fontEn = 'SF Pro Text';
  static const String fontMono = 'SF Mono';

  static const double fontSizeXs = 11.0;
  static const double fontSizeSm = 13.0;
  static const double fontSizeBase = 15.0;
  static const double fontSizeMd = 17.0;
  static const double fontSizeLg = 20.0;
  static const double fontSizeXl = 24.0;
  static const double fontSize2Xl = 28.0;
  static const double fontSize3Xl = 34.0;
  static const double fontSize4Xl = 40.0;
  static const double fontSizeHero = 56.0;

  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemibold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const FontWeight fontWeightHeavy = FontWeight.w800;

  static const double lineHeightTight = 1.2;
  static const double lineHeightNormal = 1.5;
  static const double lineHeightRelaxed = 1.75;
}
