import 'dart:ui';
import 'package:flutter/material.dart';
import 'design_tokens.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgPrimary,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      splashFactory: NoSplash.splashFactory,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentPrimary,
        secondary: AppColors.accentSecondary,
        surface: AppColors.bgSecondary,
        error: AppColors.accentWarning,
        onPrimary: AppColors.textInverse,
        onSecondary: AppColors.textInverse,
        onSurface: AppColors.textPrimary,
        onError: AppColors.textInverse,
      ),
      cardTheme: CardThemeData(
        color: AppColors.bgSecondary,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          side: const BorderSide(
            color: AppColors.borderDefault,
            width: 1,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtle,
        thickness: 1,
        space: 1,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontFamily: AppTypography.fontEn,
          fontSize: AppTypography.fontSize4Xl,
          fontWeight: AppTypography.fontWeightBold,
          color: AppColors.textPrimary,
        ),
        headlineLarge: TextStyle(
          fontFamily: AppTypography.fontEn,
          fontSize: AppTypography.fontSizeLg,
          fontWeight: AppTypography.fontWeightBold,
          color: AppColors.textPrimary,
        ),
        titleMedium: TextStyle(
          fontFamily: AppTypography.fontEn,
          fontSize: AppTypography.fontSizeMd,
          fontWeight: AppTypography.fontWeightSemibold,
          color: AppColors.textPrimary,
        ),
        bodyLarge: TextStyle(
          fontFamily: AppTypography.fontEn,
          fontSize: AppTypography.fontSizeBase,
          fontWeight: AppTypography.fontWeightRegular,
          color: AppColors.textPrimary,
        ),
        bodyMedium: TextStyle(
          fontFamily: AppTypography.fontEn,
          fontSize: AppTypography.fontSizeSm,
          fontWeight: AppTypography.fontWeightRegular,
          color: AppColors.textSecondary,
        ),
        labelSmall: TextStyle(
          fontFamily: AppTypography.fontEn,
          fontSize: AppTypography.fontSizeXs,
          fontWeight: AppTypography.fontWeightMedium,
          color: AppColors.textTertiary,
        ),
      ),
      extensions: const [
        GlassThemeExtension(
          blurX: 20.0,
          blurY: 20.0,
          bgColor: AppColors.glassBgDark,
          borderColor: AppColors.glassBorderDark,
          shadows: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
      ],
    );
  }
}

class GlassThemeExtension extends ThemeExtension<GlassThemeExtension> {
  final double blurX;
  final double blurY;
  final Color bgColor;
  final Color borderColor;
  final List<BoxShadow>? shadows;

  const GlassThemeExtension({
    required this.blurX,
    required this.blurY,
    required this.bgColor,
    required this.borderColor,
    this.shadows,
  });

  @override
  GlassThemeExtension copyWith({
    double? blurX,
    double? blurY,
    Color? bgColor,
    Color? borderColor,
    List<BoxShadow>? shadows,
  }) {
    return GlassThemeExtension(
      blurX: blurX ?? this.blurX,
      blurY: blurY ?? this.blurY,
      bgColor: bgColor ?? this.bgColor,
      borderColor: borderColor ?? this.borderColor,
      shadows: shadows ?? this.shadows,
    );
  }

  @override
  GlassThemeExtension lerp(ThemeExtension<GlassThemeExtension>? other, double t) {
    if (other is! GlassThemeExtension) return this;
    return GlassThemeExtension(
      blurX: lerpDouble(blurX, other.blurX, t)!,
      blurY: lerpDouble(blurY, other.blurY, t)!,
      bgColor: Color.lerp(bgColor, other.bgColor, t)!,
      borderColor: Color.lerp(borderColor, other.borderColor, t)!,
      shadows: shadows,
    );
  }
}
