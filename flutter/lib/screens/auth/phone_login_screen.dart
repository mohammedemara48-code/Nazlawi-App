import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import 'otp_screen.dart';

class PhoneLoginScreen extends StatefulWidget {
  const PhoneLoginScreen({super.key});

  @override
  State<PhoneLoginScreen> createState() => _PhoneLoginScreenState();
}

class _PhoneLoginScreenState extends State<PhoneLoginScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _hood = TextEditingController();
  final _form = GlobalKey<FormState>();

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _hood.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    final auth = AuthService.instance;
    await auth.startPhoneLogin(
      name: _name.text,
      phone: _phone.text,
      neighborhood: _hood.text,
    );
    if (!mounted) return;
    if (auth.verificationId != null) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const OtpScreen()),
      );
    } else if (auth.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.error!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = AuthService.instance;
    return Scaffold(
      body: ListenableBuilder(
        listenable: auth,
        builder: (context, _) {
          return SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 36, 24, 24),
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: NazlawiColors.emeraldLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.spa_rounded,
                      color: NazlawiColors.emeraldDark, size: 36),
                ),
                const SizedBox(height: 18),
                const Text('نزلاوي',
                    style:
                        TextStyle(fontSize: 32, fontWeight: FontWeight.w800)),
                const Text('دخول قرية النزل برقم الموبايل',
                    style: TextStyle(color: NazlawiColors.slate400)),
                const SizedBox(height: 28),
                Form(
                  key: _form,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _name,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'الاسم',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                        validator: (v) =>
                            (v == null || v.trim().length < 2) ? 'اكتب اسمك' : null,
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _hood,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          labelText: 'الحارة / النزلة',
                          prefixIcon: Icon(Icons.location_on_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _phone,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          labelText: 'رقم الموبايل',
                          hintText: '01xxxxxxxxx',
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                        validator: (v) =>
                            (v == null || v.trim().length < 8) ? 'رقم غير مكتمل' : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                FilledButton(
                  onPressed: auth.busy ? null : _submit,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                  ),
                  child: auth.busy
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('إرسال كود التحقق'),
                ),
                const SizedBox(height: 14),
                Text(
                  auth.firebaseReady
                      ? 'هيوصلك SMS من Firebase'
                      : 'وضع تجريبي: بعد الشاشة الجاية استخدم الكود 123456\nرقم بينتهي بـ 0001 يدخل كأدمن موافق عليه',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: NazlawiColors.slate400,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
