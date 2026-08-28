import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../services/village_repository.dart';
import '../../theme/app_theme.dart';

class PendingScreen extends StatelessWidget {
  const PendingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;
    final repo = VillageRepository.instance;
    return Scaffold(
      body: ListenableBuilder(
        listenable: Listenable.merge([auth, repo]),
        builder: (context, _) {
          final u = auth.currentUser;
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                children: [
                  const Spacer(),
                  const CircleAvatar(
                    radius: 40,
                    backgroundColor: NazlawiColors.sand,
                    child: Icon(Icons.hourglass_top_rounded,
                        size: 36, color: NazlawiColors.emeraldDark),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'أهلاً ${u?.name ?? ''}',
                    style: const TextStyle(
                        fontSize: 24, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'طلبك واصل لإدارة نزلاوي.\nهتقدر تدخل قريتي والسوق بعد موافقة الأدمن.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: NazlawiColors.slate600, height: 1.6),
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.phone_outlined),
                      title: Text(u?.phone ?? ''),
                      subtitle: Text(u?.neighborhood ?? 'النزل'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () async {
                      await auth.refreshCurrent();
                      if (auth.isApproved && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('تمت الموافقة — أهلًا في النزل')),
                        );
                      }
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('تحديث حالة الطلب'),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: auth.logout,
                    child: const Text('تسجيل الخروج'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
