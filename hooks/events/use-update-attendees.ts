import {db} from "@/lib/firebase";
import {doc, getDoc, updateDoc} from "firebase/firestore";

const useUpdateAttendees = async (
    eventId: string,
    userId: string,
    userName: string,
    status: 'going' | 'maybe' | 'not_going'
) => {
    try {
        if (!db) return ;

        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) throw new Error('Event not found');

        const event = eventDoc.data();
        const attendees = event.attendees || [];
        const existingAttendeeIndex = attendees.findIndex((a: any) => a.id === userId);

        if (existingAttendeeIndex >= 0) {
            attendees[existingAttendeeIndex].status = status;
        } else {
            attendees.push({id: userId, name: userName, status});
        }

        await updateDoc(eventRef, {attendees});
    } catch (error) {
        console.error('Error updating event attendee:', error);
        throw error;
    }
}

export default useUpdateAttendees;