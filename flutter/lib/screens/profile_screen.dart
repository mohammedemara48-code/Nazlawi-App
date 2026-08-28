import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge(
          [AuthService.instance, VillageRepository.instance]),
      builder: (context, _) {
        final u = AuthService.instance.currentUser;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
          children: [
            const Center(
              child: CircleAvatar(
                radius: 44,
                backgroundColor: NazlawiColors.emeraldLight,
                child: Icon(Icons.person,
                    size: 48, color: NazlawiColors.emeraldDark),
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(u?.name ?? 'نزلاوي',
                  style: const TextStyle(
                      fontSize: 22, fontWeight: FontWeight.w800)),
            ),
            Center(
              child: Text(
                '${u?.neighborhood ?? 'النزل'} · ${u?.subscribed == true ? 'مشترك' : 'غير مشترك'}',
                style: const TextStyle(color: NazlawiColors.slate400),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.phone_outlined),
                    title: const Text('رقم الموبايل'),
                    subtitle: Text(u?.phone ?? '—'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.badge_outlined),
                    title: const Text('الدور'),
                    subtitle: Text(_roleAr(u?.role.name)),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.verified_outlined),
                    title: const Text('حالة الحساب'),
                    subtitle: Text(u?.approved == true
                        ? 'موافق عليه من إدارة القرية'
                        : 'بانتظار الموافقة'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: AuthService.instance.logout,
              icon: const Icon(Icons.logout),
              label: const Text('تسجيل الخروج'),
            ),
          ],
        );
      },
    );
  }

  String _roleAr(String? r) => switch (r) {
        'admin' => 'مدير القرية',
        'merchant' => 'تاجر',
        'driver' => 'سائق',
        'technician' => 'فني',
        'doctor' => 'طبيب',
        _ => 'ساكن',
      };
}
