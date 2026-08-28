import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'screens/auth/auth_gate.dart';
import 'theme/app_theme.dart';

/// نزلاوي — تطبيق مجتمع قرية النزل
///
/// بعد flutterfire configure فك التعليق على DefaultFirebaseOptions
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        // options: DefaultFirebaseOptions.currentPlatform,
      );
    }
  } catch (_) {
    // بدون firebase_options يشتغل وضع تجريبي محلي
  }
  runApp(const NazlawiApp());
}

class NazlawiApp extends StatelessWidget {
  const NazlawiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'نزلاوي',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      locale: const Locale('ar'),
      supportedLocales: const [Locale('ar'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child ?? const SizedBox.shrink(),
        );
      },
      home: const AuthGate(),
    );
  }
}
