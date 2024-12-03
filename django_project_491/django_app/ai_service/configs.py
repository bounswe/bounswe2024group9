import os
import random


class GeminiConfigs:
    try:
        GEMINI_AI_KEY_POOL = os.environ.get("GEMINI_AI_KEY_POOL").split(",")
    except:
        raise Exception("GEMINI_AI_KEY_POOL environment variable is not set")
    API_KEY = random.choice(GEMINI_AI_KEY_POOL)
    
    GENERATION_CONFIG = {
        "temperature": 0.9,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048,
    }
    SAFETY_SETTINGS = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE"
        }
    ]