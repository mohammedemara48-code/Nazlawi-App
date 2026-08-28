import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

import '../models/models.dart';
import 'village_repository.dart';

class AuthService extends ChangeNotifier {
  AuthService._();
  static final AuthService instance = AuthService._();

  VillageUser? currentUser;
  String? verificationId;
  String? pendingPhone;
  String? pendingName;
  String? pendingNeighborhood;
  String? error;
  bool busy = false;

  /// في الوضع التجريبي الكود الثابت: 123456
  static const demoOtp = '123456';

  bool get firebaseReady {
    try {
      return Firebase.apps.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  bool get isLoggedIn => currentUser != null;
  bool get isApproved => currentUser?.approved == true;
  bool get isAdmin => currentUser?.isAdmin == true;

  String normalizePhone(String raw) {
    var p = raw.replaceAll(RegExp(r'[\s-]'), '');
    if (p.startsWith('00')) p = '+${p.substring(2)}';
    if (p.startsWith('01') && p.length == 11) p = '+2$p';
    if (p.startsWith('1') && p.length == 10) p = '+20$p';
    if (!p.startsWith('+')) p = '+20$p';
    return p;
  }

  Future<void> startPhoneLogin({
    required String name,
    required String phone,
    String? neighborhood,
  }) async {
    busy = true;
    error = null;
    pendingName = name.trim();
    pendingNeighborhood = neighborhood?.trim();
    pendingPhone = normalizePhone(phone);
    notifyListeners();

    if (!firebaseReady) {
      verificationId = 'demo-verification';
      busy = false;
      notifyListeners();
      return;
    }

    try {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: pendingPhone,
        timeout: const Duration(seconds: 60),
        verificationCompleted: (cred) async {
          await FirebaseAuth.instance.signInWithCredential(cred);
          await _finishFromAuth();
        },
        verificationFailed: (e) {
          error = e.message ?? 'فشل التحقق من الرقم';
          busy = false;
          notifyListeners();
        },
        codeSent: (id, _) {
          verificationId = id;
          busy = false;
          notifyListeners();
        },
        codeAutoRetrievalTimeout: (id) {
          verificationId = id;
        },
      );
    } catch (e) {
      error = e.toString();
      busy = false;
      notifyListeners();
    }
  }

  Future<bool> confirmOtp(String code) async {
    busy = true;
    error = null;
    notifyListeners();

    try {
      if (firebaseReady && verificationId != null && verificationId != 'demo-verification') {
        final cred = PhoneAuthProvider.credential(
          verificationId: verificationId!,
          smsCode: code.trim(),
        );
        await FirebaseAuth.instance.signInWithCredential(cred);
        await _finishFromAuth();
        return currentUser != null;
      }

      if (code.trim() != demoOtp) {
        error = 'الكود التجريبي هو 123456';
        busy = false;
        notifyListeners();
        return false;
      }
      await _finishDemo();
      return true;
    } catch (e) {
      error = e.toString();
      busy = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> _finishFromAuth() async {
    final authUser = FirebaseAuth.instance.currentUser;
    if (authUser == null) {
      busy = false;
      notifyListeners();
      return;
    }
    await _materializeUser(
      id: authUser.uid,
      phone: authUser.phoneNumber ?? pendingPhone ?? '',
    );
  }

  Future<void> _finishDemo() async {
    final phone = pendingPhone ?? '+201000000000';
    final existing = VillageRepository.instance.userByPhone(phone);
    final id = existing?.id ?? 'local-${phone.replaceAll(RegExp(r'\D'), '')}';
    await _materializeUser(id: id, phone: phone);
  }

  Future<void> _materializeUser({
    required String id,
    required String phone,
  }) async {
    final repo = VillageRepository.instance;
    final existing = repo.userById(id) ?? repo.userByPhone(phone);

    final isSeedAdmin = phone.endsWith('0001') ||
        existing?.isAdmin == true ||
        (pendingName ?? '').contains('أحمد عبدالسلام');

    final user = VillageUser(
      id: existing?.id ?? id,
      name: (pendingName?.isNotEmpty == true)
          ? pendingName!
          : (existing?.name ?? 'نزلاوي'),
      phone: existing?.phone ?? phone,
      role: isSeedAdmin ? UserRole.admin : (existing?.role ?? UserRole.resident),
      approved: isSeedAdmin ? true : (existing?.approved ?? false),
      subscribed: isSeedAdmin ? true : (existing?.subscribed ?? false),
      createdAt: existing?.createdAt ?? DateTime.now(),
      neighborhood: pendingNeighborhood ?? existing?.neighborhood ?? 'النزل',
    );

    currentUser = await repo.upsertUser(user);
    busy = false;
    notifyListeners();
  }

  Future<void> refreshCurrent() async {
    if (currentUser == null) return;
    currentUser = VillageRepository.instance.userById(currentUser!.id);
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      if (firebaseReady) await FirebaseAuth.instance.signOut();
    } catch (_) {}
    currentUser = null;
    verificationId = null;
    pendingPhone = null;
    pendingName = null;
    error = null;
    notifyListeners();
  }
}
