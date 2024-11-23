from agency_swarm import Agency, set_openai_key
from MarketInsightCEO.MarketInsightCEO import MarketInsightCEO
from CompetitorTrackingAgent.CompetitorTrackingAgent import CompetitorTrackingAgent
from SentimentAnalysisAgent.SentimentAnalysisAgent import SentimentAnalysisAgent
from ICPGeneratorAgent.ICPGeneratorAgent import ICPGeneratorAgent
from FeedbackCollectorAgent.FeedbackCollectorAgent import FeedbackCollectorAgent
from MarketAnalysisAgent.MarketAnalysisAgent import MarketAnalysisAgent
from ReportingAgent.ReportingAgent import ReportingAgent
from dotenv import load_dotenv
import os
from pathlib import Path
import time
from typing import Dict, Generator

# Define the MarketInsightAgency class
class MarketInsightAgency(Agency):
    def __init__(self, agents, shared_instructions=None, temperature=None, max_prompt_tokens=None):
        super().__init__(
            agents,
            shared_instructions=shared_instructions,
            temperature=temperature,
            max_prompt_tokens=max_prompt_tokens
        )
        self.conversation_thread = []

    def format_message(self, message_obj):
        """Format message for display"""
        if not message_obj:
            return None

        timestamp = time.time()

        # Handle function calls
        if hasattr(message_obj, 'function_call'):
            return {
                'type': 'function',
                'agent': message_obj.sender_name if hasattr(message_obj, 'sender_name') else 'System',
                'content': message_obj.function_call.arguments,
                'function_name': message_obj.function_call.name,
                'timestamp': timestamp
            }
        
        # Handle validated responses from agents
        elif isinstance(message_obj, dict) and 'type' in message_obj:
            message_obj['timestamp'] = timestamp
            return message_obj
        
        # Handle string messages
        elif isinstance(message_obj, str):
            return {
                'type': 'message',
                'agent': 'System',
                'content': message_obj,
                'timestamp': timestamp
            }
        
        # Handle other message objects
        elif hasattr(message_obj, 'content'):
            return {
                'type': 'message',
                'agent': message_obj.sender_name if hasattr(message_obj, 'sender_name') else 'System',
                'content': message_obj.content,
                'timestamp': timestamp
            }
        
        # Handle unknown formats
        return {
            'type': 'error',
            'agent': 'System',
            'content': 'Invalid message format',
            'timestamp': timestamp
        }

    def get_agent_by_name(self, agent_name: str):
        """Get agent instance by name"""
        for agent in self.agents:
            if agent.name == agent_name:
                return agent
        return None

    def chat(self, message: str, agent: str = None) -> Generator[Dict, None, None]:
        """Process chat messages and yield responses one by one"""
        try:
            # Add user message to conversation
            yield {
                'type': 'message',
                'agent': 'User',
                'content': message,
                'timestamp': time.time()
            }

            # Route message to specific agent if specified
            if agent:
                agent_obj = self.get_agent_by_name(agent)
                if agent_obj:
                    # Create a single-agent agency for direct communication
                    single_agent_agency = Agency(
                        [agent_obj],
                        shared_instructions='./agency_manifesto.md'
                    )
                    
                    # Get response using the agency interface
                    for response in single_agent_agency.get_completion(message, yield_messages=True):
                        if response:
                            formatted_response = self.format_message(response)
                            if formatted_response:
                                self.conversation_thread.append(formatted_response)
                                yield formatted_response
                                # Only add delay after regular messages, not functions
                                if formatted_response.get('type') == 'message':
                                    time.sleep(0.5)
                else:
                    yield {
                        'type': 'error',
                        'agent': 'System',
                        'content': f"Agent '{agent}' not found",
                        'timestamp': time.time()
                    }
            else:
                # Default behavior - use main agency for completion
                for response in self.agency.get_completion(message, yield_messages=True):
                    if response:
                        formatted_response = self.format_message(response)
                        if formatted_response:
                            self.conversation_thread.append(formatted_response)
                            yield formatted_response
                            if formatted_response.get('type') == 'message':
                                time.sleep(0.5)
            
        except Exception as e:
            yield {
                'type': 'error',
                'agent': 'System',
                'content': f"Error: {str(e)}",
                'timestamp': time.time()
            }

# Create agency function
def create_agency():
    # Get the current directory and load the .env file from there
    current_dir = Path(__file__).parent
    env_path = current_dir / '.env'
    load_dotenv(dotenv_path=env_path)

    # Get and verify OpenAI API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")

    # Set OpenAI API key
    set_openai_key(api_key)

    try:
        # Initialize all agents
        ceo = MarketInsightCEO()
        competitor_tracking = CompetitorTrackingAgent()
        sentiment_analysis = SentimentAnalysisAgent()
        icp_generator = ICPGeneratorAgent()
        feedback_collector = FeedbackCollectorAgent()
        market_analysis = MarketAnalysisAgent()
        reporting = ReportingAgent()

        # Create agency instance with all agents and their communication paths
        agency_instance = MarketInsightAgency(
            [
                ceo,  # CEO as entry point
                [ceo, competitor_tracking],
                [ceo, sentiment_analysis],
                [ceo, icp_generator],
                [ceo, feedback_collector],
                [ceo, market_analysis],
                [ceo, reporting],
                [competitor_tracking, market_analysis],
                [sentiment_analysis, market_analysis],
                [market_analysis, reporting]
            ],
            shared_instructions='agency_manifesto.md',
            temperature=float(os.getenv('TEMPERATURE', 0.3)),
            max_prompt_tokens=int(os.getenv('MAX_TOKENS', 4000))
        )

        return agency_instance

    except Exception as e:
        print(f"Error creating agency: {e}")
        raise

# Create the agency instance
agency = create_agency()

# Make sure to export both the class and the function
__all__ = ['MarketInsightAgency', 'create_agency', 'agency']

# Export directly for explicit imports
MarketInsightAgency = MarketInsightAgency
create_agency = create_agency