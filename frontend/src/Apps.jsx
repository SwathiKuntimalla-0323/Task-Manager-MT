import React, { useState } from "react";
import axios from "axios";
import "./index.css"
const Apps = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState("");

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob, "audio.wav");

      try {
        const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTranscription(response.data.transcription);
      } catch (error) {
        console.error("Error uploading audio:", error);
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Audio Recorder</h1>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <h2>Transcription:</h2>
      <p>{transcription || "No transcription yet."}</p>
    </div>
  );
};

export default Apps;
