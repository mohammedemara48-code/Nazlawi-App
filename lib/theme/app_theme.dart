import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// لوحة نزلاوي: زمرد القرية + أردواز نظيف
class NazlawiColors {
  static const Color emerald = Color(0xFF047857);
  static const Color emeraldDark = Color(0xFF065F46);
  static const Color emeraldLight = Color(0xFFD1FAE5);
  static const Color mint = Color(0xFF10B981);
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate900 = Color(0xFF0F172A);
  static const Color sand = Color(0xFFF5EDE0);
  static const Color coral = Color(0xFFD97757);
  static const Color white = Colors.white;
}

class AppTheme {
  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: NazlawiColors.emerald,
        primary: NazlawiColors.emerald,
        secondary: NazlawiColors.mint,
        surface: NazlawiColors.slate50,
        brightness: Brightness.light,
      ),
    );

    return base.copyWith(
      scaffoldBackgroundColor: NazlawiColors.slate50,
      appBarTheme: AppBarTheme(
        backgroundColor: NazlawiColors.white,
        foregroundColor: NazlawiColors.slate900,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.cairo(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: NazlawiColors.slate900,
        ),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: NazlawiColors.white,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardTheme(
        color: NazlawiColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: NazlawiColors.slate200),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: NazlawiColors.emerald,
        foregroundColor: Colors.white,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: NazlawiColors.slate100,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
      ),
      textTheme: GoogleFonts.cairoTextTheme(base.textTheme).apply(
        bodyColor: NazlawiColors.slate800,
        displayColor: NazlawiColors.slate900,
      ),
    );
  }
}
