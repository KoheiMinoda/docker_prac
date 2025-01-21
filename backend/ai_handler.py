import openai
from openai.error import RateLimitError, AuthenticationError, APIError

class AIHandler:
    def __init__(self, api_key):
        openai.api_key = api_key
        
        if not api_key:
            raise ValueError("OpenAI API キーが設定されていません。")
    
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
            return "申し訳ありません。API利用制限に達しました。しばらく待ってから再度お試しください。"
            
        except AuthenticationError:
            return "APIキーの認証に失敗しました。有効なAPIキーを設定してください。"
            
        except APIError:
            return "OpenAI APIでエラーが発生しました。しばらく待ってから再度お試しください。"
            
        except Exception as e:
            return f"エラーが発生しました: {str(e)}"