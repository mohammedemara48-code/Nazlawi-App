import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class TransportScreen extends StatelessWidget {
  const TransportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: VillageRepository.instance,
      builder: (context, _) {
        final rides = VillageRepository.instance.rides;
        return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
      children: [
        Wrap(
          spacing: 8,
          children: const [
            Chip(label: Text('توك توك'), avatar: Icon(Icons.electric_rickshaw)),
            Chip(label: Text('تاكسي'), avatar: Icon(Icons.local_taxi)),
            Chip(label: Text('نقل / نقلية'), avatar: Icon(Icons.local_shipping)),
          ],
        ),
        const SizedBox(height: 8),
        ...rides.map((r) => Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: NazlawiColors.emeraldLight,
                  child: Icon(_icon(r.type), color: NazlawiColors.emeraldDark),
                ),
                title: Text('${r.from} ← ${r.to}',
                    style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text(
                    '${r.driverName} · ${_typeAr(r.type)}\n${r.phone}'),
                isThreeLine: true,
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('${r.price.toStringAsFixed(0)} ج',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: NazlawiColors.emeraldDark,
                        )),
                    const SizedBox(height: 4),
                    FilledButton(
                      style: FilledButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                      ),
                      onPressed: () {},
                      child: const Text('احجز'),
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
      },
    );
  }

  IconData _icon(RideType t) => switch (t) {
        RideType.toktok => Icons.electric_rickshaw,
        RideType.taxi => Icons.local_taxi,
        RideType.truck => Icons.local_shipping,
      };

  String _typeAr(RideType t) => switch (t) {
        RideType.toktok => 'توك توك',
        RideType.taxi => 'تاكسي',
        RideType.truck => 'نقل',
      };
}
