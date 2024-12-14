import { useState, useRef } from 'react';
import {User} from "firebase/auth";

interface UseAudioRecorderReturn {
    isRecording: boolean;
    audioPreview: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    sendAudioMessage: (
        sendFile: (blob: Blob, uid: string, displayName: string, type: string) => Promise<void>,
        user: User | null
    ) => Promise<void>;
    resetRecording: () => void;
}

const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks((prev) => [...prev, event.data]);
                }
            };

            mediaRecorder.start();
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioPreview(audioUrl);
                setAudioChunks([]);
            };
        }
    };

    const sendAudioMessage = async (
        sendFile: (blob: Blob, uid: string, displayName: string, type: string) => Promise<void>,
        user: User | null
    ) => {
        if (audioPreview && user) {
            try {
                const response = await fetch(audioPreview);
                const audioBlob = await response.blob();
                await sendFile(audioBlob, user.uid, user.displayName || 'Anonymous', 'audio/webm');
                resetRecording();
            } catch (error) {
                console.error('Error sending audio message:', error);
            }
        }
    };

    const resetRecording = () => {
        setAudioPreview(null);
        setAudioChunks([]);
    };

    return {
        isRecording,
        audioPreview,
        startRecording,
        stopRecording,
        sendAudioMessage,
        resetRecording,
    };
};

export default useAudioRecorder;