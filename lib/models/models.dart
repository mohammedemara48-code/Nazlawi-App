enum UserRole { resident, merchant, driver, technician, doctor, admin }

enum PostType { photo, video, voice, text }

enum RideType { toktok, taxi, truck }

enum DeliveryStatus { available, busy, offline }

DateTime parseDt(dynamic v) {
  if (v == null) return DateTime.now();
  if (v is DateTime) return v;
  if (v is String) return DateTime.tryParse(v) ?? DateTime.now();
  try {
    return (v as dynamic).toDate() as DateTime;
  } catch (_) {
    return DateTime.now();
  }
}

class VillageUser {
  final String id;
  final String name;
  final String phone;
  final String? avatarUrl;
  final UserRole role;
  final bool approved;
  final bool subscribed;
  final DateTime createdAt;
  final String? neighborhood;
  final List<String> friends;

  const VillageUser({
    required this.id,
    required this.name,
    required this.phone,
    this.avatarUrl,
    this.role = UserRole.resident,
    this.approved = false,
    this.subscribed = false,
    required this.createdAt,
    this.neighborhood,
    this.friends = const [],
  });

  bool get isAdmin => role == UserRole.admin;

  VillageUser copyWith({
    String? name,
    UserRole? role,
    bool? approved,
    bool? subscribed,
    String? neighborhood,
    List<String>? friends,
  }) {
    return VillageUser(
      id: id,
      name: name ?? this.name,
      phone: phone,
      avatarUrl: avatarUrl,
      role: role ?? this.role,
      approved: approved ?? this.approved,
      subscribed: subscribed ?? this.subscribed,
      createdAt: createdAt,
      neighborhood: neighborhood ?? this.neighborhood,
      friends: friends ?? this.friends,
    );
  }

  factory VillageUser.fromMap(String id, Map<String, dynamic> m) => VillageUser(
        id: id,
        name: m['name'] ?? '',
        phone: m['phone'] ?? '',
        avatarUrl: m['avatarUrl'],
        role: UserRole.values.byName(m['role'] ?? 'resident'),
        approved: m['approved'] ?? false,
        subscribed: m['subscribed'] ?? false,
        createdAt: parseDt(m['createdAt']),
        neighborhood: m['neighborhood'],
        friends: List<String>.from(m['friends'] ?? const []),
      );

  Map<String, dynamic> toMap() => {
        'name': name,
        'phone': phone,
        'avatarUrl': avatarUrl,
        'role': role.name,
        'approved': approved,
        'subscribed': subscribed,
        'createdAt': createdAt.toIso8601String(),
        'neighborhood': neighborhood,
        'friends': friends,
      };
}

class TimelinePost {
  final String id;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final PostType type;
  final String? caption;
  final String? mediaUrl;
  final int durationSec;
  final int likes;
  final DateTime createdAt;

  const TimelinePost({
    required this.id,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    required this.type,
    this.caption,
    this.mediaUrl,
    this.durationSec = 0,
    this.likes = 0,
    required this.createdAt,
  });

  factory TimelinePost.fromMap(String id, Map<String, dynamic> m) =>
      TimelinePost(
        id: id,
        authorId: m['authorId'] ?? '',
        authorName: m['authorName'] ?? '',
        authorAvatar: m['authorAvatar'],
        type: PostType.values.byName(m['type'] ?? 'text'),
        caption: m['caption'],
        mediaUrl: m['mediaUrl'],
        durationSec: (m['durationSec'] ?? 0) as int,
        likes: (m['likes'] ?? 0) as int,
        createdAt: parseDt(m['createdAt']),
      );

  Map<String, dynamic> toMap() => {
        'authorId': authorId,
        'authorName': authorName,
        'authorAvatar': authorAvatar,
        'type': type.name,
        'caption': caption,
        'mediaUrl': mediaUrl,
        'durationSec': durationSec,
        'likes': likes,
        'createdAt': createdAt.toIso8601String(),
      };
}

class Product {
  final String id;
  final String merchantId;
  final String merchantName;
  final String title;
  final String description;
  final double price;
  final String unit;
  final String? imageUrl;
  final bool available;
  final int stock;

  const Product({
    required this.id,
    required this.merchantId,
    required this.merchantName,
    required this.title,
    required this.description,
    required this.price,
    this.unit = 'قطعة',
    this.imageUrl,
    this.available = true,
    this.stock = 0,
  });

  factory Product.fromMap(String id, Map<String, dynamic> m) => Product(
        id: id,
        merchantId: m['merchantId'] ?? '',
        merchantName: m['merchantName'] ?? '',
        title: m['title'] ?? '',
        description: m['description'] ?? '',
        price: (m['price'] ?? 0).toDouble(),
        unit: m['unit'] ?? 'قطعة',
        imageUrl: m['imageUrl'],
        available: m['available'] ?? true,
        stock: (m['stock'] ?? 0) as int,
      );

  Map<String, dynamic> toMap() => {
        'merchantId': merchantId,
        'merchantName': merchantName,
        'title': title,
        'description': description,
        'price': price,
        'unit': unit,
        'imageUrl': imageUrl,
        'available': available,
        'stock': stock,
      };
}

class DeliveryAgent {
  final String id;
  final String name;
  final String phone;
  final DeliveryStatus status;
  final String vehicle;
  final double rating;

  const DeliveryAgent({
    required this.id,
    required this.name,
    required this.phone,
    required this.status,
    this.vehicle = 'موتوسيكل',
    this.rating = 4.8,
  });

  DeliveryAgent copyWith({DeliveryStatus? status}) => DeliveryAgent(
        id: id,
        name: name,
        phone: phone,
        status: status ?? this.status,
        vehicle: vehicle,
        rating: rating,
      );

  factory DeliveryAgent.fromMap(String id, Map<String, dynamic> m) =>
      DeliveryAgent(
        id: id,
        name: m['name'] ?? '',
        phone: m['phone'] ?? '',
        status: DeliveryStatus.values.byName(m['status'] ?? 'offline'),
        vehicle: m['vehicle'] ?? 'موتوسيكل',
        rating: (m['rating'] ?? 4.5).toDouble(),
      );

  Map<String, dynamic> toMap() => {
        'name': name,
        'phone': phone,
        'status': status.name,
        'vehicle': vehicle,
        'rating': rating,
      };
}

class RideOffer {
  final String id;
  final RideType type;
  final String driverName;
  final String phone;
  final String from;
  final String to;
  final double price;
  final DateTime when;
  final bool available;

  const RideOffer({
    required this.id,
    required this.type,
    required this.driverName,
    required this.phone,
    required this.from,
    required this.to,
    required this.price,
    required this.when,
    this.available = true,
  });

  factory RideOffer.fromMap(String id, Map<String, dynamic> m) => RideOffer(
        id: id,
        type: RideType.values.byName(m['type'] ?? 'toktok'),
        driverName: m['driverName'] ?? '',
        phone: m['phone'] ?? '',
        from: m['from'] ?? '',
        to: m['to'] ?? '',
        price: (m['price'] ?? 0).toDouble(),
        when: parseDt(m['when']),
        available: m['available'] ?? true,
      );

  Map<String, dynamic> toMap() => {
        'type': type.name,
        'driverName': driverName,
        'phone': phone,
        'from': from,
        'to': to,
        'price': price,
        'when': when.toIso8601String(),
        'available': available,
      };
}

class CarpoolPost {
  final String id;
  final String authorName;
  final String from;
  final String to;
  final DateTime when;
  final int seats;
  final String note;

  const CarpoolPost({
    required this.id,
    required this.authorName,
    required this.from,
    required this.to,
    required this.when,
    required this.seats,
    this.note = '',
  });

  factory CarpoolPost.fromMap(String id, Map<String, dynamic> m) =>
      CarpoolPost(
        id: id,
        authorName: m['authorName'] ?? '',
        from: m['from'] ?? '',
        to: m['to'] ?? '',
        when: parseDt(m['when']),
        seats: (m['seats'] ?? 1) as int,
        note: m['note'] ?? '',
      );

  Map<String, dynamic> toMap() => {
        'authorName': authorName,
        'from': from,
        'to': to,
        'when': when.toIso8601String(),
        'seats': seats,
        'note': note,
      };
}

class ServicePro {
  final String id;
  final String name;
  final String specialty;
  final String phone;
  final String neighborhood;
  final double rating;
  final bool available;

  const ServicePro({
    required this.id,
    required this.name,
    required this.specialty,
    required this.phone,
    required this.neighborhood,
    this.rating = 4.7,
    this.available = true,
  });

  factory ServicePro.fromMap(String id, Map<String, dynamic> m) => ServicePro(
        id: id,
        name: m['name'] ?? '',
        specialty: m['specialty'] ?? '',
        phone: m['phone'] ?? '',
        neighborhood: m['neighborhood'] ?? '',
        rating: (m['rating'] ?? 4.5).toDouble(),
        available: m['available'] ?? true,
      );

  Map<String, dynamic> toMap() => {
        'name': name,
        'specialty': specialty,
        'phone': phone,
        'neighborhood': neighborhood,
        'rating': rating,
        'available': available,
      };
}

class ChatMessage {
  final String id;
  final String chatId;
  final String senderId;
  final String senderName;
  final String? text;
  final String? audioUrl;
  final int audioDuration;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.senderName,
    this.text,
    this.audioUrl,
    this.audioDuration = 0,
    required this.createdAt,
  });

  factory ChatMessage.fromMap(String id, Map<String, dynamic> m) =>
      ChatMessage(
        id: id,
        chatId: m['chatId'] ?? '',
        senderId: m['senderId'] ?? '',
        senderName: m['senderName'] ?? '',
        text: m['text'],
        audioUrl: m['audioUrl'],
        audioDuration: (m['audioDuration'] ?? 0) as int,
        createdAt: parseDt(m['createdAt']),
      );

  Map<String, dynamic> toMap() => {
        'chatId': chatId,
        'senderId': senderId,
        'senderName': senderName,
        'text': text,
        'audioUrl': audioUrl,
        'audioDuration': audioDuration,
        'createdAt': createdAt.toIso8601String(),
      };
}
