import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/design_tokens.dart';

class HankoStampModal extends StatefulWidget {
  const HankoStampModal({super.key});

  static Future<void> show(BuildContext context) {
    return showGeneralDialog(
      context: context,
      barrierColor: Colors.black87,
      barrierDismissible: false,
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) {
        return const HankoStampModal();
      },
    );
  }

  @override
  State<HankoStampModal> createState() => _HankoStampModalState();
}

class _HankoStampModalState extends State<HankoStampModal> {
  @override
  void initState() {
    super.initState();
    _playSequence();
  }

  Future<void> _playSequence() async {
    // Wait for the stamp animation to hit (400ms duration)
    await Future.delayed(const Duration(milliseconds: 400));
    HapticFeedback.heavyImpact(); // Boom!
    
    // Hold it on screen to appreciate the animation
    await Future.delayed(const Duration(milliseconds: 1500)); 
    
    if (mounted) {
      context.pop(); // close modal
      context.pop(); // close workout session screen
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'WORKOUT COMPLETE!',
              style: TextStyle(
                color: AppColors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
                fontFamily: AppTypography.fontEn,
                letterSpacing: 1.5,
              ),
            )
            .animate()
            .fadeIn(duration: 300.ms)
            .slideY(begin: 0.5, curve: Curves.easeOut),
            
            const SizedBox(height: 60),
            
            // The Hanko Stamp
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                color: AppColors.accentSecondary,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accentSecondary.withValues(alpha: 0.5),
                    blurRadius: 30,
                    spreadRadius: 10,
                  )
                ],
              ),
              child: const Center(
                child: Text(
                  '済',
                  style: TextStyle(
                    fontSize: 80,
                    color: AppColors.textInverse,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            )
            .animate()
            .scale(
              begin: const Offset(4, 4), 
              end: const Offset(1, 1), 
              curve: Curves.easeInCubic, 
              duration: 400.ms
            )
            .rotate(begin: -0.2, end: 0, curve: Curves.easeInCubic),
            
            const SizedBox(height: 60),
            
            const Text(
              'Streak: 7 Days 🔥',
              style: TextStyle(
                color: AppColors.accentWarning,
                fontSize: 24,
                fontWeight: FontWeight.bold,
                fontFamily: AppTypography.fontEn,
              ),
            )
            .animate(delay: 500.ms)
            .fadeIn(duration: 300.ms)
            .slideY(begin: 0.5),
          ],
        ),
      ),
    );
  }
}
