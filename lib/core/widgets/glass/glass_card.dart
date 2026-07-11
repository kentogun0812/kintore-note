import 'package:flutter/material.dart';
import '../../theme/design_tokens.dart';
import 'glass_container.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  const GlassCard({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.borderRadius,
    this.padding,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      width: width,
      height: height,
      borderRadius: borderRadius ?? AppRadius.lg,
      padding: padding ?? const EdgeInsets.all(AppSpacing.base),
      margin: margin,
      child: child,
    );
  }
}
