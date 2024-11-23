import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def analyze_sentiment(text):
    """
    Analyzes the sentiment of given text using OpenAI's API.
    Returns a dictionary with sentiment score and analysis.
    """
    try:
        response = client.chat.completions.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4-1106-preview'),
            messages=[
                {"role": "system", "content": "You are a sentiment analysis expert. Analyze the following text and provide a sentiment score between -1 (most negative) and 1 (most positive), along with a brief explanation."},
                {"role": "user", "content": text}
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        return {
            'analysis': response.choices[0].message.content,
            'status': 'success'
        }
    except Exception as e:
        return {
            'analysis': f"Error in sentiment analysis: {str(e)}",
            'status': 'error'
        }