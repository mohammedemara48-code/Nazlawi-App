import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../data/demo_data.dart';
import '../models/models.dart';

/// مستودع القرية: Firestore إن اتفعّل، وإلا ذاكرة محلية بنفس الشكل.
class VillageRepository extends ChangeNotifier {
  VillageRepository._();
  static final VillageRepository instance = VillageRepository._();

  final _uuid = const Uuid();

  final List<VillageUser> users = [...DemoData.users];
  final List<TimelinePost> posts = [...DemoData.posts];
  final List<Product> products = [...DemoData.products];
  final List<DeliveryAgent> agents = [...DemoData.agents];
  final List<RideOffer> rides = [...DemoData.rides];
  final List<CarpoolPost> carpools = [...DemoData.carpools];
  final List<ServicePro> services = [...DemoData.services];
  final List<ChatMessage> messages = [
    ChatMessage(
      id: 'm1',
      chatId: 'village',
      senderId: 'u2',
      senderName: 'أم يوسف',
      text: 'العسل لسه موجود؟',
      createdAt: DateTime.now().subtract(const Duration(minutes: 12)),
    ),
    ChatMessage(
      id: 'm2',
      chatId: 'village',
      senderId: 'u1',
      senderName: 'أحمد عبدالسلام',
      text: 'أيوه، هبعته مع محمود',
      createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
    ),
    ChatMessage(
      id: 'm3',
      chatId: 'village',
      senderId: 'u2',
      senderName: 'أم يوسف',
      audioDuration: 9,
      createdAt: DateTime.now().subtract(const Duration(minutes: 8)),
    ),
  ];

  bool get firebaseReady {
    try {
      return Firebase.apps.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  FirebaseFirestore? get _db {
    if (!firebaseReady) return null;
    return FirebaseFirestore.instance;
  }

  List<VillageUser> get pendingUsers =>
      users.where((u) => !u.approved).toList();

  VillageUser? userById(String id) {
    try {
      return users.firstWhere((u) => u.id == id);
    } catch (_) {
      return null;
    }
  }

  VillageUser? userByPhone(String phone) {
    final n = _norm(phone);
    try {
      return users.firstWhere((u) => _norm(u.phone) == n);
    } catch (_) {
      return null;
    }
  }

  String _norm(String phone) =>
      phone.replaceAll(RegExp(r'[\s-]'), '').replaceFirst(RegExp(r'^\+'), '');

  Future<VillageUser> upsertUser(VillageUser user) async {
    final i = users.indexWhere((u) => u.id == user.id || _norm(u.phone) == _norm(user.phone));
    if (i >= 0) {
      final merged = user.copyWith(
        approved: users[i].approved || user.approved,
        role: users[i].isAdmin ? UserRole.admin : user.role,
        subscribed: users[i].subscribed || user.subscribed,
      );
      users[i] = VillageUser(
        id: users[i].id,
        name: user.name.isEmpty ? users[i].name : user.name,
        phone: users[i].phone,
        role: merged.role,
        approved: merged.approved,
        subscribed: merged.subscribed,
        createdAt: users[i].createdAt,
        neighborhood: user.neighborhood ?? users[i].neighborhood,
        friends: users[i].friends,
      );
    } else {
      users.add(user);
    }
    final saved = userById(user.id) ?? userByPhone(user.phone) ?? user;
    await _setDoc('users', saved.id, saved.toMap());
    notifyListeners();
    return saved;
  }

  Future<void> setApproved(String userId, bool approved) async {
    final i = users.indexWhere((u) => u.id == userId);
    if (i < 0) return;
    users[i] = users[i].copyWith(approved: approved);
    await _setDoc('users', userId, users[i].toMap());
    notifyListeners();
  }

  Future<void> setSubscribed(String userId, bool value) async {
    final i = users.indexWhere((u) => u.id == userId);
    if (i < 0) return;
    users[i] = users[i].copyWith(subscribed: value);
    await _setDoc('users', userId, users[i].toMap());
    notifyListeners();
  }

  Future<void> addPost(TimelinePost post) async {
    posts.insert(0, post);
    await _setDoc('posts', post.id, post.toMap());
    notifyListeners();
  }

  Future<void> likePost(String postId) async {
    final i = posts.indexWhere((p) => p.id == postId);
    if (i < 0) return;
    final p = posts[i];
    posts[i] = TimelinePost(
      id: p.id,
      authorId: p.authorId,
      authorName: p.authorName,
      authorAvatar: p.authorAvatar,
      type: p.type,
      caption: p.caption,
      mediaUrl: p.mediaUrl,
      durationSec: p.durationSec,
      likes: p.likes + 1,
      createdAt: p.createdAt,
    );
    await _setDoc('posts', postId, posts[i].toMap());
    notifyListeners();
  }

  Future<void> addProduct(Product product) async {
    products.insert(0, product);
    await _setDoc('products', product.id, product.toMap());
    notifyListeners();
  }

  Future<void> reserveProduct(Product product, VillageUser buyer) async {
    await _setDoc('reservations', _uuid.v4(), {
      'productId': product.id,
      'buyerId': buyer.id,
      'merchantId': product.merchantId,
      'qty': 1,
      'status': 'pending',
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> setAgentStatus(String agentId, DeliveryStatus status) async {
    final i = agents.indexWhere((a) => a.id == agentId);
    if (i >= 0) {
      agents[i] = agents[i].copyWith(status: status);
      await _setDoc('deliveryAgents', agentId, agents[i].toMap());
    } else {
      // المستخدم الحالي كمسافر توصيل
    }
    notifyListeners();
  }

  Future<void> upsertMyDelivery({
    required VillageUser user,
    required DeliveryStatus status,
    String vehicle = 'موتوسيكل',
  }) async {
    final i = agents.indexWhere((a) => a.id == user.id);
    final agent = DeliveryAgent(
      id: user.id,
      name: user.name,
      phone: user.phone,
      status: status,
      vehicle: vehicle,
    );
    if (i >= 0) {
      agents[i] = agent;
    } else {
      agents.insert(0, agent);
    }
    await _setDoc('deliveryAgents', user.id, agent.toMap());
    notifyListeners();
  }

  Future<void> addRide(RideOffer ride) async {
    rides.insert(0, ride);
    await _setDoc('rides', ride.id, ride.toMap());
    notifyListeners();
  }

  Future<void> addCarpool(CarpoolPost post) async {
    carpools.insert(0, post);
    await _setDoc('carpools', post.id, post.toMap());
    notifyListeners();
  }

  Future<void> addMessage(ChatMessage message) async {
    messages.add(message);
    final db = _db;
    if (db != null) {
      await db
          .collection('chats')
          .doc(message.chatId)
          .collection('messages')
          .doc(message.id)
          .set(message.toMap());
    }
    notifyListeners();
  }

  String newId() => _uuid.v4();

  Future<void> _setDoc(
      String collection, String id, Map<String, dynamic> data) async {
    final db = _db;
    if (db == null) return;
    try {
      await db.collection(collection).doc(id).set(data, SetOptions(merge: true));
    } catch (e) {
      debugPrint('Firestore write failed: $e');
    }
  }

  Future<void> pullRemote() async {
    final db = _db;
    if (db == null) return;
    try {
      final snap = await db.collection('users').get();
      for (final d in snap.docs) {
        final remote = VillageUser.fromMap(d.id, d.data());
        final i = users.indexWhere((u) => u.id == remote.id);
        if (i >= 0) {
          users[i] = remote;
        } else {
          users.add(remote);
        }
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Firestore pull failed: $e');
    }
  }
}
