import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../use-auth";
import { toast } from "sonner";
import { Event } from "@/types/events";
import { client } from "@/lib/sanity";

const useRegisterEvent = () => {
    const queryClient = useQueryClient();
    const [isRegistering, setIsRegistering] = useState(false);
    const { user } = useAuth();

    const handleRegister = async (event: Event) => {
        if (!user || !event) return;

        setIsRegistering(true);
        try {
            await registerForEvent(event._id, user.uid, user.displayName || 'Anonymous', user.photoURL || '');
            void queryClient.invalidateQueries({ queryKey: ['events'] });
            void queryClient.invalidateQueries({ queryKey: ['eventPages'] });
            void queryClient.invalidateQueries({ queryKey: ['globalSearch', 'events'] });
            void queryClient.invalidateQueries({ queryKey: ['event', event._id] });
            toast.success("Registration Successful", {
                description: "You have successfully registered for this event.",
            });
        } catch (error) {
            console.error('Error registering for event:', error);
            toast.error("Registration Failed", {
                description: "There was an error registering for the event. Please try again.",
            });
        } finally {
            setIsRegistering(false);
        }
    };

    return {
        isRegistering,
        setIsRegistering,
        handleRegister
    }

}

export default useRegisterEvent;
export async function registerForEvent(eventId: string, userId: string, userName: string, userPhotoUrl: string) {
  return client.patch(eventId)
    .setIfMissing({ attendees: [] })
    .append('attendees', [{
      userId,
      name: userName,
      photoUrl: userPhotoUrl,
      registeredAt: new Date().toISOString()
    }])
    .commit();
}
