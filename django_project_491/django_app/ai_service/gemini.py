import random
import google.generativeai as genai

from configs import GeminiConfigs
from schemas import PromptSchema
from prompt import PromptService
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

    def response_as_json(self, response: str) -> dict:
        clean_response = response.replace("`", "").replace("json", "").replace("JSON", "")
        return json.loads(clean_response)

    def generate_content(self, prompt: PromptSchema) -> dict:
        prompts_as_text = [msg.content for msg in prompt] 
        response = self.model.generate_content(prompts_as_text)  
        print(response.text)
        return self.response_as_json(response.text)

