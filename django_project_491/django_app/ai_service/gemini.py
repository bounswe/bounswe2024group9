import random
import google.generativeai as genai

from .configs import GeminiConfigs
import json
from abc import ABC

genai.configure(api_key=GeminiConfigs.API_KEY)

class GeminiService(ABC):
    def __init__(self) -> None:
        self.api_key = GeminiConfigs.API_KEY
        self.model = genai.GenerativeModel(
            model_name="gemini-1.0-pro",
            generation_config=GeminiConfigs.GENERATION_CONFIG,
            safety_settings=GeminiConfigs.SAFETY_SETTINGS,
        )

    def refresh_api_key(self) -> None:
        self.api_key = random.choice(GeminiConfigs.API_KEY_POOL)

    def response_as_json(self, response: str) -> dict:
        clean_response = response.replace("`", "").replace("json", "").replace("JSON", "")
        return json.loads(clean_response)

    def ask(self, prompt: list[str]) -> dict:
        formatted_prompt = [f"{role}: {content}" for role, content in prompt]
        response = self.model.generate_content(formatted_prompt)  
        return self.response_as_json(response.text)

