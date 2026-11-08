import { serializeProfile } from "@/lib/query-state";

import { I18nText } from "@/components/i18n-text";
import { AnimeHoverPreview } from "@/components/anime/anime-hover-preview";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Clock3,
  Pencil,
  Trash2,
  Reply,
  MoreVertical,
  Tv,
  BookOpen,
  ShoppingBag,
  Calendar,
  MapPin,
  Star,
  Zap,
  ArrowRight,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from "next/image";
import Link from "next/link";
import { MessageProps } from "@/types/message";
import { useI18n } from "@/components/i18n-provider";

export function MessageComponent({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  sender,
}: MessageProps) {
  const { locale, t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.message);

  const handleEdit = async () => {
    if (editedMessage.trim() !== message.message) {
      await onEdit(message.id, editedMessage);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(message.id);
  };

  const handleReply = async () => {
    onReply?.(message);
  };

  const isCurrentUser = message.userId === currentUserId;
  const isShareType = [
    "anime_share",
    "manga_share",
    "product_share",
    "event_share",
    "profile_share",
  ].includes(message.type || "");

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return message.fileUrl ? (
          <Image
            src={message.fileUrl}
            alt="Uploaded image"
            width={320}
            height={320}
            unoptimized
            className="h-auto max-w-full rounded-lg object-contain"
          />
        ) : null;

      case "video":
        return <video src={message.fileUrl} controls className="max-w-full rounded-lg" />;

      case "audio":
        return <audio src={message.fileUrl} controls className="max-w-full" />;

      case "anime_share": {
        const data = message.animeData;
        if (!data) return null;
        return (
          <AnimeHoverPreview animeId={data.id} title={data.title} poster={data.image}>
            <div className="w-full max-w-[270px] overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg transition-transform hover:scale-[1.01]">
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                <Image
                  src={data.image || "/placeholder.svg"}
                  alt={data.title || "Anime cover"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2 left-2">
                  <Badge className="gap-1 border-0 bg-primary/90 text-[10px] font-mono uppercase text-primary-foreground backdrop-blur-sm">
                    <Tv className="h-3 w-3" />
                    Anime
                  </Badge>
                </div>
                {data.score && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{data.score}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-bold text-foreground">{data.title}</h3>
                <div className="mt-2.5">
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    className="w-full gap-1.5 text-xs font-semibold"
                  >
                    <Link href={`/anime/${data.id}`}>
                      <span>{t("chat.viewDetails") || "View Anime Details"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </AnimeHoverPreview>
        );
      }

      case "manga_share": {
        const data = message.mangaData;
        if (!data) return null;
        return (
          <div className="w-full max-w-[270px] overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg transition-transform hover:scale-[1.01]">
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
              <Image
                src={data.image || "/placeholder.svg"}
                alt={data.title || "Manga cover"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge className="gap-1 border-0 bg-emerald-600/90 text-[10px] font-mono uppercase text-white backdrop-blur-sm">
                  <BookOpen className="h-3 w-3" />
                  Manga
                </Badge>
              </div>
              {data.score && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{data.score}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-bold text-foreground">{data.title}</h3>
              <div className="mt-2.5">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  <Link href={`/manga/${data.id}`}>
                    <span>
                      <I18nText message="chat.readManga" />
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case "product_share": {
        const data = message.productData;
        if (!data) return null;
        return (
          <div className="w-full max-w-[270px] overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg transition-transform hover:scale-[1.01]">
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              <Image
                src={data.image || "/placeholder.svg"}
                alt={data.name || "Merch product"}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge className="gap-1 border-0 bg-rose-600/90 text-[10px] font-mono uppercase text-white backdrop-blur-sm">
                  <ShoppingBag className="h-3 w-3" />
                  {data.category || "Merch"}
                </Badge>
              </div>
              {typeof data.rating === "number" && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-yellow-400 backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{data.rating}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-bold text-foreground">{data.name}</h3>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-extrabold text-rose-500">
                  Tshs. {data.price?.toLocaleString()}
                </span>
                {typeof data.stock === "number" && data.stock < 5 && (
                  <span className="text-[10px] font-semibold uppercase text-rose-400">
                    Low Stock
                  </span>
                )}
              </div>
              <div className="mt-2.5">
                <Button
                  asChild
                  size="sm"
                  className="w-full gap-1.5 bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  <Link href={`/shop/product/${data.id}`}>
                    <span>
                      <I18nText message="chat.viewShop" />
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case "event_share": {
        const data = message.eventData;
        if (!data) return null;
        return (
          <div className="w-full max-w-[280px] overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-lg transition-transform hover:scale-[1.01]">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={data.image || "/placeholder.svg"}
                alt={data.title || "Event banner"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-2 left-2">
                <Badge className="gap-1 border-0 bg-amber-500/90 text-[10px] font-mono uppercase text-black font-semibold backdrop-blur-sm">
                  <Calendar className="h-3 w-3" />
                  {data.category || "Event"}
                </Badge>
              </div>
              {data.ticketPrice !== undefined && (
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                  ${data.ticketPrice}
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-bold text-foreground">{data.title}</h3>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {data.date} {data.time ? `• ${data.time}` : ""}
                  </span>
                </div>
                {data.locationName && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                    <span className="truncate">{data.locationName}</span>
                  </div>
                )}
                {typeof data.attendeesCount === "number" && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-primary shrink-0" />
                    <span>{data.attendeesCount} attending</span>
                  </div>
                )}
              </div>
              <div className="mt-2.5">
                <Button
                  asChild
                  size="sm"
                  className="w-full gap-1.5 bg-amber-500 font-semibold text-black hover:bg-amber-600 text-xs"
                >
                  <Link href={`/events/${data.id}`}>
                    <span>
                      <I18nText message="chat.eventDetails" />
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }

      case "profile_share": {
        const data = message.profileData;
        if (!data) return null;
        return (
          <div className="w-full max-w-[280px] overflow-hidden rounded-xl border border-border/60 bg-[#1A1A1E] text-card-foreground shadow-xl transition-transform hover:scale-[1.01]">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-rose-500/40 shadow">
                    <AvatarImage src={data.photoURL} alt={data.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold text-base">
                      {data.displayName[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white shadow border border-[#1A1A1E]">
                    <Zap className="h-2.5 w-2.5 fill-current" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="truncate text-sm font-bold text-white">{data.displayName}</h4>
                    {data.level && (
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-400">
                        Lv.{data.level}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{data.username}</p>
                  {data.rank && (
                    <div className="flex items-center gap-1 pt-0.5 text-[10px] font-semibold text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="truncate">{data.rank}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-border/30 bg-[#121215] p-2 text-center">
                <div>
                  <p className="text-xs font-extrabold text-white">{data.watchedCount ?? 42}</p>
                  <p className="text-[9px] font-medium text-muted-foreground">
                    <I18nText message="chat.watchedLabel" />
                  </p>
                </div>
                <div className="border-x border-border/30 px-1">
                  <p className="text-xs font-extrabold text-white">{data.readingCount ?? 18}</p>
                  <p className="text-[9px] font-medium text-muted-foreground">
                    <I18nText message="chat.readingLabel" />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">{data.totalExp ?? "1,450"}</p>
                  <p className="text-[9px] font-medium text-muted-foreground">EXP</p>
                </div>
              </div>

              <div className="mt-3">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5 border-rose-500/30 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <Link href={serializeProfile("/profile", { userId: data.userId })}>
                    <span>
                      <I18nText message="profile.viewProfile" />
                    </span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      }

      default:
        return <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>;
    }
  };

  return (
    <motion.div
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-start gap-3 mb-4 group ${isCurrentUser ? "flex-row-reverse" : ""}`}
    >
      <Link
        href={serializeProfile("/profile", { userId: message.userId })}
        aria-label={`View ${sender?.displayName || message.username}'s profile`}
        className="shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar>
          <AvatarImage
            src={sender?.photoURL || message.photoURL}
            alt={sender?.displayName || message.username}
            className="object-cover"
          />
          <AvatarFallback>{(sender?.displayName || message.username)[0] || "A"}</AvatarFallback>
        </Avatar>
      </Link>
      <div
        className={`flex min-w-0 max-w-[calc(100%-3.25rem)] flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <Link
            href={serializeProfile("/profile", { userId: message.userId })}
            className="text-sm font-medium hover:underline"
          >
            {sender?.displayName || message.username}
          </Link>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString(locale === "ja" ? "ja-JP" : "en-US")}
            {message.editedAt ? ` · ${t("chat.edited")}` : ""}
          </span>
        </div>
        {isCurrentUser && message.deliveryStatus !== "sent" && (
          <div
            className={`mt-1 flex items-center gap-1 text-xs ${
              message.deliveryStatus === "error" ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {message.deliveryStatus === "error" ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Clock3 className="h-3 w-3" />
            )}
            {message.deliveryStatus === "error" ? t("chat.sendFailed") : t("chat.sending")}
          </div>
        )}
        {message.replyTo && (
          <button
            type="button"
            className="mb-1 max-w-full rounded-md border-l-4 border-primary bg-muted p-2 text-left text-sm"
            onClick={() =>
              document
                .getElementById(`message-${message.replyTo?.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            <span className="block font-semibold">{message.replyTo.username}</span>
            <span className="block max-w-[260px] truncate text-muted-foreground">
              {message.replyTo.preview}
            </span>
          </button>
        )}
        <div
          className={`rounded-lg ${
            isShareType
              ? ""
              : isCurrentUser
                ? "bg-primary text-primary-foreground mt-1 px-4 py-2"
                : "bg-muted mt-1 px-4 py-2"
          }`}
        >
          {isEditing ? (
            <Input
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              onBlur={handleEdit}
              autoFocus
              className="min-w-[200px]"
            />
          ) : (
            renderContent()
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Message actions"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col space-y-1">
              {isCurrentUser && !isShareType && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                  <Pencil className="h-4 w-4 mr-2" /> {t("chat.edit")}
                </Button>
              )}
              {isCurrentUser && (
                <Button size="sm" variant="ghost" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReply}
                disabled={!onReply || !currentUserId || message.deliveryStatus === "error"}
              >
                <Reply className="h-4 w-4 mr-2" /> {t("chat.reply")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
}
