"""
Install the Google AI Python SDK

$ pip install google-generativeai

See the getting started guide for more information:
https://ai.google.dev/gemini-api/docs/get-started/python
"""

import os

import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])


def generate_resources(course, knowledge_level, description, time, request_type="basic"):
    # Create the model
    # See https://ai.google.dev/api/python/google/generativeai/GenerativeModel
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    if request_type == "structured_learning":
        system_instruction = """You are an AI tutor creating structured, interactive learning content. 
        Create comprehensive, chapter-based learning materials that include:
        - Clear learning objectives for each section
        - Step-by-step explanations with examples
        - Practical exercises and applications
        - Key takeaways and summaries
        - Progressive difficulty levels
        
        Format your response with clear markdown headers (# ## ###) to create distinct chapters.
        Make the content engaging, practical, and suitable for the given time duration.
        Include real-world examples and hands-on activities where possible."""
    else:
        system_instruction = "You are an AI tutor. Maintain a modest and calm language suitable for learning. You need to provide content to user to learn in given time."

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=generation_config,
        # safety_settings = Adjust safety settings
        # See https://ai.google.dev/gemini-api/docs/safety-settings
        system_instruction=system_instruction,
    )

    chat_session = model.start_chat(history=[])

    if request_type == "structured_learning":
        # Enhanced prompt for structured learning
        time_in_minutes = 30  # Default
        try:
            if 'hour' in time.lower():
                time_in_minutes = int(float(time.split()[0]) * 60)
            elif 'min' in time.lower():
                time_in_minutes = int(float(time.split()[0]))
            else:
                time_in_minutes = 30
        except:
            time_in_minutes = 30
            
        prompt = f"""Create a comprehensive, structured learning path for "{description}" in the context of {course}.
        
        Student Details:
        - Knowledge Level: {knowledge_level}
        - Available Time: {time} (approximately {time_in_minutes} minutes)
        - Learning Goal: {description}
        
        Please structure your response as follows:
        
        # Introduction to [Topic]
        - Learning objectives
        - Why this topic is important
        - What students will achieve
        
        # Core Concepts and Theory
        - Fundamental principles
        - Key terminology and definitions
        - Theoretical foundations with examples
        
        # Practical Applications and Examples
        - Real-world use cases
        - Step-by-step examples
        - Hands-on exercises students can try
        
        # Advanced Concepts (if time allows)
        - More complex aspects
        - Integration with other topics
        - Best practices and common pitfalls
        
        # Summary and Next Steps
        - Key takeaways
        - Review questions
        - Recommended next learning topics
        - Additional resources for deeper study
        
        Make each section substantial with detailed explanations, examples, and practical activities.
        Ensure the content is appropriate for a {knowledge_level} level learner and can be completed in approximately {time}.
        Use markdown formatting for better readability."""
    else:
        prompt = f"I am learning {course}. My knowledge level in this topic is {knowledge_level}. i want to {description}. I want to learn it in {time}. Teach me."

    response = chat_session.send_message(prompt, stream=False)

    print(response.text)
    return response.text
