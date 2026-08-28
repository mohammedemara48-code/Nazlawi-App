import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/village_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/voice_note_player.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _text = TextEditingController();

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  Future<void> _send({bool voice = false}) async {
    final me = AuthService.instance.currentUser;
    if (me == null) return;
    if (!voice && _text.text.trim().isEmpty) return;
    await VillageRepository.instance.addMessage(ChatMessage(
      id: VillageRepository.instance.newId(),
      chatId: 'village',
      senderId: me.id,
      senderName: me.name,
      text: voice ? null : _text.text.trim(),
      audioDuration: voice ? 6 : 0,
      createdAt: DateTime.now(),
    ));
    _text.clear();
  }

  @override
  Widget build(BuildContext context) {
    final repo = VillageRepository.instance;
    final me = AuthService.instance.currentUser;
    return ListenableBuilder(
      listenable: repo,
      builder: (context, _) {
        final items = repo.messages;
        return Column(
          children: [
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                itemBuilder: (context, i) {
                  final m = items[i];
                  final mine = m.senderId == me?.id;
                  return _Bubble(
                    mine: mine,
                    name: m.senderName,
                    child: m.audioDuration > 0 && m.text == null
                        ? VoiceNotePlayer(
                            durationSec: m.audioDuration, compact: true)
                        : Text(m.text ?? ''),
                  );
                },
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => _send(voice: true),
                      icon: const Icon(Icons.mic, color: NazlawiColors.emerald),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _text,
                        decoration: const InputDecoration(
                          hintText: 'رسالة للأصدقاء فقط…',
                        ),
                        onSubmitted: (_) => _send(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _send,
                      icon: const Icon(Icons.send_rounded),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _Bubble extends StatelessWidget {
  final bool mine;
  final String name;
  final Widget child;
  const _Bubble({required this.mine, required this.name, required this.child});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: mine ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
          color: mine ? NazlawiColors.emeraldLight : NazlawiColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: NazlawiColors.slate200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name,
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: NazlawiColors.emeraldDark)),
            const SizedBox(height: 4),
            child,
          ],
        ),
      ),
    );
  }
}
