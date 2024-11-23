from agency_swarm import Agent
from agency_swarm.tools import CodeInterpreter, FileSearch
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
from pathlib import Path

# Get the current directory and load the .env file from there
current_dir = Path(__file__).parent.parent  # Go up one level to reach the project root
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Initialize AsyncOpenAI client with API key from environment
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables. Please check your .env file.")

client = AsyncOpenAI(api_key=api_key)

class MarketInsightCEO(Agent):
    def __init__(self):
        super().__init__(
            name="MarketInsightCEO",
            description="Strategic planning and market insight coordination",
            instructions="./MarketInsightCEO/instructions.md",
            tools=[CodeInterpreter, FileSearch],
            temperature=float(os.getenv('TEMPERATURE', 0.3)),
            max_prompt_tokens=int(os.getenv('MAX_TOKENS', 4000))
        )
        
    async def process_message(self, message):
        """Process incoming messages and generate responses"""
        try:
            # Create a chat completion using the new OpenAI API format
            response = await client.chat.completions.create(
                model=os.getenv('OPENAI_MODEL', "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": self.instructions},
                    {"role": "user", "content": message}
                ],
                temperature=self.temperature,
                max_tokens=self.max_prompt_tokens
            )

            # Extract and return the response content
            if response.choices and response.choices[0].message:
                return response.choices[0].message.content
            else:
                return "I apologize, but I couldn't generate a response."

        except Exception as e:
            return f"Error processing message: {str(e)}"

    def response_validator(self, response):
        """Validate and format the response"""
        if isinstance(response, str):
            return {
                'type': 'message',
                'content': response,
                'agent': self.name
            }
        return response