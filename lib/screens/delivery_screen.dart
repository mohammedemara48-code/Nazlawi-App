import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final repo = VillageRepository.instance;
    return ListenableBuilder(
      listenable: Listenable.merge([repo, AuthService.instance]),
      builder: (context, _) {
        final me = AuthService.instance.currentUser;
        DeliveryAgent? mine;
        if (me != null) {
          for (final a in repo.agents) {
            if (a.id == me.id) {
              mine = a;
              break;
            }
          }
        }
        final available = mine?.status == DeliveryStatus.available;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
          children: [
            Card(
              color: NazlawiColors.emeraldLight,
              child: SwitchListTile(
                title: const Text('أنا متاح للتوصيل',
                    style: TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text(available ? 'ظاهر للمناديب الآن' : 'غير ظاهر'),
                value: available,
                activeColor: NazlawiColors.emerald,
                onChanged: me == null
                    ? null
                    : (v) => repo.upsertMyDelivery(
                          user: me,
                          status: v
                              ? DeliveryStatus.available
                              : DeliveryStatus.offline,
                        ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('مندوبو نزلاوي',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 8),
            ...repo.agents.map((a) => Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: a.status == DeliveryStatus.available
                          ? NazlawiColors.emeraldLight
                          : NazlawiColors.slate200,
                      child: Icon(Icons.delivery_dining,
                          color: a.status == DeliveryStatus.available
                              ? NazlawiColors.emeraldDark
                              : NazlawiColors.slate400),
                    ),
                    title: Text(a.name,
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text('${a.vehicle} · تقييم ${a.rating}'),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_statusAr(a.status),
                            style: TextStyle(
                              color: a.status == DeliveryStatus.available
                                  ? NazlawiColors.emerald
                                  : NazlawiColors.slate400,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            )),
                        Text(a.phone,
                            style: const TextStyle(
                                fontSize: 11, color: NazlawiColors.slate400)),
                      ],
                    ),
                  ),
                )),
          ],
        );
      },
    );
  }

  String _statusAr(DeliveryStatus s) => switch (s) {
        DeliveryStatus.available => 'متاح',
        DeliveryStatus.busy => 'مشغول',
        DeliveryStatus.offline => 'غير متصل',
      };
}
