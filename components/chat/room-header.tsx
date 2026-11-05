"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { RoomDetails } from '@/types/room';
import { useI18n } from '@/components/i18n-provider';
import { useAuth } from '@/hooks/use-auth';
import { useFirebaseChatActions } from '@/hooks/chat/use-firebase-chat-actions';
import { useChatProfiles } from '@/hooks/chat/use-chat-profiles';
import { DirectMessageButton } from './direct-message-button';

export default function RoomHeader({ roomId, roomDetails, onLeave }: { roomId: string; roomDetails: RoomDetails | null | undefined; onLeave?: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const { leaveRoom, updateRoomImage } = useFirebaseChatActions();
  const [membersOpen, setMembersOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const profiles = useChatProfiles(membersOpen ? roomDetails?.members || [] : [], roomId);
  const isOwner = user?.uid === roomDetails?.createdBy && !roomDetails?.participantIds;
  return <>
    <div className="relative z-10 flex items-center gap-3 border-b bg-background p-4">
      <Button variant="ghost" size="icon" asChild><Link href="/chat" aria-label="Back to rooms"><ArrowLeft className="h-5 w-5" /></Link></Button>
      <button type="button" className="relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring" aria-label={isOwner ? 'Change room image' : 'View members'} disabled={busy} onClick={() => isOwner ? fileRef.current?.click() : setMembersOpen(true)}>
        <Avatar className="h-11 w-11"><AvatarImage src={roomDetails?.photoURL || `https://avatar.vercel.sh/${roomId}`} /><AvatarFallback>{roomDetails?.title[0]}</AvatarFallback></Avatar>
        {isOwner && <Camera className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background p-0.5" />}
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Room image" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
        setBusy(true); setError('');
        try { await updateRoomImage(roomId, file); } catch (error) { setError(error instanceof Error ? error.message : 'Unable to update room image.'); } finally { setBusy(false); }
      }} />
      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setMembersOpen(true)}>
        <h1 className="truncate font-semibold">{roomDetails?.title}</h1>
        <p className="text-sm text-muted-foreground">{roomDetails?.memberCount || 0} {t('chat.members')}{busy ? ' · Saving…' : ''}</p>
      </button>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Room options"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setMembersOpen(true)}>{t('chat.viewMembers')}</DropdownMenuItem>
          {isOwner && <DropdownMenuItem disabled={busy} onSelect={() => fileRef.current?.click()}>Change room image</DropdownMenuItem>}
          <DropdownMenuItem asChild><Link href="/profile">Edit my profile image</Link></DropdownMenuItem>
          {!roomDetails?.participantIds && <DropdownMenuItem onSelect={async () => {
            try { await navigator.clipboard.writeText(`${window.location.origin}/chat/${roomId}`); setNotice('Room link copied.'); } catch { setError('Unable to copy room link.'); }
          }}>{t('chat.shareRoom')}</DropdownMenuItem>}
          <DropdownMenuItem className="text-destructive" disabled={busy || !roomDetails?.members.includes(user?.uid || '')} onSelect={async () => {
            setBusy(true); setError('');
            try { await leaveRoom(roomId); if (onLeave) onLeave(); else router.replace('/chat'); } catch (error) { setError(error instanceof Error ? error.message : 'Unable to leave room.'); setBusy(false); }
          }}>Exit room</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    {error && <p role="alert" className="px-4 py-2 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="px-4 py-2 text-sm text-muted-foreground">{notice}</p>}
    <Dialog open={membersOpen} onOpenChange={setMembersOpen}><DialogContent className="max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle>{t('chat.viewMembers')}</DialogTitle></DialogHeader>
      <ul className="space-y-4">{roomDetails?.members.map(id => {
        const member = profiles[id]; const name = member?.displayName || (id === user?.uid ? user.displayName : null) || 'Member';
        return <li key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
          <Link href={`/profile?userId=${encodeURIComponent(id)}`} className="flex min-w-0 items-center gap-3 hover:underline">
            <Avatar><AvatarImage src={member?.photoURL || (id === user?.uid ? user.photoURL || undefined : undefined)} /><AvatarFallback>{name[0]}</AvatarFallback></Avatar>
            <span className="truncate">{name}{id === roomDetails.createdBy ? ' · Creator' : ''}</span>
          </Link>
          <DirectMessageButton userId={id} displayName={name} />
        </li>;
      })}</ul>
    </DialogContent></Dialog>
  </>;
}
