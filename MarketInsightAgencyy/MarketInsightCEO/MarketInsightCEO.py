from agency_swarm import Agent
from agency_swarm.tools import CodeInterpreter, FileSearch
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv
from pathlib import Path

# Get the current directory and load the .env file from there
current_dir = Path(__file__).parent.parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Initialize OpenAI client
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

    async def process_message(self, message, context=None):
        """Process incoming messages and generate responses"""
        try:
            # If this is a chat message with context
            if context and isinstance(context, dict):
                analysis_type = context.get('analysisType')
                current_analysis = context.get('currentAnalysis')
                business_input = context.get('businessInput')
                chat_history = context.get('chatHistory', [])

                # Construct a prompt that includes the context
                prompt = f"""As the Market Insight CEO, I am reviewing the {analysis_type} analysis for this business: {business_input}

Analysis Results:
{current_analysis}

Chat History:
{self._format_chat_history(chat_history)}

User Question: {message}

Please provide a detailed response addressing the user's question in the context of the analysis results."""

                # Process the message with the full context
                response = await self._process_with_context(prompt)
                return {
                    'type': 'success',
                    'content': response,
                    'agent': self.name,
                    'analysisType': 'chat'
                }

            # For regular analysis requests
            else:
                # Process the message normally
                response = await super().process_message(message)
                return {
                    'type': 'success',
                    'content': response,
                    'agent': self.name
                }

        except Exception as e:
            print(f"Error in process_message: {str(e)}")
            return {
                'type': 'error',
                'content': f"Error processing message: {str(e)}",
                'agent': self.name
            }

    def _format_chat_history(self, chat_history):
        """Format chat history for context"""
        if not chat_history:
            return "No previous messages"
        
        formatted_history = []
        for msg in chat_history:
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            formatted_history.append(f"{role.capitalize()}: {content}")
        
        return "\n".join(formatted_history)

    async def _process_with_context(self, prompt):
        """Process a message with full context using the agency's capabilities"""
        try:
            # Use the agent's built-in processing capabilities
            response = await super().process_message(prompt)
            return response
        except Exception as e:
            print(f"Error in _process_with_context: {str(e)}")
            raise

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