import 'dart:typed_data';
import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/design_tokens.dart';
import 'camera_screen.dart';
import 'crypto_service.dart';

class BodyRecord {
  final String id;
  final Uint8List encryptedBytes;
  final DateTime date;

  BodyRecord({required this.id, required this.encryptedBytes, required this.date});
}

class BodyScreen extends StatefulWidget {
  const BodyScreen({super.key});

  @override
  State<BodyScreen> createState() => _BodyScreenState();
}

class _BodyScreenState extends State<BodyScreen> {
  final List<BodyRecord> _records = [];
  String? _unlockedId;

  Future<void> _openCamera() async {
    // Lấy bức ảnh gần nhất (đã giải mã) để làm Ghost Overlay
    Uint8List? lastImageBytes;
    if (_records.isNotEmpty) {
      lastImageBytes = CryptoService.decryptImage(_records.first.encryptedBytes);
    }

    final Uint8List? newImageBytes = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CameraScreen(previousImageBytes: lastImageBytes),
        fullscreenDialog: true,
      ),
    );

    if (newImageBytes != null) {
      // Thực hiện mã hoá ảnh AES-256 ngay trước khi lưu
      final encryptedBytes = CryptoService.encryptImage(newImageBytes);
      
      setState(() {
        _records.insert(0, BodyRecord(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          encryptedBytes: encryptedBytes,
          date: DateTime.now(),
        ));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.base),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Progress Photos',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: AppTypography.fontSize2Xl,
                      fontWeight: AppTypography.fontWeightBold,
                      fontFamily: AppTypography.fontEn,
                    ),
                  ),
                  const Icon(CupertinoIcons.lock_shield_fill, color: AppColors.accentSuccess),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              const Text(
                'End-to-end encrypted gallery. Tap to unlock an image.',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: AppSpacing.lg),
              
              Expanded(
                child: _records.isEmpty
                    ? const Center(
                        child: Text(
                          'No photos yet.\nTap + to take your first secure photo.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppColors.textTertiary),
                        ),
                      )
                    : GridView.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: AppSpacing.md,
                          mainAxisSpacing: AppSpacing.md,
                          childAspectRatio: 0.75, // Tỷ lệ hình chữ nhật dọc
                        ),
                        itemCount: _records.length,
                        itemBuilder: (context, index) {
                          final record = _records[index];
                          final isUnlocked = _unlockedId == record.id;
                          
                          // Giải mã on-the-fly để hiển thị
                          final decryptedBytes = CryptoService.decryptImage(record.encryptedBytes);

                          return GestureDetector(
                            onTap: () {
                              setState(() {
                                _unlockedId = isUnlocked ? null : record.id;
                              });
                            },
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(AppRadius.lg),
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  Image.memory(
                                    decryptedBytes,
                                    fit: BoxFit.cover,
                                  ),
                                  // Hiệu ứng làm mờ bảo mật (Privacy Mode)
                                  if (!isUnlocked)
                                    BackdropFilter(
                                      filter: ImageFilter.blur(sigmaX: 25.0, sigmaY: 25.0),
                                      child: Container(
                                        color: AppColors.bgPrimary.withValues(alpha: 0.3),
                                        child: const Center(
                                          child: Icon(CupertinoIcons.eye_slash_fill, color: AppColors.textSecondary, size: 36),
                                        ),
                                      ),
                                    ),
                                  Positioned(
                                    bottom: 8,
                                    left: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(alpha: 0.6),
                                        borderRadius: BorderRadius.circular(AppRadius.sm),
                                      ),
                                      child: Text(
                                        DateFormat('dd MMM yyyy').format(record.date),
                                        style: const TextStyle(
                                          color: Colors.white, 
                                          fontSize: 10, 
                                          fontWeight: FontWeight.bold,
                                          fontFamily: AppTypography.fontEn,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 90.0),
        child: FloatingActionButton(
          onPressed: _openCamera,
          backgroundColor: AppColors.accentPrimary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
          child: const Icon(CupertinoIcons.camera_fill, color: AppColors.white),
        ),
      ),
    );
  }
}
