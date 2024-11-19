from pydantic import BaseModel

class PromptSchema(BaseModel):
    system_prompt: str
    content_prompt: str