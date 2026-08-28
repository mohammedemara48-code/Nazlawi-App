import 'package:flutter/material.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: VillageRepository.instance,
      builder: (context, _) {
        final services = VillageRepository.instance.services;
        return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
      children: [
        const TextField(
          decoration: InputDecoration(
            hintText: 'سباك، كهربائي، دكتور…',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        const SizedBox(height: 12),
        ...services.map((s) => Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: NazlawiColors.emeraldLight,
                  child: Text(
                    s.specialty.characters.first,
                    style: const TextStyle(
                      color: NazlawiColors.emeraldDark,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                title: Text(s.name,
                    style: const TextStyle(fontWeight: FontWeight.w800)),
                subtitle: Text('${s.specialty} · ${s.neighborhood}'),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('★ ${s.rating}',
                        style: const TextStyle(
                            color: NazlawiColors.coral,
                            fontWeight: FontWeight.w700)),
                    Text(s.phone,
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
}
