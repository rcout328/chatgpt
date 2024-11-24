from agency_swarm import Agent
from agency_swarm.tools import CodeInterpreter, FileSearch
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
from pathlib import Path
from groq import Groq

# Get the current directory and load the .env file from there
current_dir = Path(__file__).parent.parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Initialize clients
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

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
            # Create the messages array
            messages = [{"role": "user", "content": message}]
            
            # Make the API call synchronously (Groq's Python client doesn't support async yet)
            response = groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.1-70b-versatile",
                temperature=self.temperature,
                max_tokens=self.max_promptsolve this _tokens,
                stream=False
            )

            # Extract the response content
            if response and response.choices and len(response.choices) > 0:
                return {
                    'type': 'success',
                    'content': response.choices[0].message.content,
                    'agent': self.name
                }
            else:
                return {
                    'type': 'error',
                    'content': 'No response generated',
                    'agent': self.name
                }

        except Exception as e:
            print(f"Error in process_message: {str(e)}")
            return {
                'type': 'error',
                'content': f"Error processing message: {str(e)}",
                'agent': self.name
            }

    async def handle_tool_error(self, error):
        """Handle any tool execution errors"""
        print(f"Tool execution error: {str(error)}")
        return {
            'type': 'error',
            'content': f"Tool execution failed: {str(error)}",
            'agent': self.name
        }

    async def handle_invalid_request(self, error):
        """Handle invalid request errors"""
        print(f"Invalid request: {str(error)}")
        return {
            'type': 'error',
            'content': f"Invalid request: {str(error)}",
            'agent': self.name
        }

if __name__ == "__main__":
    # Test the agent
    import asyncio
    
    async def test():
        agent = MarketInsightCEO()
        test_message = "Analyze the market trends for a new mobile app startup"
        response = await agent.process_message(test_message)
        print(response)

    asyncio.run(test())