import 'package:flutter/material.dart';

class MascotPainter extends CustomPainter {
  const MascotPainter();

  @override
  void paint(Canvas canvas, Size size) {
    // Background shadow of mascot
    final shadowPaint = Paint()..color = Colors.black26;
    canvas.drawOval(
      Rect.fromLTRB(size.width * 0.2, size.height * 0.93, size.width * 0.8, size.height * 0.99),
      shadowPaint,
    );

    final bodyPaint = Paint()..color = const Color(0xFF9D3EF4); // Duolingo purple
    final eyeWhitePaint = Paint()..color = Colors.white;
    final cheekPaint = Paint()..color = const Color(0xFFFF528E);
    final mouthPaint = Paint()..color = const Color(0xFF1E0B42);
    final tonguePaint = Paint()..color = const Color(0xFFFF5B80);
    
    // Draw body: A blob with 2 rounded ear-like bumps or smooth shape
    final bodyPath = Path()
      ..moveTo(size.width * 0.25, size.height * 0.8)
      ..cubicTo(size.width * 0.15, size.height * 0.5, size.width * 0.2, size.height * 0.3, size.width * 0.5, size.height * 0.3)
      ..cubicTo(size.width * 0.8, size.height * 0.3, size.width * 0.85, size.height * 0.5, size.width * 0.75, size.height * 0.8)
      ..cubicTo(size.width * 0.65, size.height * 0.92, size.width * 0.35, size.height * 0.92, size.width * 0.25, size.height * 0.8)
      ..close();
    canvas.drawPath(bodyPath, bodyPaint);

    // Draw Flame on head
    final flameOuterPaint = Paint()..color = const Color(0xFFFF6F00);
    final flameInnerPaint = Paint()..color = const Color(0xFFFFD54F);
    
    // Large flame on top of head
    final flamePath = Path()
      ..moveTo(size.width * 0.5, size.height * 0.08)
      ..cubicTo(size.width * 0.65, size.height * 0.15, size.width * 0.62, size.height * 0.32, size.width * 0.5, size.height * 0.32)
      ..cubicTo(size.width * 0.38, size.height * 0.32, size.width * 0.35, size.height * 0.15, size.width * 0.5, size.height * 0.08)
      ..close();
    canvas.drawPath(flamePath, flameOuterPaint);

    final flameInnerPath = Path()
      ..moveTo(size.width * 0.5, size.height * 0.15)
      ..cubicTo(size.width * 0.58, size.height * 0.2, size.width * 0.56, size.height * 0.3, size.width * 0.5, size.height * 0.3)
      ..cubicTo(size.width * 0.44, size.height * 0.3, size.width * 0.42, size.height * 0.2, size.width * 0.5, size.height * 0.15)
      ..close();
    canvas.drawPath(flameInnerPath, flameInnerPaint);

    // Draw Legs
    final legPaint = Paint()
      ..color = const Color(0xFF1E0B42)
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;
    // Left leg
    canvas.drawLine(Offset(size.width * 0.38, size.height * 0.88), Offset(size.width * 0.36, size.height * 0.96), legPaint);
    canvas.drawOval(Rect.fromLTWH(size.width * 0.30, size.height * 0.94, 16, 6), Paint()..color = const Color(0xFF1E0B42));
    // Right leg
    canvas.drawLine(Offset(size.width * 0.62, size.height * 0.88), Offset(size.width * 0.64, size.height * 0.96), legPaint);
    canvas.drawOval(Rect.fromLTWH(size.width * 0.58, size.height * 0.94, 16, 6), Paint()..color = const Color(0xFF1E0B42));

    // Draw Hands
    // Left hand pointing slightly down
    final leftHandPath = Path()
      ..moveTo(size.width * 0.25, size.height * 0.6)
      ..cubicTo(size.width * 0.12, size.height * 0.62, size.width * 0.12, size.height * 0.72, size.width * 0.23, size.height * 0.72);
    canvas.drawPath(leftHandPath, Paint()..color = const Color(0xFF8C32E6));

    // Right hand: Thumbs-up
    final rightHandPath = Path()
      ..moveTo(size.width * 0.75, size.height * 0.6)
      ..cubicTo(size.width * 0.92, size.height * 0.58, size.width * 0.95, size.height * 0.72, size.width * 0.78, size.height * 0.74);
    canvas.drawPath(rightHandPath, Paint()..color = const Color(0xFF8C32E6));
    
    // Thumbs-up circle representing thumb
    canvas.drawCircle(Offset(size.width * 0.88, size.height * 0.58), 10, Paint()..color = const Color(0xFF9D3EF4));
    canvas.drawOval(
      Rect.fromLTWH(size.width * 0.84, size.height * 0.50, 8, 14),
      Paint()..color = const Color(0xFF9D3EF4),
    );

    // Draw Eyes
    final leftEyeCenter = Offset(size.width * 0.38, size.height * 0.53);
    final rightEyeCenter = Offset(size.width * 0.62, size.height * 0.53);
    
    canvas.drawCircle(leftEyeCenter, 16, eyeWhitePaint);
    canvas.drawCircle(rightEyeCenter, 16, eyeWhitePaint);

    // Heart pupils
    _drawHeart(canvas, leftEyeCenter + const Offset(0, -2), 12, const Color(0xFFFF528E));
    _drawHeart(canvas, rightEyeCenter + const Offset(0, -2), 12, const Color(0xFFFF528E));

    // Pink cheeks
    canvas.drawOval(
      Rect.fromLTWH(size.width * 0.24, size.height * 0.60, 10, 6),
      cheekPaint..color = const Color(0xFFFF528E).withValues(alpha: 0.7),
    );
    canvas.drawOval(
      Rect.fromLTWH(size.width * 0.68, size.height * 0.60, 10, 6),
      cheekPaint..color = const Color(0xFFFF528E).withValues(alpha: 0.7),
    );

    // Mouth (surprised open oval)
    final mouthRect = Rect.fromLTWH(size.width * 0.45, size.height * 0.63, size.width * 0.10, size.height * 0.08);
    canvas.drawOval(mouthRect, mouthPaint);
    
    // Tongue
    final tongueClipPath = Path()..addOval(mouthRect);
    canvas.save();
    canvas.clipPath(tongueClipPath);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.70), 6, tonguePaint);
    canvas.restore();
  }

  void _drawHeart(Canvas canvas, Offset center, double size, Color color) {
    final paint = Paint()..color = color;
    final path = Path();
    final width = size;
    final height = size;
    
    path.moveTo(center.dx, center.dy + height * 0.35);
    path.cubicTo(
        center.dx - width * 0.55, center.dy - height * 0.3,
        center.dx - width * 0.55, center.dy - height * 0.85,
        center.dx, center.dy - height * 0.35);
    path.cubicTo(
        center.dx + width * 0.55, center.dy - height * 0.85,
        center.dx + width * 0.55, center.dy - height * 0.3,
        center.dx, center.dy + height * 0.35);
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
