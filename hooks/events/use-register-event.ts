import { useState } from "react";
import { useAuth } from "../use-auth";
import { registerForEvent } from "@/lib/sanity";
import { toast } from "sonner";
import { Event } from "@/types/events";

const useRegisterEvent = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const { user } = useAuth();

    const handleRegister = async (event: Event) => {
        if (!user || !event) return;

        setIsRegistering(true);
        try {
            await registerForEvent(event._id, user.uid, user.displayName || 'Anonymous', user.photoURL || '');
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