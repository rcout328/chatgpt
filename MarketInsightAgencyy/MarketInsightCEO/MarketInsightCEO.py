from agency_swarm.agents import Agent
from .tools.SendMessage import SendMessage


class MarketInsightCEO(Agent):
    def __init__(self):
        super().__init__(
            name="MarketInsightCEO",
            description="This agent oversees the agency's operations, coordinates between agents, and communicates with clients.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[SendMessage],
            tools_folder="./tools",
            temperature=0.3,
            max_prompt_tokens=25000,
        )
        
    def response_validator(self, message):
        """Validate and format responses"""
        if hasattr(message, 'function_call'):
            # Handle function calls
            return {
                'type': 'function',
                'content': message.function_call.arguments,
                'name': message.function_call.name,
                'agent': self.name
            }
        elif hasattr(message, 'content') and message.content:
            # Handle regular messages
            return {
                'type': 'message',
                'content': message.content,
                'agent': self.name
            }
        elif isinstance(message, str):
            # Handle string messages
            return {
                'type': 'message',
                'content': message,
                'agent': self.name
            }
        else:
            # Handle other types of responses
            return {
                'type': 'error',
                'content': 'Invalid response format',
                'agent': self.name
            }