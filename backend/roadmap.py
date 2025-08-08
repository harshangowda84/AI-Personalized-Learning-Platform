import os
import google.generativeai as genai
import json
import re
from dotenv import load_dotenv


load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])


def is_valid_topic(topic):
    """
    Basic validation to check if the input seems like a valid learning topic
    """
    if not topic or len(topic.strip()) < 2:
        return False
    
    # Clean the topic
    cleaned_topic = topic.strip()
    
    # Check if topic is mostly letters and spaces (allow some punctuation)
    alpha_ratio = len(re.findall(r'[a-zA-Z\s]', cleaned_topic)) / len(cleaned_topic)
    if alpha_ratio < 0.6:  # Relaxed from 0.5 to 0.6, but more permissive
        return False
        
    # Check for minimum meaningful content - at least one letter
    if not re.search(r'[a-zA-Z]', cleaned_topic):
        return False
        
    # Check if it's just repeated characters (like "aaa" or "111")
    unique_chars = set(cleaned_topic.lower().replace(' ', ''))
    if len(unique_chars) < 2:  # Relaxed from 3 to 2
        return False
    
    # Check for completely random strings (mostly consonants or no vowels)
    has_vowel = bool(re.search(r'[aeiouAEIOU]', cleaned_topic))
    if len(cleaned_topic) > 5 and not has_vowel:
        return False
        
    return True


def create_roadmap(topic, time, knowledge_level):
    # Debug: Print the topic being validated
    print(f"Validating topic: '{topic}'")
    
    # Validate input topic
    if not is_valid_topic(topic):
        print(f"Topic validation failed for: '{topic}'")
        return {
            "error": "Please enter a valid learning topic. For example: 'Python Programming', 'Data Science', 'Machine Learning', etc."
        }
    
    print(f"Topic validation passed for: '{topic}'")
    
    # Create the model
    # See https://ai.google.dev/api/python/google/generativeai/GenerativeModel
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE",
        },
    ]

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        safety_settings=safety_settings,
        generation_config=generation_config,
        system_instruction='You are an AI agent who provides good personalized learning paths based on user input. You have to provide subtopics to learn with a small description of the subtopic telling what exactly to learn and how much time each subtopic will take. Give more time to subtopics that require more understanding. One more important thing, make sure to keep every key lowercase \nExample output:\n{\n  "week 1": {\n    "topic":"Introduction to Python",\n    "subtopics":[\n      {\n        "subtopic":"Getting Started with Python",\n        "time":"10 minute",\n        "description":"Learn Hello world in python"\n      },\n      {\n        "subtopic":"Data types in Python",\n        "time":"1 hour",\n        "description":"Learn about int, string, boolean, array, dict and casting data types"\n      },\n     {\n        "subtopic":"Conditionals in Python",\n        "time":"30 minutes",\n        "description":"Learn about comparison operators, if elif else statements"\n      },\n      {\n        "subtopic":"Loops",\n        "time":"30 minutes",\n        "description":"Learn about for loop, while loop, continue and break"\n      },\n      {\n        "subtopic":"OOPs in Python",\n        "time":"4 hours",\n        "description":"Learn about classes, objects, inheritance, polymorphism and OOPs concepts"\n      },\n    ]\n  }\n}\n Make sure to keep every key lowercase like subtopics, topic, time, etc.',
    )

    chat_session = model.start_chat(history=[])

    response = chat_session.send_message(
        f"Suggest a roadmap for learning {topic} in {time}. My Knowledge level is {knowledge_level}. I can spend total of 16 hours every week.",
        stream=False,
    )
    print(response.text)
    return json.loads(response.text)
