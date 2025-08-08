from flask import Flask, request, jsonify
import roadmap
import quiz
import generativeResources
from flask_cors import CORS
import json
import os
from datetime import datetime

api = Flask(__name__)
CORS(api)

# Simple file-based user storage for demo purposes
USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

@api.route("/api/auth/register", methods=["POST"])
def register():
    req = request.get_json()
    email = req.get("email")
    password = req.get("password")
    name = req.get("name", "")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    users = load_users()
    
    if email in users:
        return jsonify({"error": "User already exists"}), 400
    
    users[email] = {
        "name": name,
        "password": password,  # In production, hash this!
        "created_at": datetime.now().isoformat(),
        "profile": {
            "learning_hours": 0,
            "courses_completed": 0,
            "achievements": []
        }
    }
    
    save_users(users)
    
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "email": email,
            "name": name
        }
    })

@api.route("/api/auth/login", methods=["POST"])
def login():
    req = request.get_json()
    email = req.get("email")
    password = req.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    users = load_users()
    
    if email not in users or users[email]["password"] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    
    user = users[email]
    return jsonify({
        "message": "Login successful",
        "user": {
            "email": email,
            "name": user["name"],
            "profile": user.get("profile", {})
        }
    })

@api.route("/api/auth/profile", methods=["GET"])
def get_profile():
    # In a real app, you'd validate JWT token here
    email = request.headers.get("user-email")  # Simple demo approach
    
    if not email:
        return jsonify({"error": "Unauthorized"}), 401
    
    users = load_users()
    
    if email not in users:
        return jsonify({"error": "User not found"}), 404
    
    user = users[email]
    return jsonify({
        "email": email,
        "name": user["name"],
        "profile": user.get("profile", {})
    })


@api.route("/api/roadmap", methods=["POST"])
def get_roadmap():
    req = request.get_json()

    response_body = roadmap.create_roadmap(
        topic=req.get("topic", "Machine Learning"),
        time=req.get("time", "4 weeks"),
        knowledge_level=req.get("knowledge_level", "Absoulte Beginner"),
    )

    return response_body


@api.route("/api/quiz", methods=["POST"])
def get_quiz():
    req = request.get_json()

    course = req.get("course")
    topic = req.get("topic")
    subtopic = req.get("subtopic")
    description = req.get("description")

    if not (course and topic and subtopic and description):
        return "Required Fields not provided", 400

    print("getting quiz...")
    response_body = quiz.get_quiz(course, topic, subtopic, description)
    return response_body


@api.route("/api/translate", methods=["POST"])
def get_translations():
    req = request.get_json()

    text = req.get("textArr")
    toLang = req.get("toLang")

    print(f"Translating to {toLang}: { text}")
    # TODO: Fix translate import
    # translated_text = translate.translate_text_arr(text_arr=text, target=toLang)
    return {"error": "Translation service not implemented"}


@api.route("/api/generate-resource", methods=["POST"])
def generative_resource():
    req = request.get_json()
    req_data = {
        "course": False,
        "knowledge_level": False,
        "description": False,
        "time": False,
        "request_type": "basic",  # Default to basic
    }
    for key in req_data.keys():
        req_data[key] = req.get(key, req_data[key])  # Use default if not provided
        
    # Validate required fields (request_type is optional)
    required_fields = ["course", "knowledge_level", "description", "time"]
    for field in required_fields:
        if not req_data[field]:
            return f"Required field '{field}' not provided", 400
            
    print(f"generative resources for {req_data['course']} with type {req_data['request_type']}")
    resources = generativeResources.generate_resources(
        course=req_data['course'],
        knowledge_level=req_data['knowledge_level'],
        description=req_data['description'],
        time=req_data['time'],
        request_type=req_data['request_type']
    )
    return resources


if __name__ == "__main__":
    api.run(debug=True, host="0.0.0.0", port=5000)
