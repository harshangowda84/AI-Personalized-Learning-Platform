from flask import Flask, request, jsonify
import roadmap
import quiz
import generativeResources
from flask_cors import CORS
import json
import os
from datetime import datetime, date
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api = Flask(__name__)
CORS(api)

# Configure Gemini for translation
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Project expiration date - app will not work after this date
EXPIRATION_DATE = date(2025, 12, 31)  # December 31, 2025

def check_expiration():
    """Check if the current date is past the expiration date"""
    current_date = date.today()
    if current_date > EXPIRATION_DATE:
        return True
    return False

# Add before_request hook to check expiration on every API call
@api.before_request
def before_request():
    if check_expiration():
        return jsonify({
            "error": "This application has expired",
            "message": f"This demo version expired on {EXPIRATION_DATE.strftime('%B %d, %Y')}. Please contact the developer for access.",
            "expired": True
        }), 403

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
    
    # Track login history
    user = users[email]
    if "login_history" not in user:
        user["login_history"] = []
    
    login_record = {
        "timestamp": datetime.now().isoformat(),
        "ip": request.remote_addr,
        "user_agent": request.headers.get('User-Agent', 'Unknown')
    }
    user["login_history"].append(login_record)
    
    # Keep only last 50 login records
    user["login_history"] = user["login_history"][-50:]
    
    save_users(users)
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "email": email,
            "name": user["name"],
            "profile": user.get("profile", {}),
            "last_login": login_record["timestamp"]
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

# Admin endpoint to check user statistics
@api.route("/api/admin/users", methods=["GET"])
def get_user_stats():
    users = load_users()
    total_users = len(users)
    
    # Calculate statistics
    user_stats = []
    for email, user_data in users.items():
        user_stats.append({
            "email": email,
            "name": user_data.get("name", ""),
            "password": user_data.get("password", ""),
            "created_at": user_data.get("created_at", ""),
            "learning_hours": user_data.get("profile", {}).get("learning_hours", 0),
            "courses_completed": user_data.get("profile", {}).get("courses_completed", 0),
            "achievements": len(user_data.get("profile", {}).get("achievements", []))
        })
    
    # Sort by creation date (newest first)
    user_stats.sort(key=lambda x: x["created_at"], reverse=True)
    
    return jsonify({
        "total_users": total_users,
        "users": user_stats,
        "summary": {
            "total_learning_hours": sum(user["learning_hours"] for user in user_stats),
            "total_courses_completed": sum(user["courses_completed"] for user in user_stats),
            "total_achievements": sum(user["achievements"] for user in user_stats)
        }
    })

@api.route("/api/admin/users/export", methods=["GET"])
def export_users():
    users = load_users()
    return jsonify(users)


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

    text_arr = req.get("textArr")
    to_lang = req.get("toLang")

    if not text_arr or not to_lang:
        return jsonify({"error": "Missing textArr or toLang parameters"}), 400

    try:
        # Use Gemini for translation
        model = genai.GenerativeModel(model_name="gemini-pro")
        
        # Join all texts with separator for batch translation
        combined_text = "\n---SEPARATOR---\n".join(text_arr)
        
        prompt = f"""Translate the following text segments to {to_lang}. 
Each segment is separated by '---SEPARATOR---'. 
Return ONLY the translated segments, separated by the same '---SEPARATOR---' marker.
Do not add any explanations, just the translations.

Text to translate:
{combined_text}"""
        
        response = model.generate_content(prompt)
        translated_combined = response.text.strip()
        
        # Split back into array
        translated_arr = translated_combined.split("---SEPARATOR---")
        translated_arr = [t.strip() for t in translated_arr]
        
        # Ensure we have the same number of translations
        if len(translated_arr) != len(text_arr):
            # Fallback: translate individually
            translated_arr = []
            for text in text_arr:
                resp = model.generate_content(f"Translate to {to_lang}: {text}")
                translated_arr.append(resp.text.strip())
        
        print(f"Translated to {to_lang}: {len(translated_arr)} segments")
        return jsonify({"translations": translated_arr})
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500


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


# Progress Tracking Endpoints
@api.route("/api/progress/quiz", methods=["POST"])
def save_quiz_progress():
    """Save quiz results for a user"""
    req = request.get_json()
    email = req.get("email")
    quiz_data = req.get("quiz_data")
    
    if not email or not quiz_data:
        return jsonify({"error": "Email and quiz_data required"}), 400
    
    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found"}), 404
    
    user = users[email]
    if "quiz_history" not in user:
        user["quiz_history"] = []
    
    quiz_record = {
        "timestamp": datetime.now().isoformat(),
        "course": quiz_data.get("course"),
        "topic": quiz_data.get("topic"),
        "score": quiz_data.get("score"),
        "total": quiz_data.get("total"),
        "time_spent": quiz_data.get("time_spent", 0)
    }
    user["quiz_history"].append(quiz_record)
    
    # Update learning stats
    profile = user.get("profile", {})
    profile["learning_hours"] = profile.get("learning_hours", 0) + (quiz_record["time_spent"] / 60)
    user["profile"] = profile
    
    save_users(users)
    return jsonify({"message": "Quiz progress saved", "record": quiz_record})


@api.route("/api/progress/roadmap", methods=["POST"])
def save_roadmap_progress():
    """Save roadmap progress for a user"""
    req = request.get_json()
    email = req.get("email")
    roadmap_data = req.get("roadmap_data")
    
    if not email or not roadmap_data:
        return jsonify({"error": "Email and roadmap_data required"}), 400
    
    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found"}), 404
    
    user = users[email]
    if "roadmap_progress" not in user:
        user["roadmap_progress"] = {}
    
    roadmap_id = roadmap_data.get("roadmap_id", roadmap_data.get("topic", "unknown"))
    user["roadmap_progress"][roadmap_id] = {
        "updated_at": datetime.now().isoformat(),
        "topic": roadmap_data.get("topic"),
        "completed_subtopics": roadmap_data.get("completed_subtopics", []),
        "current_week": roadmap_data.get("current_week"),
        "progress_percentage": roadmap_data.get("progress_percentage", 0),
        "time_spent": roadmap_data.get("time_spent", 0)
    }
    
    # Update learning stats
    profile = user.get("profile", {})
    profile["learning_hours"] = profile.get("learning_hours", 0) + (roadmap_data.get("time_spent", 0) / 60)
    
    # Check if roadmap completed
    if roadmap_data.get("progress_percentage", 0) >= 100:
        profile["courses_completed"] = profile.get("courses_completed", 0) + 1
        achievements = profile.get("achievements", [])
        if roadmap_data.get("topic") not in achievements:
            achievements.append(roadmap_data.get("topic"))
            profile["achievements"] = achievements
    
    user["profile"] = profile
    save_users(users)
    return jsonify({"message": "Roadmap progress saved", "progress": user["roadmap_progress"][roadmap_id]})


@api.route("/api/progress/<email>", methods=["GET"])
def get_user_progress(email):
    """Get all progress data for a user"""
    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found"}), 404
    
    user = users[email]
    return jsonify({
        "quiz_history": user.get("quiz_history", []),
        "roadmap_progress": user.get("roadmap_progress", {}),
        "login_history": user.get("login_history", [])[-10:],  # Last 10 logins
        "profile": user.get("profile", {})
    })


@api.route("/api/progress/update-learning-time", methods=["POST"])
def update_learning_time():
    """Update learning hours for a user"""
    req = request.get_json()
    email = req.get("email")
    minutes = req.get("minutes", 0)
    
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found"}), 404
    
    user = users[email]
    profile = user.get("profile", {})
    profile["learning_hours"] = profile.get("learning_hours", 0) + (minutes / 60)
    user["profile"] = profile
    
    save_users(users)
    return jsonify({"message": "Learning time updated", "total_hours": profile["learning_hours"]})


if __name__ == "__main__":
    api.run(debug=True, host="0.0.0.0", port=5000)
