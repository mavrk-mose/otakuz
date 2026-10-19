"use client"

import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserLists } from '@/components/profile/user-lists';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { motion } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useI18n } from '@/components/i18n-provider';

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          <div className="space-y-6">
            <UserProfileCard user={user} />

            <Card className="p-6 bg-card/80 border-border/50">
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                {t("profile.stats")}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{t("profile.joined")}</span>
                  <span className="font-medium">{user.metadata.creationTime?.split('T')[0] || 'Recently'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">{t("profile.lists")}</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t("profile.savedItems")}</span>
                  <span className="font-medium">24</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("profile.settings")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("profile.signOut")}
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="lists" className="w-full">
              <TabsList className="mb-6 bg-muted/60 p-1">
                <TabsTrigger value="lists">{t("profile.myLists")}</TabsTrigger>
                <TabsTrigger value="history">{t("profile.watchHistory")}</TabsTrigger>
                <TabsTrigger value="reviews">{t("profile.reviews")}</TabsTrigger>
              </TabsList>

              <TabsContent value="lists">
                <UserLists userId={user.uid} />
              </TabsContent>

              <TabsContent value="history">
                <Card className="p-8 border-border/50 bg-card/60">
                  <p className="text-muted-foreground text-center">
                    {t("profile.historyComingSoon")}
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="p-8 border-border/50 bg-card/60">
                  <p className="text-muted-foreground text-center">
                    {t("profile.reviewsComingSoon")}
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
