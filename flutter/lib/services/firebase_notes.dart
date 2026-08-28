/// ملاحظات ربط Firebase — ليست كود تشغيل.
///
/// Auth
/// - Phone Auth مع رمز دولة +20
/// - بعد التحقق: أنشئ وثيقة users/{uid} بحالة approved=false
///
/// Storage مسارات مقترحة
/// - users/{uid}/avatar.jpg
/// - posts/{postId}/media
/// - chat/{chatId}/{messageId}.m4a
///
/// قواعد Firestore مبدئية (للتجربة فقط — شدّدها قبل الإنتاج):
///
/// rules_version = '2';
/// service cloud.firestore {
///   match /databases/{db}/documents {
///     function signedIn() { return request.auth != null; }
///     function isAdmin() {
///       return signedIn() &&
///         get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role == 'admin';
///     }
///
///     match /users/{uid} {
///       allow read: if signedIn();
///       allow create: if signedIn() && request.auth.uid == uid;
///       allow update: if request.auth.uid == uid || isAdmin();
///     }
///
///     match /posts/{id} {
///       allow read: if signedIn();
///       allow create: if signedIn();
///       allow update, delete: if resource.data.authorId == request.auth.uid || isAdmin();
///     }
///
///     match /products/{id} {
///       allow read: if signedIn();
///       allow write: if signedIn();
///     }
///
///     match /rides/{id} {
///       allow read, write: if signedIn();
///     }
///
///     match /carpools/{id} {
///       allow read, write: if signedIn();
///     }
///
///     match /services/{id} {
///       allow read: if signedIn();
///       allow write: if isAdmin();
///     }
///
///     match /chats/{chatId} {
///       allow read, write: if signedIn() &&
///         request.auth.uid in resource.data.memberIds;
///
///       match /messages/{mid} {
///         allow read, write: if signedIn();
///       }
///     }
///   }
/// }
library;
