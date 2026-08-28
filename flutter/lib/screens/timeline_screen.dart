import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/voice_note_player.dart';

class TimelineScreen extends StatelessWidget {
  const TimelineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: VillageRepository.instance,
      builder: (context, _) {
        final posts = VillageRepository.instance.posts;
        return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 88),
      itemCount: posts.length + 1,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, i) {
        if (i == 0) {
          return _ComposerHint();
        }
        return _PostCard(post: posts[i - 1]);
      },
    );
      },
    );
  }
}

class _ComposerHint extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            const CircleAvatar(
              backgroundColor: NazlawiColors.emeraldLight,
              child: Icon(Icons.person, color: NazlawiColors.emeraldDark),
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'شارك أهل النزل بصورة أو فيديو أو رسالة صوتية…',
                style: TextStyle(color: NazlawiColors.slate400),
              ),
            ),
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.photo_camera_outlined,
                  color: NazlawiColors.emerald),
            ),
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.videocam_outlined,
                  color: NazlawiColors.emerald),
            ),
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.mic_none_rounded,
                  color: NazlawiColors.emerald),
            ),
          ],
        ),
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final TimelinePost post;
  const _PostCard({required this.post});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: NazlawiColors.emeraldLight,
                  child: Text(
                    post.authorName.characters.first,
                    style: const TextStyle(
                      color: NazlawiColors.emeraldDark,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.authorName,
                          style: const TextStyle(fontWeight: FontWeight.w800)),
                      Text(
                        _typeLabel(post.type),
                        style: const TextStyle(
                          fontSize: 12,
                          color: NazlawiColors.slate400,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.more_horiz, color: NazlawiColors.slate400),
              ],
            ),
            if (post.caption != null) ...[
              const SizedBox(height: 12),
              Text(post.caption!),
            ],
            const SizedBox(height: 12),
            if (post.type == PostType.photo)
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  height: 180,
                  width: double.infinity,
                  color: NazlawiColors.sand,
                  alignment: Alignment.center,
                  child: const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.image_outlined,
                          size: 42, color: NazlawiColors.emerald),
                      SizedBox(height: 6),
                      Text('صورة من القرية',
                          style: TextStyle(color: NazlawiColors.slate600)),
                    ],
                  ),
                ),
              ),
            if (post.type == PostType.video)
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  height: 200,
                  width: double.infinity,
                  color: NazlawiColors.slate900,
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircleAvatar(
                        radius: 26,
                        backgroundColor: Colors.white24,
                        child: Icon(Icons.play_arrow_rounded,
                            color: Colors.white, size: 32),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'فيديو قصير · ${post.durationSec}ث',
                        style: const TextStyle(color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ),
            if (post.type == PostType.voice)
              VoiceNotePlayer(durationSec: post.durationSec),
            const SizedBox(height: 10),
            Row(
              children: [
                InkWell(
                  onTap: () => VillageRepository.instance.likePost(post.id),
                  child: const Icon(Icons.favorite_border,
                      size: 20, color: NazlawiColors.coral),
                ),
                const SizedBox(width: 4),
                Text('${post.likes}'),
                const SizedBox(width: 16),
                const Icon(Icons.chat_bubble_outline,
                    size: 20, color: NazlawiColors.slate400),
                const SizedBox(width: 4),
                const Text('تعليق'),
                const Spacer(),
                const Icon(Icons.share_outlined,
                    size: 20, color: NazlawiColors.slate400),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _typeLabel(PostType t) => switch (t) {
        PostType.photo => 'صورة',
        PostType.video => 'فيديو قصير',
        PostType.voice => 'رسالة صوتية',
        PostType.text => 'منشور',
      };
}
