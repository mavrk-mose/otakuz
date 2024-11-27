import { AnimeResponse, TopAnime, MovieResponse, Movie, MangaResponse, NewsResponse } from '@/types/anime';
import { Event } from '@/types/events';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ANIME_BASE_URL = 'https://api.jikan.moe/v4';
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
const BASE_URL = 'https://api.jikan.moe/v4';

export async function getTopAnime(): Promise<TopAnime[]> {
  try {
    const response = await fetch(`${BASE_URL}/top/anime?limit=10`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AnimeResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    return [];
  }
}


// Existing API functions...

// Events API functions
export async function createEvent(eventData: Omit<Event, 'id'>, thumbnailFile: File): Promise<string> {
  try {
    // Upload thumbnail
    const storageRef = ref(storage, `event-thumbnails/${Date.now()}-${thumbnailFile.name}`);
    await uploadBytes(storageRef, thumbnailFile);
    const thumbnailUrl = await getDownloadURL(storageRef);

    // Create event document
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
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) throw new Error('Event not found');

    const event = eventDoc.data();
    const attendees = event.attendees || [];
    const existingAttendeeIndex = attendees.findIndex((a: any) => a.id === userId);

    if (existingAttendeeIndex >= 0) {
      attendees[existingAttendeeIndex].status = status;
    } else {
      attendees.push({ id: userId, name: userName, status });
    }

    await updateDoc(eventRef, { attendees });
  } catch (error) {
    console.error('Error updating event attendee:', error);
    throw error;
  }
}