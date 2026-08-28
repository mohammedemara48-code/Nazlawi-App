import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../services/village_repository.dart';
import '../shell_screen.dart';
import 'pending_screen.dart';
import 'phone_login_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;
    final repo = VillageRepository.instance;
    return ListenableBuilder(
      listenable: Listenable.merge([auth, repo]),
      builder: (context, _) {
        if (!auth.isLoggedIn) return const PhoneLoginScreen();
        if (!auth.isApproved) return const PendingScreen();
        return const ShellScreen();
      },
    );
  }
}
