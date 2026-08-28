import { useRef } from "react";
import { Camera, Heart, ImageIcon, MessageCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  areFriends,
  friendLink,
  useNazlawi,
} from "@/lib/nazlawi/store";
import type { Comment, TimelinePost, VillageUser } from "@/lib/nazlawi/types";
import { readAsDataUrl } from "./media";

const roleAr: Record<string, string> = {
  admin: "إدارة",
  merchant: "تاجر",
  resident: "نزلاوي",
};

export function Avatar({ user, size = "size-10" }: { user?: VillageUser | null; size?: string }) {
  if (user?.avatar) {
    return <img src={user.avatar} alt="" className={`${size} rounded-full object-cover`} />;
  }
  return (
    <div className={`flex ${size} items-center justify-center rounded-full bg-secondary font-extrabold text-secondary-foreground`}>
      {user?.name?.slice(0, 1) ?? <UserRound className="size-5" />}
    </div>
  );
}

export function CommentBox({
  items,
  onSend,
}: {
  items: Comment[];
  onSend: (text: string) => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      {items.map((c) => (
        <p key={c.id} className="text-sm">
          <span className="font-extrabold">{c.authorName}</span> {c.text}
        </p>
      ))}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onSend(String(fd.get("c") ?? ""));
          e.currentTarget.reset();
        }}
      >
        <Input name="c" placeholder="تعليق" className="h-9" />
        <Button type="submit" size="sm">
          نشر
        </Button>
      </form>
    </div>
  );
}

export function PostCard({ post }: { post: TimelinePost }) {
  const users = useNazlawi((s) => s.users);
  const likePost = useNazlawi((s) => s.likePost);
  const commentPost = useNazlawi((s) => s.commentPost);
  const openMember = useNazlawi((s) => s.openMember);
  const author = users.find((u) => u.id === post.authorId);
  return (
    <Card className="p-4">
      <button className="flex items-center gap-3" onClick={() => openMember(post.authorId)}>
        <Avatar user={author} />
        <div className="text-right">
          <p className="font-extrabold">{post.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {post.type === "photo" ? "صورة" : post.type === "video" ? "فيديو" : "منشور"}
          </p>
        </div>
      </button>
      {post.caption ? <p className="mt-3 leading-7">{post.caption}</p> : null}
      {post.mediaUrl && post.type === "photo" ? (
        <img src={post.mediaUrl} alt="" className="mt-3 w-full rounded-lg object-cover" />
      ) : null}
      {post.mediaUrl && post.type === "video" ? (
        <video src={post.mediaUrl} controls className="mt-3 w-full rounded-lg" />
      ) : null}
      <button className="mt-3 flex items-center gap-2 text-sm text-coral" onClick={() => likePost(post.id)}>
        <Heart className="size-4" /> {post.likes}
      </button>
      <CommentBox items={post.comments} onSend={(t) => commentPost(post.id, t)} />
    </Card>
  );
}

export function TimelineScreen() {
  const posts = useNazlawi((s) => s.posts);
  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export function PeopleScreen() {
  const me = useNazlawi((s) => s.currentUser);
  const users = useNazlawi((s) => s.users);
  const memberId = useNazlawi((s) => s.memberId);
  const member = users.find((u) => u.id === memberId);
  if (member && me) return <MemberProfile me={me} user={member} />;
  return (
    <div className="flex flex-col gap-2">
      {users
        .filter((u) => !u.banned)
        .map((u) => (
          <MemberRow key={u.id} user={u} />
        ))}
    </div>
  );
}

function MemberRow({ user }: { user: VillageUser }) {
  const openMember = useNazlawi((s) => s.openMember);
  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-right shadow-sm"
      onClick={() => openMember(user.id)}
    >
      <Avatar user={user} />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{user.name}</p>
        <p className="text-xs text-muted-foreground">{roleAr[user.role]}</p>
      </div>
    </button>
  );
}

function MemberProfile({ me, user }: { me: VillageUser; user: VillageUser }) {
  const friends = useNazlawi((s) => s.friends);
  const requestFriend = useNazlawi((s) => s.requestFriend);
  const answerFriend = useNazlawi((s) => s.answerFriend);
  const openChat = useNazlawi((s) => s.openChat);
  const banUser = useNazlawi((s) => s.banUser);
  const link = friendLink(friends, me.id, user.id);
  const friend = areFriends(friends, me.id, user.id);
  const incoming = link?.status === "pending" && link.toId === me.id;
  const outgoing = link?.status === "pending" && link.fromId === me.id;
  const showPhone = user.showPhone || me.role === "admin" || friend;
  const showDetails = user.showDetails || me.role === "admin" || friend || me.id === user.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <div className="relative h-36 bg-emerald-dark">
          {user.cover ? <img src={user.cover} alt="" className="size-full object-cover" /> : null}
          <div className="absolute -bottom-8 right-4">
            <Avatar user={user} size="size-20" />
          </div>
        </div>
        <div className="px-4 pb-4 pt-10">
          <p className="text-xl font-extrabold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{roleAr[user.role]}</p>
          {showDetails && user.bio ? <p className="mt-2">{user.bio}</p> : null}
          {showPhone ? <p className="mt-1 text-sm">{user.phone}</p> : null}
          {showDetails ? <p className="text-sm text-muted-foreground">{user.neighborhood}</p> : null}
        </div>
      </div>
      {me.id !== user.id ? (
        <div className="flex flex-wrap gap-2">
          {friend ? (
            <Button onClick={() => openChat(user.id)}>
              <MessageCircle className="size-4" /> محادثة
            </Button>
          ) : incoming ? (
            <>
              <Button onClick={() => answerFriend(link.id, true)}>قبول</Button>
              <Button variant="outline" onClick={() => answerFriend(link.id, false)}>
                رفض
              </Button>
            </>
          ) : outgoing ? (
            <Button variant="secondary" disabled>
              قيد الانتظار
            </Button>
          ) : (
            <Button onClick={() => requestFriend(user.id)}>إضافة</Button>
          )}
          {me.role === "admin" ? (
            <Button variant="outline" onClick={() => banUser(user.id, !user.banned)}>
              {user.banned ? "فك الحظر" : "حظر"}
            </Button>
          ) : null}
        </div>
      ) : (
        <OwnEditor />
      )}
    </div>
  );
}

export function ProfileScreen() {
  const me = useNazlawi((s) => s.currentUser);
  const logout = useNazlawi((s) => s.logout);
  if (!me) return null;
  return (
    <div className="flex flex-col gap-3">
      <MemberProfile me={me} user={me} />
      <Button variant="outline" onClick={logout}>
        تسجيل الخروج
      </Button>
    </div>
  );
}

function OwnEditor() {
  const me = useNazlawi((s) => s.currentUser);
  const updateMe = useNazlawi((s) => s.updateMe);
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  if (!me) return null;
  return (
    <Card className="space-y-3 p-4">
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => avatarRef.current?.click()}>
          <Camera className="size-4" /> صورة الملف
        </Button>
        <Button type="button" variant="secondary" onClick={() => coverRef.current?.click()}>
          <ImageIcon className="size-4" /> صورة الغلاف
        </Button>
      </div>
      <input
        ref={avatarRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) updateMe({ avatar: await readAsDataUrl(file) });
        }}
      />
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) updateMe({ cover: await readAsDataUrl(file) });
        }}
      />
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateMe({ bio: String(fd.get("bio") ?? "") });
        }}
      >
        <Input name="bio" defaultValue={me.bio} placeholder="نبذة" />
        <Button type="submit" size="sm">
          حفظ
        </Button>
      </form>
      <label className="flex items-center justify-between text-sm">
        إظهار رقم الجوال
        <input
          type="checkbox"
          checked={me.showPhone}
          onChange={(e) => updateMe({ showPhone: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between text-sm">
        إظهار التفاصيل
        <input
          type="checkbox"
          checked={me.showDetails}
          onChange={(e) => updateMe({ showDetails: e.target.checked })}
        />
      </label>
    </Card>
  );
}

export function ChatScreen() {
  const me = useNazlawi((s) => s.currentUser);
  const users = useNazlawi((s) => s.users);
  const friends = useNazlawi((s) => s.friends);
  const messages = useNazlawi((s) => s.messages);
  const chatWith = useNazlawi((s) => s.chatWith);
  const openChat = useNazlawi((s) => s.openChat);
  const sendMessage = useNazlawi((s) => s.sendMessage);
  if (!me) return null;
  const palIds = friends
    .filter(
      (f) => f.status === "accepted" && (f.fromId === me.id || f.toId === me.id),
    )
    .map((f) => (f.fromId === me.id ? f.toId : f.fromId));
  const pals = users.filter((u) => palIds.includes(u.id) && !u.banned);
  const other = users.find((u) => u.id === chatWith);
  const thread = other
    ? messages.filter((m) => m.threadId.includes(me.id) && m.threadId.includes(other.id))
    : [];

  if (!other) {
    return (
      <div className="flex flex-col gap-2">
        {pals.map((u) => (
          <button
            key={u.id}
            className="flex items-center gap-3 rounded-xl bg-card p-3 text-right"
            onClick={() => openChat(u.id)}
          >
            <Avatar user={u} />
            <p className="font-extrabold">{u.name}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] flex-col">
      <button className="mb-3 flex items-center gap-3" onClick={() => openChat(other.id)}>
        <Avatar user={other} />
        <p className="font-extrabold">{other.name}</p>
      </button>
      <div className="flex flex-1 flex-col gap-2">
        {thread.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              m.senderId === me.id
                ? "self-start bg-primary text-primary-foreground"
                : "self-end bg-muted"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          sendMessage(String(fd.get("t") ?? ""));
          e.currentTarget.reset();
        }}
      >
        <Input name="t" required placeholder="رسالة" />
        <Button type="submit">إرسال</Button>
      </form>
    </div>
  );
}
