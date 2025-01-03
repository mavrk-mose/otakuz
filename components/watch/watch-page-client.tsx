"use client"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Heart } from 'lucide-react';
import { useState } from 'react';
import { VideoPlayer } from '@/components/watch/video-player';
import { CommentSection } from '@/components/comment-section';
import { WatchPartySection } from '@/components/watch/watch-party-section';
import { motion } from 'framer-motion';
import useAnimeDetails from "@/hooks/anime/use-anime-details";

export default function WatchPageClient({ id }: { id: string }) {
    const { data: anime, isLoading } = useAnimeDetails(id);
    const [activeTab, setActiveTab] = useState('comments');

    if (isLoading || !anime) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    {/* Video Player Skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-video bg-muted rounded-md animate-pulse"/>
                        <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse"/>
                        <div className="h-4 bg-muted rounded-md w-full animate-pulse"/>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="h-[calc(100vh-2rem)] bg-muted rounded-md animate-pulse"/>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="container mx-auto px-4 py-8"
        >
            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                <motion.div
                    initial={{y: 20}}
                    animate={{y: 0}}
                    className="space-y-4"
                >
                    <VideoPlayer videoUrl={anime.trailer.embed_url}/>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">{anime.title}</h1>
                        <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-muted-foreground">{anime.synopsis}</p>
                </motion.div>

                <Card className="h-[calc(100vh-2rem)] sticky top-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="comments" className="flex-1">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Comments
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="flex-1">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat
                            </TabsTrigger>
                            <TabsTrigger value="party" className="flex-1">
                                <Users className="w-4 h-4 mr-2" />
                                Party
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="comments" className="p-4">
                            <CommentSection />
                        </TabsContent>
                        {/* <TabsContent value="chat" className="p-4">
                            <ChatRoom animeId={id} />
                        </TabsContent> */}
                        <TabsContent value="party" className="p-4">
                            <WatchPartySection animeId={id} anime={anime} />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </motion.div>
    );
}