from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import speech_recognition as sr
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"success": False, "message": "No audio file provided"}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"success": False, "message": "Empty filename"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
    audio_file.save(file_path)

    try:
        # Convert to WAV format if necessary
        if file_path.endswith(".mp3"):
            sound = AudioSegment.from_mp3(file_path)
            file_path_wav = file_path.replace(".mp3", ".wav")
            sound.export(file_path_wav, format="wav")
        else:
            file_path_wav = file_path

        # Transcribe audio
        recognizer = sr.Recognizer()
        with sr.AudioFile(file_path_wav) as source:
            audio_data = recognizer.record(source)
            transcription = recognizer.recognize_google(audio_data)

        return jsonify({"success": True, "text": transcription}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        os.remove(file_path)
        if os.path.exists(file_path_wav):
            os.remove(file_path_wav)

if __name__ == "__main__":
    app.run(debug=True)
