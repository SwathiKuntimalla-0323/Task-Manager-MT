from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import whisper
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration for file uploads
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Load Whisper model
model = whisper.load_model("base")  # You can use "tiny" for faster processing on CPU

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["audio_transcriptions"]
collection = db["transcriptions"]

@app.route("/upload", methods=["POST"])
def upload_audio():
    # Check if the request contains an audio file
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded audio file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Transcribe the audio file using Whisper
    try:
        result = model.transcribe(filepath)
        text = result["text"]
    except Exception as e:
        return jsonify({"error": f"Error in transcription: {str(e)}"}), 500

    # Save transcription and metadata to MongoDB
    audio_metadata = {
        "filename": filename,
        "filepath": filepath,
        "transcription": text,
        "uploaded_at": datetime.utcnow().isoformat()
    }
    collection.insert_one(audio_metadata)

    # Return the transcription to the frontend
    return jsonify({"transcription": text})

@app.route("/transcriptions", methods=["GET"])
def get_transcriptions():
    """
    Fetch all transcriptions from the MongoDB database.
    """
    transcriptions = list(collection.find({}, {"_id": 0}))  # Exclude the MongoDB "_id" field
    return jsonify(transcriptions)

if __name__ == "__main__":
    app.run(debug=True)
