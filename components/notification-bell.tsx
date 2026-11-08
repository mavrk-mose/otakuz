"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type NotificationType,
} from "@/lib/notifications";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import {
  useNotificationsStore,
  type NotificationItem,
} from "@/store/use-notifications-store";

export function NotificationBell() {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const firestoreError = useNotificationsStore((state) => state.firestoreError);
  const loading = useNotificationsStore((state) => state.loading);
  const subscribeForUser = useNotificationsStore((state) => state.subscribeForUser);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeForUser(user.uid);
  }, [user?.uid, subscribeForUser]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      if (notification.link) {
        router.push(notification.link);
        setOpen(false);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Could not open notification", { description: msg });
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllAsRead(user.uid);
      toast.success("All notifications marked as read");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Failed to mark notifications as read", { description: msg });
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error("Failed to delete notification", { description: msg });
    }
  };

  const formatTimestamp = (ts: NotificationItem["timestamp"]) => {
    if (!ts || typeof ts.toDate !== "function") {
      return "Just now";
    }
    return ts.toDate().toLocaleString(locale === "ja" ? "ja-JP" : "en-US");
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "chat":
        return "💬";
      case "anime":
        return "📺";
      case "article":
        return "📰";
      case "event":
        return "📅";
      case "product":
        return "🛍️";
      case "list":
        return "📝";
      default:
        return "🔔";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("notifications.title")}
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1"
              >
                <span className="text-[10px] font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 border-border bg-popover">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h4 className="font-semibold text-foreground">
            {t("notifications.title")}
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllRead}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>

        {firestoreError && (
          <div role="alert" className="flex items-start gap-2 border-b border-border p-3 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{t("notifications.loadFailed")}</span>
          </div>
        )}

        <ScrollArea controlSize="sm" className="h-[360px]">
          <div className="p-3">
            {loading && notifications.length === 0 ? (
              <p role="status" className="py-10 text-center text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            ) : notifications.length === 0 && !firestoreError ? (
              <EmptyState
                illustration="collection"
                title={t("notifications.empty")}
                description={t("notifications.emptyDescription")}
                compact
                className="min-h-[330px] justify-center"
              />
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className={`group flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent ${
                        notification.read ? "opacity-65" : "bg-accent/50"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="text-xl leading-none pt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("notifications.delete")}
                        className="h-7 w-7 shrink-0 opacity-70 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 hover:text-destructive"
                        onClick={(e) =>
                          handleDeleteNotification(notification.id, e)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
