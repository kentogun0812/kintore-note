import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/design_tokens.dart';
import '../../../core/widgets/glass/glass_container.dart';

class RestTimerWidget extends StatefulWidget {
  final int initialSeconds;
  final VoidCallback onDismiss;

  const RestTimerWidget({super.key, this.initialSeconds = 60, required this.onDismiss});

  @override
  State<RestTimerWidget> createState() => _RestTimerWidgetState();
}

class _RestTimerWidgetState extends State<RestTimerWidget> {
  late int _remainingSeconds;
  Timer? _timer;
  bool _isRunning = true;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.initialSeconds;
    _startTimer();
  }

  @override
  void didUpdateWidget(RestTimerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialSeconds != widget.initialSeconds) {
      _remainingSeconds = widget.initialSeconds;
      if (!_isRunning) _resumeTimer();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _timer?.cancel();
        HapticFeedback.heavyImpact();
        widget.onDismiss();
      }
    });
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resumeTimer() {
    setState(() => _isRunning = true);
    _startTimer();
  }

  void _addTime(int seconds) {
    setState(() => _remainingSeconds += seconds);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _formattedTime {
    final m = _remainingSeconds ~/ 60;
    final s = _remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderRadius: AppRadius.full,
      border: Border.all(color: AppColors.borderSubtle, width: 1.5),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(width: AppSpacing.sm),
          const Icon(CupertinoIcons.timer, color: AppColors.accentPrimary, size: 24),
          const SizedBox(width: AppSpacing.sm),
          Text(
            _formattedTime,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: AppTypography.fontMono,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          // +30s button
          InkWell(
            onTap: () {
              HapticFeedback.lightImpact();
              _addTime(30);
            },
            borderRadius: BorderRadius.circular(AppRadius.sm),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.bgTertiary.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Text('+30s', style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(width: AppSpacing.xs),
          // Play/Pause
          IconButton(
            icon: Icon(_isRunning ? CupertinoIcons.pause_fill : CupertinoIcons.play_fill, color: AppColors.textPrimary),
            onPressed: () {
              HapticFeedback.lightImpact();
              if (_isRunning) _pauseTimer();
              else _resumeTimer();
            },
          ),
          // Close
          IconButton(
            icon: const Icon(CupertinoIcons.xmark_circle_fill, color: AppColors.textTertiary),
            onPressed: () {
              HapticFeedback.lightImpact();
              widget.onDismiss();
            },
          ),
        ],
      ),
    );
  }
}
