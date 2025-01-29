import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Transcript/transcript.css";

const Transcriptions = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transcriptions from the backend
  const fetchTranscriptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/transcriptions");
      if (response.data.success) {
        setTranscriptions(response.data.transcriptions);
      } else {
        setError("Failed to fetch transcriptions.");
      }
    } catch (err) {
      setError("An error occurred while fetching transcriptions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  return (
    <div className="transcriptions-container">
      <h2>Audio Transcriptions</h2>
      {loading && <p>Loading transcriptions...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <div className="transcriptions-list">
          {transcriptions.length > 0 ? (
            transcriptions.map((item) => (
              <div key={item._id} className="transcription-item">
                <h3>{item.filename}</h3>
                <p><strong>Transcription:</strong> {item.transcription}</p>
                <p><strong>Transcribed At:</strong> {new Date(item.transcribed_at).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p>No transcriptions available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Transcriptions;
