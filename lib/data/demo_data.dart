import '../models/models.dart';

/// بيانات تجريبية لقرية النزل — تُستبدل بـ Firestore في الإنتاج
class DemoData {
  static final users = [
    VillageUser(
      id: 'u1',
      name: 'أحمد عبدالسلام',
      phone: '+201000000001',
      role: UserRole.admin,
      approved: true,
      subscribed: true,
      createdAt: DateTime(2026, 1, 10),
      neighborhood: 'نزلة البحر',
    ),
    VillageUser(
      id: 'u2',
      name: 'أم يوسف',
      phone: '+201000000002',
      role: UserRole.merchant,
      approved: true,
      subscribed: true,
      createdAt: DateTime(2026, 2, 4),
      neighborhood: 'الحارة الكبيرة',
    ),
    VillageUser(
      id: 'u3',
      name: 'حودة التوك توك',
      phone: '+201000000003',
      role: UserRole.driver,
      approved: true,
      subscribed: true,
      createdAt: DateTime(2026, 3, 12),
      neighborhood: 'المحطة',
    ),
  ];

  static final posts = [
    TimelinePost(
      id: 'p1',
      authorId: 'u2',
      authorName: 'أم يوسف',
      type: PostType.photo,
      caption: 'عشا اليوم من فرن البيت — عيش بلدي طازة 🍞',
      mediaUrl: null,
      likes: 24,
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    TimelinePost(
      id: 'p2',
      authorId: 'u3',
      authorName: 'حودة التوك توك',
      type: PostType.voice,
      caption: 'رسالة صوتية: مواعيد النقل بكرة الصبح',
      durationSec: 18,
      likes: 7,
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
    ),
    TimelinePost(
      id: 'p3',
      authorId: 'u1',
      authorName: 'أحمد عبدالسلام',
      type: PostType.video,
      caption: 'مشهد الغروب على ترعة النزل 🌅',
      durationSec: 22,
      likes: 61,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  static final products = [
    const Product(
      id: 'pr1',
      merchantId: 'u2',
      merchantName: 'بقالة أم يوسف',
      title: 'جبنة قريش بلدي',
      description: 'طازة من الصباح، بالكيلو',
      price: 55,
      unit: 'كجم',
      stock: 12,
    ),
    const Product(
      id: 'pr2',
      merchantId: 'u2',
      merchantName: 'بقالة أم يوسف',
      title: 'عسل نحل النزل',
      description: 'من مناحل أهل القرية',
      price: 180,
      unit: 'برطمان',
      stock: 8,
    ),
    const Product(
      id: 'pr3',
      merchantId: 'm3',
      merchantName: 'خضار الحاج سيد',
      title: 'طماطم بلدي',
      description: 'قطف اليوم',
      price: 12,
      unit: 'كجم',
      stock: 40,
    ),
  ];

  static final agents = [
    const DeliveryAgent(
      id: 'd1',
      name: 'محمود الدليفري',
      phone: '+201111111111',
      status: DeliveryStatus.available,
      vehicle: 'موتوسيكل',
      rating: 4.9,
    ),
    const DeliveryAgent(
      id: 'd2',
      name: 'كريم',
      phone: '+201111111112',
      status: DeliveryStatus.busy,
      vehicle: 'عجلة',
      rating: 4.6,
    ),
  ];

  static final rides = [
    RideOffer(
      id: 'r1',
      type: RideType.toktok,
      driverName: 'حودة',
      phone: '+201000000003',
      from: 'جامع النزل',
      to: 'المحطة',
      price: 15,
      when: DateTime.now().add(const Duration(minutes: 10)),
    ),
    RideOffer(
      id: 'r2',
      type: RideType.taxi,
      driverName: 'عم صلاح',
      phone: '+201000000033',
      from: 'النزل',
      to: 'المركز',
      price: 80,
      when: DateTime.now().add(const Duration(hours: 1)),
    ),
    RideOffer(
      id: 'r3',
      type: RideType.truck,
      driverName: 'أبو علي',
      phone: '+201000000044',
      from: 'المخزن',
      to: 'السوق',
      price: 150,
      when: DateTime.now().add(const Duration(hours: 3)),
    ),
  ];

  static final carpools = [
    CarpoolPost(
      id: 'c1',
      authorName: 'ياسر',
      from: 'النزل',
      to: 'القاهرة — رمسيس',
      when: DateTime.now().add(const Duration(days: 1, hours: 6)),
      seats: 2,
      note: 'رايح بدري، مكانين فاضيين',
    ),
    CarpoolPost(
      id: 'c2',
      authorName: 'منى',
      from: 'المحطة',
      to: 'المركز',
      when: DateTime.now().add(const Duration(hours: 4)),
      seats: 1,
      note: 'مواعيد مدرسة',
    ),
  ];

  static final services = [
    const ServicePro(
      id: 's1',
      name: 'الحاج فتحي',
      specialty: 'سباك',
      phone: '+201222222221',
      neighborhood: 'الحارة الكبيرة',
      rating: 4.8,
    ),
    const ServicePro(
      id: 's2',
      name: 'د. سعاد',
      specialty: 'طبيبة أطفال',
      phone: '+201222222222',
      neighborhood: 'عيادة السوق',
      rating: 4.9,
    ),
    const ServicePro(
      id: 's3',
      name: 'عم رجب',
      specialty: 'كهربائي',
      phone: '+201222222223',
      neighborhood: 'نزلة البحر',
      rating: 4.7,
    ),
    const ServicePro(
      id: 's4',
      name: 'أسطى جمال',
      specialty: 'نجار',
      phone: '+201222222224',
      neighborhood: 'ورشة الجامع',
      rating: 4.6,
    ),
  ];
}
