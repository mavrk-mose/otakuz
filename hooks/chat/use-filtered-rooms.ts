import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { getCachedRooms, replaceCachedRooms } from "@/lib/chat-cache";
import type { Room } from "@/types/room";

function snapshotToRooms(
  documents: Array<{ id: string; data: () => Record<string, unknown> }>,
): Room[] {
  return documents.map((roomSnapshot) => {
    const data = roomSnapshot.data();
    return {
      id: roomSnapshot.id,
      photoURL: typeof data.photoURL === "string" ? data.photoURL : undefined,
      participantIds: Array.isArray(data.participantIds)
        ? (data.participantIds as string[])
        : undefined,
      title: typeof data.title === "string" ? data.title : "Untitled room",
      createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
      memberCount: typeof data.memberCount === "number" ? data.memberCount : 0,
      members: Array.isArray(data.members) ? (data.members as string[]) : [],
    };
  });
}

const useFilteredRooms = (searchQuery: string | null) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }

    let isActive = true;
    let unsubscribe = () => {};
    const userId = user.uid;

    setRooms([]);
    setLoading(true);
    setError(null);

    const startRoomListener = async () => {
      try {
        const cachedRooms = await getCachedRooms(userId);
        if (!isActive) return;

        if (cachedRooms.length > 0) {
          setRooms(cachedRooms);
          setLoading(false);
        }
      } catch {
        // Fall through to the Firestore listener when IndexedDB is unavailable.
      }

      if (!isActive) return;

      let publicRooms: Room[] = [];
      let directRooms: Room[] = [];
      const publish = () => {
        if (!isActive) return;
        const liveRooms = [...directRooms, ...publicRooms];
        setRooms(liveRooms);
        setLoading(false);
        void replaceCachedRooms(userId, liveRooms).catch(() => undefined);
      };
      const stopDirect = onSnapshot(
        query(collection(db, "directChats"), where("members", "array-contains", userId)),
        (snapshot) => {
          directRooms = snapshotToRooms(snapshot.docs);
          publish();
        },
        (snapshotError) => {
          if (isActive) setError(snapshotError);
        },
      );
      const stopPublic = onSnapshot(
        collection(db, "chatrooms"),
        (snapshot) => {
          if (!isActive) return;
          publicRooms = snapshotToRooms(snapshot.docs);
          setError(null);
          publish();
        },
        (snapshotError) => {
          if (!isActive) return;
          setError(snapshotError);
          setLoading(false);
        },
      );
      unsubscribe = () => {
        stopPublic();
        stopDirect();
      };
    };

    void startRoomListener().catch((listenerError) => {
      if (!isActive) return;
      setError(listenerError as Error);
      setLoading(false);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [user]);

  const refetch = useCallback(async () => {
    if (!user) return;
    const [snapshot, direct] = await Promise.all([
      getDocs(collection(db, "chatrooms")),
      getDocs(query(collection(db, "directChats"), where("members", "array-contains", user.uid))),
    ]);
    const liveRooms = [...snapshotToRooms(direct.docs), ...snapshotToRooms(snapshot.docs)];
    setRooms(liveRooms);
    await replaceCachedRooms(user.uid, liveRooms).catch(() => undefined);
  }, [user]);

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;
    const normalizedQuery = searchQuery.toLowerCase();
    return rooms.filter((room) => room.title.toLowerCase().includes(normalizedQuery));
  }, [rooms, searchQuery]);

  return {
    rooms: filteredRooms,
    loading,
    error,
    refetch,
  };
};

export default useFilteredRooms;
