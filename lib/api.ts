import { AnimeResponse, TopAnime, MangaResponse, NewsResponse } from '@/types/anime';
import {Event} from '@/types/events';
import {db, storage} from '@/lib/firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {GalleryImage} from "@/types/gallery";

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const ANIME_BASE_URL = 'https://api.jikan.moe/v4';

// Add rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAnimeGenres() {
    try {
        await delay(1000); // Add delay to respect API rate limits
        const response = await fetch(`${ANIME_BASE_URL}/genres/anime`);
        if (!response.ok) throw new Error('Failed to fetch anime genres');

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime genres:', error);
        return [];
    }
}

export async function getTopAnime(genre?: string) {
    try {
        await delay(1000);
        const url = new URL(`${ANIME_BASE_URL}/top/anime`);
        if (genre && genre !== 'all') {
            url.searchParams.append('genre', genre);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch top anime');

        const data: AnimeResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching top anime:', error);
        return [];
    }
}

export async function getAnimeByGenre(genreId: string) {
    try {
        await delay(1000);
        const response = await fetch(`${ANIME_BASE_URL}/anime?genres=${genreId}`);
        if (!response.ok) throw new Error('Failed to fetch anime by genre');

        const data: AnimeResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime by genre:', error);
        return [];
    }
}

export async function getTopManga() {
    try {
        await delay(1000);
        const response = await fetch(`${ANIME_BASE_URL}/top/manga`);
        if (!response.ok) throw new Error('Failed to fetch top manga');

        const data: MangaResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching top manga:', error);
        return [];
    }
}

export async function getAnimeNews() {
    try {
        await delay(1000);
        const response = await fetch(`${ANIME_BASE_URL}/anime/1/news`);
        if (!response.ok) throw new Error('Failed to fetch anime news');

        const data: NewsResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime news:', error);
        return [];
    }
}

export async function getAnimeSchedule() {
    try {
        await delay(1000);
        const response = await fetch(`${ANIME_BASE_URL}/schedules`);
        if (!response.ok) throw new Error('Failed to fetch anime schedule');

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching anime schedule:', error);
        return [];
    }
}

// Events API functions
export async function createEvent(eventData: Omit<Event, 'id'>, thumbnailFile: File): Promise<string> {
    try {
        if (!storage) {
            throw new Error('Firestore instance is not initialized.');
        }

        // Upload thumbnail
        const storageRef = ref(storage, `event-thumbnails/${Date.now()}-${thumbnailFile.name}`);
        await uploadBytes(storageRef, thumbnailFile);
        const thumbnailUrl = await getDownloadURL(storageRef);

        // Create event document
        if (!db) {
            throw new Error('Firestore instance is not initialized.');
        }
        const eventRef = await addDoc(collection(db, 'events'), {
            ...eventData,
            thumbnailUrl,
            createdAt: Timestamp.now(),
        });

        return eventRef.id;
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}


export async function getEvents(): Promise<Event[]> {
    try {
        if (!db) {
            throw new Error('Firestore instance is not initialized.');
        }

        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Event[];
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

export async function getEvent(id: string): Promise<Event | null> {
    try {
        if (!db) {
            throw new Error('Firestore instance is not initialized.');
        }

        const eventRef = doc(db, 'events', id);
        const eventDoc = await getDoc(eventRef);

        if (!eventDoc.exists()) return null;

        return {
            id: eventDoc.id,
            ...eventDoc.data()
        } as Event;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
}

export async function updateEventAttendee(
    eventId: string,
    userId: string,
    userName: string,
    status: 'going' | 'maybe' | 'not_going'
): Promise<void> {
    try {
        if (!db) {
            throw new Error('Firestore instance is not initialized.');
        }

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

 export async function getGalleryImages(query: string): Promise<GalleryImage []> {
    try {
        return [];
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        throw error;
    }
}