# نزلاوي — تطبيق قرية النزل

تطبيق مجتمع محلي بواجهة عربية RTL وثيم زمردي نظيف.

## الأقسام

- حسابي وإعداداتي
- قريتي (صور / فيديو قصير / رسائل صوتية)
- سوق النزل (منتجات وحجز)
- توصيل نزلاوي
- مواقف ونقل (توك توك / تاكسي / نقل)
- خدني معاك
- دليل الخدمات
- محادثة خاصة (أصدقاء فقط)
- لوحة الإدارة (موافقة واشتراكات)

## التشغيل

```bash
flutter create . --project-name nazlawi
flutter pub get
flutter run
```

المشروع مكتوب كهيكل `lib/` جاهز. لو المجلد فاضي من ملفات المنصة، نفّذ `flutter create .` داخله أولاً.

## Firebase

1. أنشئ مشروع Firebase باسم مناسب.
2. فعّل: Authentication (Phone) + Cloud Firestore + Storage.
3. من جذر المشروع:

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

4. في `lib/main.dart` فك تعليق:

```dart
await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
```

5. انسخ قواعد Firestore من `lib/services/firebase_notes.dart`.
6. راجع `firestore_schema.json`.

## الحزم الإعلامية

- `record` + `just_audio` للرسائل الصوتية
- `video_player` + `chewie` للفيديو القصير
- `image_picker` للصور

الشاشات مربوطة بـ `VillageRepository`: ذاكرة محلية + كتابة Firestore لو Firebase متفعل.

## الدخول والموافقة

1. شاشة رقم الموبايل + الاسم + الحارة.
2. كود SMS من Firebase، أو في الوضع التجريبي الكود `123456`.
3. رقم بينتهي بـ `0001` يدخل أدمن وموافق عليه فورًا.
4. أي رقم تاني يستنى موافقة من لوحة الإدارة.
5. الأدمن يوافق الطلبات ويبدّل الاشتراكات.
