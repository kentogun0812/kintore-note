import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/design_tokens.dart';

class CameraScreen extends StatefulWidget {
  final Uint8List? previousImageBytes; // For Ghost Overlay

  const CameraScreen({super.key, this.previousImageBytes});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription> _cameras = [];
  bool _isReady = false;
  bool _showGhost = true;
  bool _showGrid = true;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isNotEmpty) {
        // Try to find front camera first, or use the first available
        final camera = _cameras.firstWhere(
          (c) => c.lensDirection == CameraLensDirection.front,
          orElse: () => _cameras.first,
        );
        
        _controller = CameraController(
          camera, 
          ResolutionPreset.high,
          enableAudio: false,
        );
        await _controller!.initialize();
        if (mounted) setState(() => _isReady = true);
      }
    } catch (e) {
      debugPrint('Error initializing camera: $e');
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _takePicture() async {
    if (!_isReady || _controller == null) return;
    try {
      HapticFeedback.heavyImpact();
      final xFile = await _controller!.takePicture();
      final bytes = await xFile.readAsBytes();
      if (mounted) {
        Navigator.pop(context, bytes); // Return bytes to previous screen
      }
    } catch (e) {
      debugPrint('Error taking picture: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isReady || _controller == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CupertinoActivityIndicator(color: AppColors.white)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          fit: StackFit.expand,
          children: [
            // 1. Camera Preview
            CameraPreview(_controller!),
            
            // 2. Ghost Overlay (Previous Image)
            if (_showGhost && widget.previousImageBytes != null)
              Opacity(
                opacity: 0.4,
                child: Image.memory(
                  widget.previousImageBytes!,
                  fit: BoxFit.cover,
                ),
              ),
              
            // 3. Grid Overlay
            if (_showGrid)
              const CustomPaint(
                painter: GridPainter(),
              ),
              
            // Top Controls
            Positioned(
              top: AppSpacing.base,
              left: AppSpacing.base,
              right: AppSpacing.base,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(CupertinoIcons.xmark, color: AppColors.white, size: 28),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          _showGhost ? CupertinoIcons.square_on_square : CupertinoIcons.square, 
                          color: widget.previousImageBytes != null ? AppColors.white : AppColors.textTertiary,
                        ),
                        onPressed: widget.previousImageBytes != null 
                            ? () => setState(() => _showGhost = !_showGhost)
                            : null,
                      ),
                      IconButton(
                        icon: Icon(
                          _showGrid ? CupertinoIcons.grid : CupertinoIcons.rectangle, 
                          color: AppColors.white,
                        ),
                        onPressed: () => setState(() => _showGrid = !_showGrid),
                      ),
                    ],
                  )
                ],
              ),
            ),
            
            // Bottom Controls (Shutter Button)
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: _takePicture,
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.white, width: 4),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Container(
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.white,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class GridPainter extends CustomPainter {
  const GridPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.white.withValues(alpha: 0.4)
      ..strokeWidth = 1.0;

    final stepX = size.width / 3;
    final stepY = size.height / 3;

    for (int i = 1; i <= 2; i++) {
      canvas.drawLine(Offset(stepX * i, 0), Offset(stepX * i, size.height), paint);
      canvas.drawLine(Offset(0, stepY * i), Offset(size.width, stepY * i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
