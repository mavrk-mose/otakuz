import { useState } from "react";
import { useAuth } from "../use-auth";
import { registerForEvent } from "@/lib/sanity";
import { toast } from "../use-toast";
import { Event } from "@/types/events";

const useRegisterEvent = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const { user } = useAuth();

    const handleRegister = async (event: Event) => {
        if (!user || !event) return;

        setIsRegistering(true);
        try {
            await registerForEvent(event._id, user.uid, user.displayName || 'Anonymous', user.photoURL || '');
            // await mutate();
            toast({
                title: "Registration Successful",
                description: "You have successfully registered for this event.",
            });
        } catch (error) {
            console.error('Error registering for event:', error);
            toast({
                title: "Registration Failed",
                description: "There was an error registering for the event. Please try again.",
                variant: "destructive",
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