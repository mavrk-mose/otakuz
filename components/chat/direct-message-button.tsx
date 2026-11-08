"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useFirebaseChatActions } from "@/hooks/chat/use-firebase-chat-actions";

export function DirectMessageButton({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const { user } = useAuth();
  const { startDirectChat } = useFirebaseChatActions();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (user?.uid === userId) return null;
  return (
    <div className="space-y-2">
      <Button
        className="gap-2"
        disabled={busy}
        onClick={async () => {
          if (!user) {
            router.push("/auth");
            return;
          }
          setBusy(true);
          setError("");
          try {
            router.push(`/chat/${await startDirectChat(userId, displayName)}`);
          } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to start conversation.");
            setBusy(false);
          }
        }}
      >
        <MessageCircle className="h-4 w-4" />
        {busy ? "Opening…" : "Message privately"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
