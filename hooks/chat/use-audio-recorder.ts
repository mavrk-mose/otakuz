import { useState, useRef, useCallback, useEffect } from 'react';
import type { User } from 'firebase/auth';

interface UseAudioRecorderReturn {
    isRecording: boolean;
    recordingTime: number;
    audioPreview: string | null;
    isSending: boolean;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    cancelRecording: () => void;
    sendAudioMessage: (
        sendFile: (file: File | Blob, suppliedFileType?: string) => Promise<void>,
        user: User | null
    ) => Promise<void>;
    resetRecording: () => void;
}

function getSupportedAudioMimeType(): { mimeType: string; extension: string } {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
        return { mimeType: '', extension: 'webm' };
    }

    const preferredTypes = [
        { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
        { mimeType: 'audio/webm', extension: 'webm' },
        { mimeType: 'audio/mp4', extension: 'mp4' },
        { mimeType: 'audio/aac', extension: 'aac' },
        { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
    ];

    for (const candidate of preferredTypes) {
        if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
            return candidate;
        }
    }

    return { mimeType: '', extension: 'webm' };
}

const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioBlobRef = useRef<Blob | null>(null);
    const audioPreviewRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const chosenExtensionRef = useRef<string>('webm');

    const cleanupStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const resetRecording = useCallback(() => {
        clearTimer();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
                mediaRecorderRef.current.onstop = null;
                mediaRecorderRef.current.stop();
            } catch {
                // ignore
            }
        }
        cleanupStream();

        if (audioPreviewRef.current) {
            URL.revokeObjectURL(audioPreviewRef.current);
            audioPreviewRef.current = null;
        }

        audioChunksRef.current = [];
        audioBlobRef.current = null;
        setAudioPreview(null);
        setIsRecording(false);
        setRecordingTime(0);
        setError(null);
    }, [cleanupStream, clearTimer]);

    const startRecording = useCallback(async () => {
        setError(null);

        if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setError('Audio recording is not supported in this browser.');
            return;
        }

        try {
            // Revoke any previous preview and reset buffers
            if (audioPreviewRef.current) {
                URL.revokeObjectURL(audioPreviewRef.current);
                audioPreviewRef.current = null;
            }
            audioChunksRef.current = [];
            audioBlobRef.current = null;
            setAudioPreview(null);
            setRecordingTime(0);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const { mimeType, extension } = getSupportedAudioMimeType();
            chosenExtensionRef.current = extension;

            const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event: BlobEvent) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                setError('Audio recording error occurred.');
                cleanupStream();
                clearTimer();
                setIsRecording(false);
            };

            mediaRecorder.onstop = () => {
                try {
                    const finalMimeType = mediaRecorder.mimeType || mimeType || 'audio/webm';
                    if (audioChunksRef.current.length > 0) {
                        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
                        if (blob.size > 0) {
                            audioBlobRef.current = blob;
                            const url = URL.createObjectURL(blob);
                            audioPreviewRef.current = url;
                            setAudioPreview(url);
                        } else {
                            setError('Recorded audio was empty. Please try speaking into the microphone.');
                        }
                    } else {
                        setError('No audio data received. Please check your microphone.');
                    }
                } catch (err) {
                    console.error('Failed to create audio blob:', err);
                    setError('Failed to process recorded audio.');
                } finally {
                    cleanupStream();
                    clearTimer();
                    setIsRecording(false);
                }
            };

            // Collect data slices every 250ms
            mediaRecorder.start(250);
            setIsRecording(true);

            clearTimer();
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error starting recording:', err);
            cleanupStream();
            clearTimer();
            setIsRecording(false);
            const errName = err instanceof Error ? err.name : '';
            if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
                setError('Microphone permission denied. Please allow microphone access in your browser settings.');
            } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
                setError('No microphone found on this device.');
            } else {
                setError('Unable to start recording. Please check your microphone settings.');
            }
        }
    }, [cleanupStream, clearTimer]);

    const stopRecording = useCallback(() => {
        clearTimer();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
                mediaRecorderRef.current.stop();
            } catch (err) {
                console.error('Error stopping recorder:', err);
                cleanupStream();
            }
        }
        setIsRecording(false);
    }, [cleanupStream, clearTimer]);

    const sendAudioMessage = useCallback(
        async (
            sendFile: (file: File | Blob, suppliedFileType?: string) => Promise<void>,
            user: User | null
        ) => {
            if (!user) {
                setError('You must be signed in to send an audio message.');
                return;
            }

            let blob = audioBlobRef.current;
            if (!blob && audioPreviewRef.current) {
                try {
                    const response = await fetch(audioPreviewRef.current);
                    blob = await response.blob();
                } catch (e) {
                    console.error('Failed to retrieve recorded audio blob:', e);
                }
            }

            if (!blob || blob.size === 0) {
                setError('No audio recorded to send.');
                return;
            }

            setIsSending(true);
            setError(null);

            try {
                const rawType = blob.type || 'audio/webm';
                const cleanType = rawType.split(';')[0].trim() || 'audio/webm';
                const extension = chosenExtensionRef.current || (cleanType.includes('mp4') ? 'mp4' : 'webm');
                const file = new File([blob], `voice-message-${Date.now()}.${extension}`, {
                    type: cleanType,
                });

                await sendFile(file, cleanType);
                resetRecording();
            } catch (err) {
                console.error('Error sending audio message:', err);
                setError((err as Error).message || 'Failed to send audio message.');
            } finally {
                setIsSending(false);
            }
        },
        [resetRecording]
    );

    useEffect(() => {
        return () => {
            clearTimer();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try {
                    mediaRecorderRef.current.onstop = null;
                    mediaRecorderRef.current.stop();
                } catch {
                    // ignore
                }
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (audioPreviewRef.current) {
                URL.revokeObjectURL(audioPreviewRef.current);
                audioPreviewRef.current = null;
            }
        };
    }, [cleanupStream, clearTimer]);

    return {
        isRecording,
        recordingTime,
        audioPreview,
        isSending,
        error,
        startRecording,
        stopRecording,
        cancelRecording: resetRecording,
        sendAudioMessage,
        resetRecording,
    };
};

export default useAudioRecorder;
