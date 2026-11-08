import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { roomCollection } from "@/lib/chat-room-path";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";

export type ChatProfile = { displayName?: string; photoURL?: string };

/** One listener per sender, shared by all their messages in the room. */
export function useChatProfiles(userIds: string[], roomId?: string) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Record<string, ChatProfile>>({});
  const key = JSON.stringify(Array.from(new Set(userIds.filter(Boolean))).sort());
  useEffect(() => {
    setProfiles({});
    const ids: string[] = JSON.parse(key);
    const subscriptions = ids.map((id) =>
      onSnapshot(
        doc(db, "users", id),
        (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();
          setProfiles((previous) => ({
            ...previous,
            [id]: {
              displayName: typeof data.displayName === "string" ? data.displayName : undefined,
              photoURL: typeof data.photoURL === "string" ? data.photoURL : undefined,
            },
          }));
        },
        () => {
          // Private profiles stay private; message author snapshots supply a fallback.
        },
      ),
    );
    if (roomId)
      ids.forEach((id) =>
        subscriptions.push(
          onSnapshot(
            doc(db, roomCollection(roomId), roomId, "profiles", id),
            (snapshot) => {
              if (!snapshot.exists()) return;
              const data = snapshot.data();
              setProfiles((previous) => ({
                ...previous,
                [id]: {
                  displayName:
                    typeof data.displayName === "string"
                      ? data.displayName
                      : previous[id]?.displayName,
                  photoURL:
                    typeof data.photoURL === "string" ? data.photoURL : previous[id]?.photoURL,
                },
              }));
            },
            () => {},
          ),
        ),
      );
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [key, roomId]);
  useEffect(() => {
    if (!roomId || !user) return;
    void setDoc(doc(db, roomCollection(roomId), roomId, "profiles", user.uid), {
      displayName: user.displayName || "Member",
      photoURL: user.photoURL || "",
    }).catch(() => undefined);
  }, [roomId, user]);
  return profiles;
}
