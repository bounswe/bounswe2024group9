from pathlib import Path
import os

class PromptService:
    # PROMPT_FILE_PATH = "prompts"
    BASE_DIR = Path(__file__).resolve().parent.parent
    PROMPT_FILE_PATH = os.path.join(BASE_DIR, 'ai_service/prompts')

    @staticmethod
    def _read_prompt_content(file_path: str) -> str:
        with open(file_path, "r") as file:
            return file.read()

    @classmethod
    def get_question_controlling_prompt(cls, question_json) -> list: 
        content_file_path = f"{cls.PROMPT_FILE_PATH}/question_controlling_content.txt"
        system_file_path = f"{cls.PROMPT_FILE_PATH}/question_controlling_system.txt"
        
        # Reading and formatting content
        content = cls._read_prompt_content(content_file_path).format(question_json=question_json)
        system_message = cls._read_prompt_content(system_file_path)

        messages = [
            ("system", system_message),
            ("human", content),
        ]
        return messages
