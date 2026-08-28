import 'package:flutter/material.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class CarpoolScreen extends StatelessWidget {
  const CarpoolScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: VillageRepository.instance,
      builder: (context, _) {
        final carpools = VillageRepository.instance.carpools;
        return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
      children: [
        Card(
          color: NazlawiColors.emeraldLight,
          child: const ListTile(
            leading: Icon(Icons.info_outline, color: NazlawiColors.emeraldDark),
            title: Text('خدني معاك مجاناً بين أهل القرية'),
            subtitle: Text('انشر مشوارك أو احجز مقعد فاضى'),
          ),
        ),
        const SizedBox(height: 8),
        ...carpools.map((c) => Card(
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: NazlawiColors.sand,
                  child: Icon(Icons.groups_2, color: NazlawiColors.emeraldDark),
                ),
                title: Text('${c.from} ← ${c.to}',
                    style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text(
                    '${c.authorName} · ${c.seats} مقاعد\n${c.note}'),
                isThreeLine: true,
                trailing: FilledButton.tonal(
                  onPressed: () {},
                  child: const Text('أنا معاك'),
                ),
              ),
            )),
      ],
    );
      },
    );
  }
}
