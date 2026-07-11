import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/design_tokens.dart';

Color getBadgeColor(int days) {
  if (days < 3) return const Color(0xFFA1A1AA); // Zinc
  if (days >= 365) return const Color(0xFFD946EF); // Fuchsia
  if (days >= 180) return const Color(0xFFF97316); // Orange
  if (days >= 125) return const Color(0xFF06B6D4); // Cyan
  if (days >= 75) return const Color(0xFFEC4899); // Pink
  if (days >= 50) return const Color(0xFF8B5CF6); // Purple
  if (days >= 30) return const Color(0xFFEF4444); // Red
  if (days >= 14) return const Color(0xFF10B981); // Emerald
  if (days >= 7) return const Color(0xFFF59E0B); // Amber
  return const Color(0xFF3B82F6); // Blue
}

class MilestoneBadge extends StatelessWidget {
  final int days;
  final bool isUnlocked;
  final bool isActive;

  const MilestoneBadge({
    super.key,
    required this.days,
    required this.isUnlocked,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget badge = Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: isUnlocked
            ? [
                BoxShadow(
                  color: getBadgeColor(days).withOpacity(isActive ? 0.6 : 0.3),
                  blurRadius: isActive ? 16 : 8,
                  spreadRadius: isActive ? 4 : 2,
                )
              ]
            : [],
      ),
      child: CustomPaint(
        painter: MilestoneBadgePainter(
          days: days,
          isUnlocked: isUnlocked,
          badgeColor: getBadgeColor(days),
        ),
      ),
    );

    if (isActive) {
      badge = badge.animate(onPlay: (controller) => controller.repeat(reverse: true))
          .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.05, 1.05), duration: 1000.ms)
          .shimmer(duration: 2000.ms, color: Colors.white24);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        badge,
      ],
    );
  }
}

class MilestoneBadgePainter extends CustomPainter {
  final int days;
  final bool isUnlocked;
  final Color badgeColor;

  MilestoneBadgePainter({
    required this.days,
    required this.isUnlocked,
    required this.badgeColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Base circle paint
    final baseColor = isUnlocked ? badgeColor : const Color(0xFF2C2C2E);
    final basePaint = Paint()
      ..color = baseColor.withOpacity(isUnlocked ? 0.15 : 0.8)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, basePaint);

    // Border paint
    final borderPaint = Paint()
      ..color = isUnlocked ? badgeColor : const Color(0xFF3A3A3C)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;
    canvas.drawCircle(center, radius - 1.5, borderPaint);

    // Draw internal illustration based on days
    final drawColor = isUnlocked ? badgeColor : const Color(0xFF8E8E93);
    
    // Use the reusable MascotFacePainter logic
    final facePainter = MascotFacePainter(
      days: days,
      color: drawColor,
      isUnlocked: isUnlocked,
    );
    // Draw face scaled down inside the badge
    canvas.save();
    canvas.translate(center.dx, center.dy - radius * 0.1);
    // The face painter expects a 0,0 center. We give it a size.
    facePainter.drawFace(canvas, const Offset(0, 0), radius * 0.55);
    canvas.restore();

    // Draw days text at bottom of badge
    final textPainter = TextPainter(
      text: TextSpan(
        text: days.toString(),
        style: TextStyle(
          color: isUnlocked ? Colors.white : const Color(0xFF8E8E93),
          fontSize: 16,
          fontWeight: FontWeight.bold,
          fontFamily: AppTypography.fontEn,
          shadows: isUnlocked
              ? [
                  const Shadow(
                    color: Colors.black45,
                    offset: Offset(1, 1),
                    blurRadius: 2,
                  )
                ]
              : [],
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(center.dx - textPainter.width / 2, center.dy + radius * 0.35 - textPainter.height / 2),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Reusable painter for the face so we can use it as a Hanko stamp
class MascotFacePainter extends CustomPainter {
  final int days;
  final Color color;
  final bool isUnlocked;

  MascotFacePainter({
    required this.days,
    required this.color,
    this.isUnlocked = true,
  });

  @override
  void paint(Canvas canvas, Size size) {
    drawFace(canvas, Offset(size.width / 2, size.height / 2), size.width / 2);
  }

  void drawFace(Canvas canvas, Offset center, double size) {
    final bodyPaint = Paint()..color = color;
    // Base body blob
    final rect = Rect.fromCenter(center: center - Offset(0, size * 0.1), width: size * 1.1, height: size * 0.9);
    canvas.drawRRect(RRect.fromRectAndRadius(rect, Radius.circular(size * 0.4)), bodyPaint);

    // Eyes
    final eyePaint = Paint()..color = isUnlocked ? Colors.white : const Color(0xFF1C1C1E);
    final pupilPaint = Paint()..color = isUnlocked ? Colors.black : const Color(0xFF8E8E93);
    
    final eyeSize = size * 0.2;
    canvas.drawCircle(center + Offset(-size * 0.25, -size * 0.1), eyeSize, eyePaint);
    canvas.drawCircle(center + Offset(size * 0.25, -size * 0.1), eyeSize, eyePaint);
    canvas.drawCircle(center + Offset(-size * 0.25, -size * 0.1), eyeSize * 0.5, pupilPaint);
    canvas.drawCircle(center + Offset(size * 0.25, -size * 0.1), eyeSize * 0.5, pupilPaint);

    // Mouth
    final mouthPaint = Paint()
      ..color = isUnlocked ? const Color(0xFF1E0B42) : const Color(0xFF1C1C1E)
      ..style = PaintingStyle.fill;
    canvas.drawOval(
      Rect.fromCenter(center: center + Offset(0, size * 0.15), width: size * 0.2, height: size * 0.15),
      mouthPaint,
    );

    // Evolve character based on days
    if (days >= 3 && days < 7) {
      // Earmuffs
      _drawEarmuffs(canvas, center, size);
    } else if (days >= 7 && days < 14) {
      // Sprout
      _drawSprout(canvas, center, size);
    } else if (days >= 14 && days < 30) {
      // Headband
      _drawHeadband(canvas, center, size);
    } else if (days >= 30 && days < 50) {
      // Small Crown
      _drawCrown(canvas, center, size, small: true);
    } else if (days >= 50 && days < 75) {
      // Ninja Mask
      _drawNinjaMask(canvas, center, size);
    } else if (days >= 75 && days < 125) {
      // Astronaut Helmet
      _drawAstronaut(canvas, center, size);
    } else if (days >= 125 && days < 180) {
      // Fire Aura
      _drawFireAura(canvas, center, size);
    } else if (days >= 180 && days < 365) {
      // Super Hair
      _drawSuperHair(canvas, center, size);
    } else if (days >= 365) {
      // Big King Crown & Robe
      _drawKing(canvas, center, size);
    }
  }

  void _drawEarmuffs(Canvas canvas, Offset center, double size) {
    final muffsPaint = Paint()
      ..color = isUnlocked ? const Color(0xFF60A5FA) : const Color(0xFF48484A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size * 0.15;
    canvas.drawArc(
      Rect.fromCenter(center: center - Offset(0, size * 0.15), width: size * 1.2, height: size * 0.8),
      3.14, 3.14, false, muffsPaint,
    );
    final muffsFillPaint = Paint()..color = isUnlocked ? const Color(0xFF2563EB) : const Color(0xFF3A3A3C);
    canvas.drawCircle(center + Offset(-size * 0.6, -size * 0.1), size * 0.22, muffsFillPaint);
    canvas.drawCircle(center + Offset(size * 0.6, -size * 0.1), size * 0.22, muffsFillPaint);
  }

  void _drawSprout(Canvas canvas, Offset center, double size) {
    final sproutPaint = Paint()
      ..color = isUnlocked ? const Color(0xFF4ADE80) : const Color(0xFF48484A)
      ..style = PaintingStyle.stroke
      ..strokeWidth = size * 0.1
      ..strokeCap = StrokeCap.round;
    
    final path = Path()
      ..moveTo(center.dx, center.dy - size * 0.5)
      ..quadraticBezierTo(center.dx + size * 0.2, center.dy - size * 0.7, center.dx + size * 0.3, center.dy - size * 0.8);
    canvas.drawPath(path, sproutPaint);
    
    // Leaf
    final leafPaint = Paint()..color = isUnlocked ? const Color(0xFF22C55E) : const Color(0xFF3A3A3C);
    canvas.drawOval(Rect.fromCenter(center: center + Offset(size * 0.35, -size * 0.8), width: size * 0.3, height: size * 0.15), leafPaint);
  }

  void _drawHeadband(Canvas canvas, Offset center, double size) {
    final bandPaint = Paint()..color = isUnlocked ? const Color(0xFFEF4444) : const Color(0xFF48484A);
    canvas.drawRect(Rect.fromCenter(center: center - Offset(0, size * 0.3), width: size * 1.05, height: size * 0.2), bandPaint);
    // Tails
    final tailPath = Path()
      ..moveTo(center.dx + size * 0.5, center.dy - size * 0.3)
      ..lineTo(center.dx + size * 0.8, center.dy - size * 0.1)
      ..lineTo(center.dx + size * 0.7, center.dy - size * 0.4)
      ..close();
    canvas.drawPath(tailPath, bandPaint);
  }

  void _drawCrown(Canvas canvas, Offset center, double size, {bool small = false}) {
    final crownColor = isUnlocked ? const Color(0xFFFBBF24) : const Color(0xFF48484A);
    final crownPaint = Paint()..color = crownColor;
    final scale = small ? 0.6 : 1.0;
    
    final path = Path()
      ..moveTo(center.dx - size * 0.4 * scale, center.dy - size * 0.45)
      ..lineTo(center.dx - size * 0.5 * scale, center.dy - size * 0.8 * scale)
      ..lineTo(center.dx - size * 0.2 * scale, center.dy - size * 0.6 * scale)
      ..lineTo(center.dx, center.dy - size * 0.9 * scale)
      ..lineTo(center.dx + size * 0.2 * scale, center.dy - size * 0.6 * scale)
      ..lineTo(center.dx + size * 0.5 * scale, center.dy - size * 0.8 * scale)
      ..lineTo(center.dx + size * 0.4 * scale, center.dy - size * 0.45)
      ..close();
    canvas.drawPath(path, crownPaint);
  }

  void _drawNinjaMask(Canvas canvas, Offset center, double size) {
    final maskPaint = Paint()..color = isUnlocked ? const Color(0xFF111827) : const Color(0xFF1C1C1E);
    // Cover the bottom half
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: center + Offset(0, size * 0.15), width: size * 1.15, height: size * 0.5),
        Radius.circular(size * 0.2)
      ), 
      maskPaint
    );
  }

  void _drawAstronaut(Canvas canvas, Offset center, double size) {
    final helmetPaint = Paint()
      ..color = isUnlocked ? Colors.white.withOpacity(0.3) : const Color(0xFF48484A).withOpacity(0.3)
      ..style = PaintingStyle.fill;
    final helmetBorder = Paint()
      ..color = isUnlocked ? Colors.white : const Color(0xFF8E8E93)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final rect = Rect.fromCenter(center: center - Offset(0, size * 0.05), width: size * 1.3, height: size * 1.2);
    canvas.drawOval(rect, helmetPaint);
    canvas.drawOval(rect, helmetBorder);
  }

  void _drawFireAura(Canvas canvas, Offset center, double size) {
    final auraPaint = Paint()..color = isUnlocked ? const Color(0xFFF97316).withOpacity(0.5) : const Color(0xFF48484A).withOpacity(0.5);
    canvas.drawCircle(center, size * 1.2, auraPaint);
    final corePaint = Paint()..color = isUnlocked ? const Color(0xFFFBBF24).withOpacity(0.5) : const Color(0xFF8E8E93).withOpacity(0.5);
    canvas.drawCircle(center, size * 1.0, corePaint);
  }

  void _drawSuperHair(Canvas canvas, Offset center, double size) {
    final hairPaint = Paint()..color = isUnlocked ? const Color(0xFFFBBF24) : const Color(0xFF48484A);
    final path = Path()
      ..moveTo(center.dx - size * 0.5, center.dy - size * 0.3)
      ..lineTo(center.dx - size * 0.6, center.dy - size * 0.9)
      ..lineTo(center.dx - size * 0.2, center.dy - size * 0.5)
      ..lineTo(center.dx, center.dy - size * 1.1)
      ..lineTo(center.dx + size * 0.2, center.dy - size * 0.5)
      ..lineTo(center.dx + size * 0.6, center.dy - size * 0.9)
      ..lineTo(center.dx + size * 0.5, center.dy - size * 0.3)
      ..close();
    canvas.drawPath(path, hairPaint);
  }

  void _drawKing(Canvas canvas, Offset center, double size) {
    _drawCrown(canvas, center, size, small: false);
    final robePaint = Paint()..color = isUnlocked ? const Color(0xFFDC2626) : const Color(0xFF48484A);
    final rect = Rect.fromCenter(center: center + Offset(0, size * 0.3), width: size * 1.2, height: size * 0.3);
    canvas.drawRRect(RRect.fromRectAndRadius(rect, Radius.circular(size * 0.1)), robePaint);
    // Fur collar
    final furPaint = Paint()..color = isUnlocked ? Colors.white : const Color(0xFF8E8E93);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromCenter(center: center + Offset(0, size * 0.15), width: size * 1.3, height: size * 0.15), Radius.circular(size * 0.1)), furPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
