"use client"

import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserLists } from '@/components/profile/user-lists';
import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) {
    window.location.href = "/auth"
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-[300px_1fr] gap-8"
      >
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {user.displayName || 'Anonymous User'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {user.email}
              </p>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" className="flex-1">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined </span>
                <span>{user.metadata.creationTime?.split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lists</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saved Items</span>
                <span>24</span>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="lists">
            <TabsList className="mb-8">
              <TabsTrigger value="lists">My Lists</TabsTrigger>
              <TabsTrigger value="history">Watch History</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="lists">
              <UserLists userId={user.uid} />
            </TabsContent>

            <TabsContent value="history">
              <Card className="p-6">
                <p className="text-muted-foreground text-center">
                  Watch history coming soon...
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="p-6">
                <p className="text-muted-foreground text-center">
                  Reviews coming soon...
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}