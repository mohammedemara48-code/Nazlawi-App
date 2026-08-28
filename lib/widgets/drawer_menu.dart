import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class DrawerItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final int index;

  const DrawerItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.index,
  });
}

class NazlawiDrawer extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onSelect;
  final VoidCallback? onLogout;
  final bool showAdmin;

  const NazlawiDrawer({
    super.key,
    required this.selectedIndex,
    required this.onSelect,
    this.onLogout,
    this.showAdmin = true,
  });

  static const items = [
    DrawerItem(
      icon: Icons.person_outline_rounded,
      title: 'حسابي وإعداداتي',
      subtitle: 'نزلاوي',
      index: 0,
    ),
    DrawerItem(
      icon: Icons.dynamic_feed_rounded,
      title: 'قريتي',
      subtitle: 'صور · فيديو قصير · صوتيات',
      index: 1,
    ),
    DrawerItem(
      icon: Icons.storefront_outlined,
      title: 'سوق النزل',
      subtitle: 'محلات وحجز منتجات',
      index: 2,
    ),
    DrawerItem(
      icon: Icons.delivery_dining_outlined,
      title: 'توصيل نزلاوي',
      subtitle: 'مندوبين وحالة التوفر',
      index: 3,
    ),
    DrawerItem(
      icon: Icons.local_taxi_outlined,
      title: 'مواقف ونقل',
      subtitle: 'توك توك · تاكسي · نقل',
      index: 4,
    ),
    DrawerItem(
      icon: Icons.groups_2_outlined,
      title: 'خدني معاك',
      subtitle: 'مواصلات مشتركة مجانية',
      index: 5,
    ),
    DrawerItem(
      icon: Icons.medical_services_outlined,
      title: 'دليل الخدمات',
      subtitle: 'فنيين وأطباء القرية',
      index: 6,
    ),
    DrawerItem(
      icon: Icons.chat_bubble_outline_rounded,
      title: 'محادثة خاصة',
      subtitle: 'رسائل وصوتيات للأصدقاء',
      index: 7,
    ),
    DrawerItem(
      icon: Icons.admin_panel_settings_outlined,
      title: 'لوحة الإدارة',
      subtitle: 'اشتراكات وموافقة الأعضاء',
      index: 8,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [NazlawiColors.emeraldDark, NazlawiColors.emerald],
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.spa_rounded,
                        color: Colors.white, size: 30),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'نزلاوي',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'قرية النزل · مجتمع واحد',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.85),
                        ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: items.where((e) => showAdmin || e.index != 8).length,
                itemBuilder: (context, i) {
                  final visible = items.where((e) => showAdmin || e.index != 8).toList();
                  final item = visible[i];
                  final selected = selectedIndex == item.index;
                  return Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                    child: ListTile(
                      selected: selected,
                      selectedTileColor: NazlawiColors.emeraldLight,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      leading: Icon(
                        item.icon,
                        color: selected
                            ? NazlawiColors.emeraldDark
                            : NazlawiColors.slate600,
                      ),
                      title: Text(
                        item.title,
                        style: TextStyle(
                          fontWeight:
                              selected ? FontWeight.w800 : FontWeight.w600,
                          color: selected
                              ? NazlawiColors.emeraldDark
                              : NazlawiColors.slate800,
                        ),
                      ),
                      subtitle: Text(
                        item.subtitle,
                        style: const TextStyle(
                          fontSize: 11,
                          color: NazlawiColors.slate400,
                        ),
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        onSelect(item.index);
                      },
                    ),
                  );
                },
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.logout_rounded,
                  color: NazlawiColors.coral),
              title: const Text('تسجيل الخروج'),
              onTap: onLogout,
            ),
          ],
        ),
      ),
    );
  }
}
