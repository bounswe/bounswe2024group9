from langchain_core.prompts import ChatPromptTemplate
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
    def get_question_controlling_prompt(cls, question_json) -> ChatPromptTemplate: 
        content_file_path = f"{cls.PROMPT_FILE_PATH}/question_controlling_content.txt"
        system_file_path = f"{cls.PROMPT_FILE_PATH}/question_controlling_system.txt"
        
        messages = [
            ("system", cls._read_prompt_content(system_file_path)),
            ("human", cls._read_prompt_content(content_file_path)),
        ]
        chat_template = ChatPromptTemplate.from_messages(messages)
        print(type(chat_template.format_messages(question_json=question_json)))
        return chat_template.format_messages(question_json=question_json)

