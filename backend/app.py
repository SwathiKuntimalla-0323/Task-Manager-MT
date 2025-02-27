
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from pydub import AudioSegment
from bson import ObjectId 
from datetime import datetime
import uuid
import speech_recognition as sr
from pydub import AudioSegment
from flask_socketio import SocketIO, send, emit, join_room, leave_room
import eventlet
import eventlet.wsgi
from eventlet import websocket
import ssl

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Get absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CERT_PATH = os.path.join(BASE_DIR, "../cert.pem")
KEY_PATH = os.path.join(BASE_DIR, "../key.pem")

app.config["JWT_SECRET_KEY"] = "swathi"  # Secret key for JWT
jwt = JWTManager(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")  
db = client["task_manager_db"]
users_collection = db["users"]
tasks_collection = db["tasks"]
audio_collection = db["audio_files"]
messages_collection = db["messages"]


socketio = SocketIO(app, cors_allowed_origins="*")
# print(transcriptions_collection)
r = sr.Recognizer()

 


# Create folder for uploads if it doesn't exist
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------------------- User Routes ----------------------------



def record_text(audiofile):

       
    with sr.AudioFile(audiofile) as source:
        audio = r.record(source)  
        text = r.recognize_google(audio)
    try:
        print("Sphinx thinks you said " + text)
    except sr.UnknownValueError:
        print("Sphinx could not understand audio")
    except sr.RequestError as e:
        print("Sphinx error; {0}".format(e))
    return text


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    role = data.get("role")

    if not email or not password or not name:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email is already registered"}), 409

    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
    "email": email, 
    "password": hashed_password, 
    "name": name,
    "role":role
    })
    return jsonify({"success": True, "message": "User registered successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

  
    access_token = create_access_token(identity={"email": email, "name": user["name"], "role": user["role"]})
    return jsonify({
        "success": True, 
        "token": access_token,
        "role": user["role"],
        "email" : email,
         "userId": str(user["_id"])
    }), 200

@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    title = data.get("title")
    deadline = data.get("deadline")
    priority = data.get("priority")
    description = data.get("description")
    assigned_to = data.get("user_id")

    if not title or not deadline or not priority:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    task = {
        "title": title,
        "deadline": deadline,
        "priority": priority,
        "status": "Pending",
        "description" : description,
        "assigned_to": assigned_to
    }
    print("task",task)

    result = tasks_collection.insert_one(task)
    print("result",result)
    return jsonify({"success": True, "message": "Task created successfully", "task_id": str(result.inserted_id)}), 201

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """
    Fetch tasks assigned to the current user. Admins see all tasks.
    """
    user_id = request.args.get("user_id")  # Current user's ID
    role = request.args.get("role")       # Current user's role

    try:
        if role == "admin":
            # Admins can see all tasks
            tasks = list(tasks_collection.find({}, {
                "_id": 1,
                "title": 1,
                "deadline": 1,
                "priority": 1,
                "status": 1,
                "description": 1,
                "assigned_to": 1,
            }))
        else:
            # Regular users see only their assigned tasks
            tasks = list(tasks_collection.find(
                {"assigned_to": user_id},  # Match assigned_to with user's ID
                {
                    "_id": 1,
                    "title": 1,
                    "deadline": 1,
                    "priority": 1,
                    "status": 1,
                    "description": 1,
                }
            ))
        print("Query Parameters:", user_id, role)
        print("Tasks Found:", tasks)

        # Convert ObjectId to string for JSON serialization
        for task in tasks:
            task["_id"] = str(task["_id"])
            task["assigned_to"] = str(task.get("assigned_to", ""))  # Convert assigned_to if present
        print("Query Parameters:", user_id, role)
        print("Tasks Found:", tasks)

        return jsonify({"success": True, "tasks": tasks}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500




@app.route("/api/tasks/<task_id>/status", methods=["PUT"])
def update_task_status(task_id):
    data = request.get_json()
    new_status = data.get("status")

    if not new_status or new_status not in ["Pending", "Completed"]:
        return jsonify({"success": False, "message": "Invalid status"}), 400

    try:
        result = tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": new_status}})
        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Task not found"}), 404

        return jsonify({"success": True, "message": "Task status updated successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500





@app.route("/api/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Task not found"}), 404

        return jsonify({"success": True, "message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



@app.route("/api/tasks/<task_id>", methods=["PUT"])
def edit_task(task_id):
    data = request.get_json()
    title = data.get("title")
    deadline = data.get("deadline")
    priority = data.get("priority")

    if not title or not deadline or not priority:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    result = tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"title": title, "deadline": deadline, "priority": priority}}
    )

    if result.matched_count == 0:
        return jsonify({"success": False, "message": "Task not found"}), 404

    return jsonify({"success": True, "message": "Task updated successfully"}), 200


@app.route("/api/users", methods=["GET"])
def get_users():
    try:
        users = list(users_collection.find({}, {"_id": 1, "name": 1}))  # Fetch users with only `_id` and `name`
        
        # Convert ObjectId to string for JSON response
        for user in users:
            user["_id"] = str(user["_id"])
        
        return jsonify({"success": True, "users": users}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



# # Audio related 
# UPLOAD_FOLDER = "./uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    try:
        if "audio" not in request.files:
            return jsonify({"success": False, "message": "No audio file provided"}), 400

        audio_file = request.files["audio"]
        if audio_file.filename == "":
            return jsonify({"success": False, "message": "Empty filename"}), 400

        unique_id = uuid.uuid4().hex
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"audio_{timestamp}_{unique_id}.wav"
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

        # Save the uploaded file
        audio_file.save(file_path)

        # Process the audio to ensure proper format
        audio = AudioSegment.from_file(file_path)
        audio = audio.set_frame_rate(44100).set_channels(2)
        audio.export(file_path, format="wav")

        # Generate transcription from the audio file
        transcription = record_text(file_path)

        
        audio_entry = {
            "filename": filename,
            "file_path": file_path,
            "uploaded_at": datetime.utcnow(),
            "transcription": transcription
        }
        result = audio_collection.insert_one(audio_entry)
        print(f"[DEBUG] Audio entry saved with ID: {result.inserted_id}")

        return jsonify({"success": True, "message": transcription}), 201
    except Exception as e:
        print(f"[ERROR] Error processing audio: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

def get_suggestions():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    # Call Datamuse API to get suggestions
    try:
        response = requests.get(f'https://api.datamuse.com/words?sp={query}*')
        if response.status_code == 200:
            suggestions = response.json()
            words = [item['word'] for item in suggestions]
            return jsonify({"suggestions": words})
        else:
            return jsonify({"error": "Failed to fetch suggestions"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@socketio.on("connect")
def handle_connect():
    print("A user connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("A user disconnected")

@socketio.on("private_message")
def handle_private_message(data):
    print(f"[DEBUG] Received message data: {data}")

    if not isinstance(data, dict):
        print("Error: Data received is not a dictionary")
        return

    if "sender_id" not in data or "receiver_id" not in data or "message" not in data:
        print("Error: Missing sender_id, receiver_id, or message in data")
        return

    sender_id = data["sender_id"]
    receiver_id = data["receiver_id"]
    message = data["message"]

    # Store message in MongoDB
    message_entry = {
        "sender_id": sender_id,
        "receiver_id": receiver_id,
        "message": message,
        "timestamp": datetime.utcnow()
    }
    result = messages_collection.insert_one(message_entry)

    # Convert MongoDB _id to string before emitting
    message_entry["_id"] = str(result.inserted_id)
    message_entry["timestamp"] = message_entry["timestamp"].isoformat()  # Convert datetime to string

    # Emit message to sender and receiver
    emit("new_message", message_entry, room=sender_id)
    emit("new_message", message_entry, room=receiver_id)

 



@socketio.on("join_chat")
def handle_join_chat(data):
    print(f"[DEBUG] join_chat event received: {data}")  

    if not isinstance(data, dict) or "user_id" not in data:
        print("[ERROR] Invalid join_chat data received")
        return

    user_id = str(data["user_id"])  # Convert to string to avoid issues
    join_room(user_id)  
    print(f"User {user_id} joined chat room successfully")


@app.route("/api/messages", methods=["GET"])
def get_messages():
    user_id = request.args.get("user_id")
    contact_id = request.args.get("contact_id")

    if not user_id or not contact_id:
        return jsonify({"success": False, "message": "Missing parameters"}), 400

    # Fetch messages for both sender and receiver
    messages = list(messages_collection.find({
        "$or": [
            {"sender_id": user_id, "receiver_id": contact_id},
            {"sender_id": contact_id, "receiver_id": user_id}
        ]
    }).sort("timestamp", 1))

    # Convert MongoDB ObjectId and timestamps to JSON serializable format
    for msg in messages:
        msg["_id"] = str(msg["_id"])  # Convert ObjectId to string
        if isinstance(msg["timestamp"], datetime):
            msg["timestamp"] = msg["timestamp"].isoformat()  # Convert datetime to string

    return jsonify({"success": True, "messages": messages}), 200




# if __name__ == "__main__":
#     app.run(debug=False,host="0.0.0.0", port=5001,ssl_context=('../cert.pem', '../key.pem'))

# if __name__ == "__main__":
#     socketio.run(app, debug=True, host="0.0.0.0", port=5001, allow_unsafe_werkzeug=True)

if __name__ == "__main__":
    eventlet.wsgi.server(
        eventlet.wrap_ssl(
            eventlet.listen(("0.0.0.0", 5001)),
            certfile="../cert.pem",
            keyfile="../key.pem",
            server_side=True,
            ssl_version=ssl.PROTOCOL_TLSv1_2
        ),
        app
    )

