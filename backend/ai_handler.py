import openai
from openai.error import RateLimitError, AuthenticationError, APIError

class AIHandler:
    def __init__(self, api_key):
        openai.api_key = api_key
        
        if not api_key:
            raise ValueError("No, OpenAI API Key")
    
    def get_response(self, user_message):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful English conversation partner."},
                    {"role": "user", "content": user_message}
                ]
            )
            return response.choices[0].message['content']
            
        except RateLimitError:
            return "Limit of API"
            
        except AuthenticationError:
            return "fail to get API key"
            
        except APIError:
            return "OpenAI API error, wait a minute"
            
        except Exception as e:
            return f"Error: {str(e)}"
