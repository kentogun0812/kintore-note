import 'dart:ui';
import 'package:flutter/material.dart';
import '../../theme/theme.dart';

class GlassContainer extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Border? border;
  final double? blurX;
  final double? blurY;

  const GlassContainer({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.borderRadius,
    this.padding,
    this.margin,
    this.border,
    this.blurX,
    this.blurY,
  });

  @override
  Widget build(BuildContext context) {
    final glassTheme = Theme.of(context).extension<GlassThemeExtension>();
    final defaultRadius = borderRadius ?? 12.0;

    return Container(
      width: width,
      height: height,
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(defaultRadius),
        boxShadow: glassTheme?.shadows,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(defaultRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: blurX ?? glassTheme?.blurX ?? 20.0,
            sigmaY: blurY ?? glassTheme?.blurY ?? 20.0,
          ),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: glassTheme?.bgColor ?? const Color(0x1A141414),
              borderRadius: BorderRadius.circular(defaultRadius),
              border: border ??
                  Border.all(
                    color: glassTheme?.borderColor ?? const Color(0x1FFFFFFF),
                    width: 1.0,
                  ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
