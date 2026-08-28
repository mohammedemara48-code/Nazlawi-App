import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/village_repository.dart';

Future<void> showCreatePostSheet(BuildContext context) async {
  final caption = TextEditingController();
  var type = PostType.text;
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (ctx) {
      return Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 8,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: StatefulBuilder(
          builder: (context, setSt) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('منشور لأهل النزل',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: [
                    ChoiceChip(
                      label: const Text('كلام'),
                      selected: type == PostType.text,
                      onSelected: (_) => setSt(() => type = PostType.text),
                    ),
                    ChoiceChip(
                      label: const Text('صورة'),
                      selected: type == PostType.photo,
                      onSelected: (_) => setSt(() => type = PostType.photo),
                    ),
                    ChoiceChip(
                      label: const Text('فيديو'),
                      selected: type == PostType.video,
                      onSelected: (_) => setSt(() => type = PostType.video),
                    ),
                    ChoiceChip(
                      label: const Text('صوت'),
                      selected: type == PostType.voice,
                      onSelected: (_) => setSt(() => type = PostType.voice),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: caption,
                  maxLines: 3,
                  decoration: const InputDecoration(hintText: 'اكتب لأهل القرية…'),
                ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: () async {
                    final me = AuthService.instance.currentUser;
                    if (me == null) return;
                    await VillageRepository.instance.addPost(TimelinePost(
                      id: VillageRepository.instance.newId(),
                      authorId: me.id,
                      authorName: me.name,
                      type: type,
                      caption: caption.text.trim().isEmpty ? null : caption.text.trim(),
                      durationSec: type == PostType.voice
                          ? 8
                          : type == PostType.video
                              ? 15
                              : 0,
                      createdAt: DateTime.now(),
                    ));
                    if (ctx.mounted) Navigator.pop(ctx);
                  },
                  child: const Text('نشر'),
                ),
              ],
            );
          },
        ),
      );
    },
  );
  caption.dispose();
}

Future<void> showCreateProductSheet(BuildContext context) async {
  final title = TextEditingController();
  final desc = TextEditingController();
  final price = TextEditingController();
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (ctx) {
      return Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 8,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('منتج لسوق النزل',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 12),
            TextField(controller: title, decoration: const InputDecoration(labelText: 'اسم المنتج')),
            const SizedBox(height: 8),
            TextField(controller: desc, decoration: const InputDecoration(labelText: 'الوصف')),
            const SizedBox(height: 8),
            TextField(
              controller: price,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'السعر بالجنيه'),
            ),
            const SizedBox(height: 14),
            FilledButton(
              onPressed: () async {
                final me = AuthService.instance.currentUser;
                if (me == null || title.text.trim().isEmpty) return;
                await VillageRepository.instance.addProduct(Product(
                  id: VillageRepository.instance.newId(),
                  merchantId: me.id,
                  merchantName: me.name,
                  title: title.text.trim(),
                  description: desc.text.trim(),
                  price: double.tryParse(price.text) ?? 0,
                ));
                if (ctx.mounted) Navigator.pop(ctx);
              },
              child: const Text('إضافة للسوق'),
            ),
          ],
        ),
      );
    },
  );
  title.dispose();
  desc.dispose();
  price.dispose();
}

Future<void> showCreateCarpoolSheet(BuildContext context) async {
  final from = TextEditingController(text: 'النزل');
  final to = TextEditingController();
  final note = TextEditingController();
  final seats = TextEditingController(text: '2');
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (ctx) {
      return Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 8,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('خدني معاك',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
            const SizedBox(height: 12),
            TextField(controller: from, decoration: const InputDecoration(labelText: 'من')),
            const SizedBox(height: 8),
            TextField(controller: to, decoration: const InputDecoration(labelText: 'إلى')),
            const SizedBox(height: 8),
            TextField(
              controller: seats,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'مقاعد فاضية'),
            ),
            const SizedBox(height: 8),
            TextField(controller: note, decoration: const InputDecoration(labelText: 'ملاحظة')),
            const SizedBox(height: 14),
            FilledButton(
              onPressed: () async {
                final me = AuthService.instance.currentUser;
                if (me == null || to.text.trim().isEmpty) return;
                await VillageRepository.instance.addCarpool(CarpoolPost(
                  id: VillageRepository.instance.newId(),
                  authorName: me.name,
                  from: from.text.trim(),
                  to: to.text.trim(),
                  when: DateTime.now().add(const Duration(hours: 2)),
                  seats: int.tryParse(seats.text) ?? 1,
                  note: note.text.trim(),
                ));
                if (ctx.mounted) Navigator.pop(ctx);
              },
              child: const Text('نشر المشوار'),
            ),
          ],
        ),
      );
    },
  );
  from.dispose();
  to.dispose();
  note.dispose();
  seats.dispose();
}
