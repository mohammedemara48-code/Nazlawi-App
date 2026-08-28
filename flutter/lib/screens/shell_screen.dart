import 'package:flutter/material.dart';

import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import '../widgets/drawer_menu.dart';
import 'admin_screen.dart';
import 'carpool_screen.dart';
import 'chat_screen.dart';
import 'compose_sheets.dart';
import 'delivery_screen.dart';
import 'market_screen.dart';
import 'profile_screen.dart';
import 'services_screen.dart';
import 'timeline_screen.dart';
import 'transport_screen.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  int _index = 1;

  static const _titles = [
    'حسابي وإعداداتي',
    'قريتي',
    'سوق النزل',
    'توصيل نزلاوي',
    'مواقف ونقل',
    'خدني معاك',
    'دليل الخدمات',
    'محادثة خاصة',
    'لوحة الإدارة',
  ];

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;
    final isAdmin = auth.isAdmin;
    final safeIndex = (!isAdmin && _index == 8) ? 1 : _index;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(_titles[safeIndex]),
            Text(
              'نزلاوي · النزل',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: NazlawiColors.slate400,
                  ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'إشعارات القرية',
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_rounded),
          ),
        ],
      ),
      drawer: NazlawiDrawer(
        selectedIndex: safeIndex,
        showAdmin: isAdmin,
        onSelect: (i) {
          if (i == 8 && !isAdmin) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('لوحة الإدارة للأدمن فقط')),
            );
            return;
          }
          setState(() => _index = i);
        },
        onLogout: auth.logout,
      ),
      body: IndexedStack(
        index: safeIndex,
        children: const [
          ProfileScreen(),
          TimelineScreen(),
          MarketScreen(),
          DeliveryScreen(),
          TransportScreen(),
          CarpoolScreen(),
          ServicesScreen(),
          ChatScreen(),
          AdminScreen(),
        ],
      ),
      floatingActionButton: _fabFor(safeIndex),
    );
  }

  Widget? _fabFor(int i) {
    return switch (i) {
      1 => FloatingActionButton.extended(
          onPressed: () => showCreatePostSheet(context),
          icon: const Icon(Icons.add),
          label: const Text('منشور'),
        ),
      2 => FloatingActionButton.extended(
          onPressed: () => showCreateProductSheet(context),
          icon: const Icon(Icons.add_shopping_cart),
          label: const Text('منتج'),
        ),
      5 => FloatingActionButton.extended(
          onPressed: () => showCreateCarpoolSheet(context),
          icon: const Icon(Icons.directions_car),
          label: const Text('مشوار'),
        ),
      _ => null,
    };
  }
}
