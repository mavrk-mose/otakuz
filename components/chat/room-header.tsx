import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ArrowLeft, MoreVertical} from "lucide-react";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {AvatarFallback} from "@radix-ui/react-avatar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import React from "react";
import {RoomDetails} from "@/types/room";

interface Props {
    roomId: string;
    roomDetails: RoomDetails | null | undefined;
}

export default function RoomHeader({roomId, roomDetails}: Props): JSX.Element {
    return (
        <div className="flex items-center gap-4 p-4 border-b sticky top-0 bg-background z-10">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/chat">
                    <ArrowLeft className="h-6 w-6"/>
                </Link>
            </Button>
            <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${roomId}`}/>
                <AvatarFallback>{roomDetails ? roomDetails.title[0] : ''}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <h1 className="font-semibold truncate">{roomDetails ? roomDetails.title : ''}</h1>
                <p className="text-sm text-muted-foreground">
                    {roomDetails ? roomDetails.memberCount : ''} members
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-6 w-6"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>View members</DropdownMenuItem>
                    <DropdownMenuItem>Share room</DropdownMenuItem>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}