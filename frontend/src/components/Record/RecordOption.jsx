import React, { useRef, useState } from "react";
import axios from "axios";
import "../Record/recordoption.css";

const RecordOption = () => {
  const [uploadStatus, setUploadStatus] = useState("");
  const mediaRecorderRef = useRef(null);
  const [isRecording,setIsRecording] = useState(false)
  const recordedChunksRef = useRef(null)
  const startRecording = async () => {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Stream:", stream); 
      mediaRecorderRef.current = new MediaRecorder(stream);

    
      recordedChunksRef.current = [];

    
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log("Data available:", event.data); 
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data); 
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("Recording stopped");
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        console.log("Audio Blob:", audioBlob);
        console.log("Recorded Chunks:", recordedChunksRef.current);
        setIsRecording(false);

        uploadAudio(audioBlob);
      };

      // Start the recording
      mediaRecorderRef.current.start();
      console.log("Recording started...");
      setIsRecording(true);

    } catch (err) {
      console.error("Error starting the recording:", err);
      alert("Could not start the recording. Please check your microphone.");
    }
  };

  // Stop recording
  const stopRecording = () => {

    mediaRecorderRef.current.stop();
  };



const uploadAudio = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "recording.wav");
  
    try {
      const response = await axios.post("http://localhost:5000/upload-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.success) {
        setUploadStatus(`content: ${response.data.message}`);
        console.log(`content: ${response.data.message}`);
      } else {
        setUploadStatus("Audio upload failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setUploadStatus("An error occurred while uploading the audio.");
    }
  };
  

  return (
    <div className="record-option">
      <h2>Record and Upload Audio</h2>
      <div className="record-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="record-btn">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-btn">
            Stop Recording
          </button>
        )}
      </div>
      {uploadStatus && (
        <div className="upload-status">
          <p>{uploadStatus}</p>
        </div>
      )}
    </div>
  );
};

export default RecordOption;
