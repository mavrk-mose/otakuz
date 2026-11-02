"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  Send,
  Trash2,
} from "lucide-react";
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
  const setupResult = useNotificationsStore((state) => state.setupResult);
  const isEnablingPush = useNotificationsStore((state) => state.isEnablingPush);
  const subscribeForUser = useNotificationsStore(
    (state) => state.subscribeForUser
  );
  const enableWebNotifications = useNotificationsStore(
    (state) => state.enableWebNotifications
  );
  const sendTestNotification = useNotificationsStore(
    (state) => state.sendTestNotification
  );

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

  const handleEnableBrowserAlerts = async () => {
    const result = await enableWebNotifications(user?.uid);
    if (result.permission === "granted") {
      toast.success("Browser web notifications enabled");
    } else if (result.permission === "denied") {
      toast.error("Notifications blocked in browser settings", {
        description: result.reason,
      });
    } else if (result.reason) {
      toast.info("Notification permission not granted", {
        description: result.reason,
      });
    }
  };

  const handleSendTest = async () => {
    const ok = await sendTestNotification();
    if (ok) {
      toast.success("Sent test browser notification");
    } else {
      toast.error("Could not dispatch browser notification");
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

  const hasSetupError =
    setupResult?.status === "service-worker-error" ||
    setupResult?.status === "fcm-error" ||
    setupResult?.status === "insecure-context";

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

        {/* Web Notification Permission & Diagnostic Banner */}
        <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs">
          {!setupResult || setupResult.permission === "default" ? (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <BellRing className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Get desktop &amp; browser alerts</span>
              </span>
              <Button
                type="button"
                size="sm"
                disabled={isEnablingPush}
                onClick={handleEnableBrowserAlerts}
                className="h-7 shrink-0 rounded-lg px-2.5 text-xs"
              >
                {isEnablingPush ? "Enabling..." : "Enable Alerts"}
              </Button>
            </div>
          ) : setupResult.permission === "denied" ? (
            <div className="flex items-start gap-2 text-amber-500">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Browser notifications are blocked in site permissions. Allow notifications in your browser bar to receive desktop alerts.
              </span>
            </div>
          ) : setupResult.permission === "granted" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {setupResult.status === "fcm-ready"
                      ? "Push & Web Alerts Active"
                      : "Web Alerts Active"}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendTest}
                  className="h-6 gap-1 rounded-md px-2 text-[11px]"
                >
                  <Send className="h-3 w-3" />
                  Test
                </Button>
              </div>
              {hasSetupError && setupResult.reason && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
                  {setupResult.reason}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {setupResult.reason || "Web Notifications unavailable in this browser."}
            </p>
          )}

          {firestoreError && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-[11px] text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="break-words">{firestoreError}</span>
            </div>
          )}
        </div>

        <ScrollArea controlSize="sm" className="h-[360px]">
          <div className="p-3">
            {notifications.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("notifications.empty")}
              </p>
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
                        aria-label="Delete notification"
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
