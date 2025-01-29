import React, { useState, useRef } from "react";
import axios from "axios";

const VoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState("");
    const [error, setError] = useState("");

    const mediaRecorderRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            const audioChunks = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                setAudioBlob(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            setError("Error accessing microphone: " + err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async () => {
        if (!audioBlob) {
            setError("No audio to upload. Please record your voice first.");
            return;
        }

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        try {
            const response = await axios.post("http://localhost:5000/transcribe", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setTranscription(response.data.text);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <div>
            <h1>Speech-to-Text (Voice Input)</h1>
            <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
            <button onClick={uploadAudio} disabled={!audioBlob}>
                Upload and Transcribe
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {transcription && (
                <div>
                    <h2>Transcription:</h2>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
