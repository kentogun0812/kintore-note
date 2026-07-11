import 'dart:ui';
import 'package:flutter/material.dart';
import 'glass_card.dart';

class GlassModal extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final double? borderRadius;

  const GlassModal({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.borderRadius,
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    double? width,
    double? height,
    double? borderRadius,
    bool barrierDismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierColor: Colors.black.withOpacity(0.4),
      builder: (BuildContext context) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Dialog(
            backgroundColor: Colors.transparent,
            elevation: 0,
            insetPadding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: GlassModal(
              width: width,
              height: height,
              borderRadius: borderRadius,
              child: child,
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      width: width ?? double.infinity,
      height: height,
      borderRadius: borderRadius ?? 16.0,
      padding: const EdgeInsets.all(20.0),
      child: child,
    );
  }
}
