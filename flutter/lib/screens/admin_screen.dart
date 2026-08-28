import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = VillageRepository.instance;
    return ListenableBuilder(
      listenable: repo,
      builder: (context, _) {
        final pending = repo.pendingUsers;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
          children: [
            Row(
              children: [
                _stat('أعضاء', '${repo.users.length}'),
                const SizedBox(width: 8),
                _stat('بانتظار الموافقة', '${pending.length}'),
                const SizedBox(width: 8),
                _stat('مشتركين',
                    '${repo.users.where((u) => u.subscribed).length}'),
              ],
            ),
            const SizedBox(height: 16),
            const Text('طلبات الانضمام',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 8),
            if (pending.isEmpty)
              const Card(
                child: ListTile(
                  title: Text('لا توجد طلبات معلّقة'),
                  subtitle: Text('الأعضاء الجدد هيظهروا هنا بعد تسجيل الدخول'),
                ),
              ),
            ...pending.map((u) => Card(
                  child: ListTile(
                    title: Text(u.name),
                    subtitle: Text('${u.phone} · ${u.neighborhood ?? 'النزل'}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          tooltip: 'رفض',
                          onPressed: () => repo.setApproved(u.id, false),
                          icon: const Icon(Icons.close,
                              color: NazlawiColors.coral),
                        ),
                        IconButton(
                          tooltip: 'موافقة',
                          onPressed: () async {
                            await repo.setApproved(u.id, true);
                            await AuthService.instance.refreshCurrent();
                          },
                          icon: const Icon(Icons.check_circle,
                              color: NazlawiColors.emerald),
                        ),
                      ],
                    ),
                  ),
                )),
            const SizedBox(height: 16),
            const Text('الاشتراكات',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 8),
            ...repo.users.map((u) => Card(
                  child: SwitchListTile(
                    title: Text(u.name),
                    subtitle: Text(
                        '${u.phone}\n${u.approved ? 'موافق عليه' : 'معلّق'} · ${u.role.name}'),
                    value: u.subscribed,
                    activeColor: NazlawiColors.emerald,
                    onChanged: (v) => repo.setSubscribed(u.id, v),
                  ),
                )),
          ],
        );
      },
    );
  }

  Widget _stat(String label, String value) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Text(value,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: NazlawiColors.emeraldDark,
                  )),
              Text(label,
                  style: const TextStyle(
                      fontSize: 12, color: NazlawiColors.slate400)),
            ],
          ),
        ),
      ),
    );
  }
}
