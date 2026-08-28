import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';

class MarketScreen extends StatelessWidget {
  const MarketScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: VillageRepository.instance,
      builder: (context, _) {
        final products = VillageRepository.instance.products;
        return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
      children: [
        TextField(
          decoration: const InputDecoration(
            hintText: 'ابحث في سوق النزل…',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        const SizedBox(height: 14),
        ...products.map((p) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _ProductCard(product: p),
            )),
      ],
    );
      },
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                color: NazlawiColors.sand,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.shopping_basket_outlined,
                  color: NazlawiColors.emerald, size: 32),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.title,
                      style: const TextStyle(fontWeight: FontWeight.w800)),
                  Text(product.merchantName,
                      style: const TextStyle(
                          color: NazlawiColors.slate400, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(product.description),
                  const SizedBox(height: 6),
                  Text(
                    '${product.price.toStringAsFixed(0)} ج · ${product.unit}',
                    style: const TextStyle(
                      color: NazlawiColors.emeraldDark,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
            FilledButton(
              onPressed: () async {
                final me = AuthService.instance.currentUser;
                if (me != null) {
                  await VillageRepository.instance.reserveProduct(product, me);
                }
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('تم حجز «${product.title}» من التاجر'),
                    ),
                  );
                }
              },
              child: const Text('حجز'),
            ),
          ],
        ),
      ),
    );
  }
}
