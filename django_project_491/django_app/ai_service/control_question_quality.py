import traceback

from prompt import PromptService


class QuestionQualityController():
    
    def __init__(self, llm_service):
        self.llm_service = llm_service
        
    def generate(self, question_json) -> str:
        try:
            question_control_prompt = PromptService.get_question_controlling_prompt(question_json=question_json)
            response = self.llm_service.generate_content(question_control_prompt)
            return response.get('valid_response') 
        except Exception as e:
            return True # if there is an error, we will return True to indicate that the question is valid and can be posted to prevent misjudgements.