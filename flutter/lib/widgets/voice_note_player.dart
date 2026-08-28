import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// مشغّل رسالة صوتية مبسّط — يُربط بـ just_audio في الإنتاج
class VoiceNotePlayer extends StatelessWidget {
  final int durationSec;
  final bool compact;
  final VoidCallback? onPlay;

  const VoiceNotePlayer({
    super.key,
    required this.durationSec,
    this.compact = false,
    this.onPlay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 10 : 14,
        vertical: compact ? 8 : 12,
      ),
      decoration: BoxDecoration(
        color: NazlawiColors.emeraldLight,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: onPlay,
            child: const CircleAvatar(
              radius: 16,
              backgroundColor: NazlawiColors.emerald,
              child: Icon(Icons.play_arrow_rounded,
                  color: Colors.white, size: 20),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: CustomPaint(
              painter: _WavePainter(),
              child: const SizedBox(height: 22),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            _fmt(durationSec),
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: NazlawiColors.emeraldDark,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(int s) {
    final m = (s ~/ 60).toString().padLeft(2, '0');
    final r = (s % 60).toString().padLeft(2, '0');
    return '$m:$r';
  }
}

class _WavePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = NazlawiColors.emerald
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    const bars = 28;
    for (var i = 0; i < bars; i++) {
      final x = i * (size.width / bars);
      final h = 4.0 + (i % 5) * 3.2 + (i.isEven ? 6 : 0);
      canvas.drawLine(
        Offset(x, size.height / 2 - h / 2),
        Offset(x, size.height / 2 + h / 2),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
