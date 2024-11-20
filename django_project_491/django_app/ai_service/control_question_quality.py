from .prompt import PromptService


class QuestionQualityController():
    
    def __init__(self, llm_service):
        self.llm_service = llm_service
        
    def is_valid_question(self, question_json) -> bool:
        try:
            question_control_prompt = PromptService.get_question_controlling_prompt(question_json=question_json)
            response = self.llm_service.ask(question_control_prompt)
            is_valid_response = response.get('valid_response')
            if is_valid_response is None:
                raise KeyError('valid_response not found in response')
            return is_valid_response
        except Exception as e:
            self.llm_service.refresh_api_key()
            response = self.llm_service.ask(question_control_prompt)
            is_valid_response = response.get('valid_response')
            if is_valid_response is None:
                raise KeyError('valid_response not found in response')
            return is_valid_response
        except Exception as e:
            return True # if there is an error, we will return True to indicate that the question is valid and can be posted to prevent misjudgements.