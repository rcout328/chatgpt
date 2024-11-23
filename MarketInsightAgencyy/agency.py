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
import asyncio

# Define the MarketInsightAgency class
class MarketInsightAgency(Agency):
    def __init__(self, agents, shared_instructions=None, temperature=None, max_prompt_tokens=None):
        super().__init__(
            agents,
            shared_instructions=shared_instructions,
            temperature=temperature,
            max_prompt_tokens=max_prompt_tokens
        )

    def chat(self, message, agent=None):
        """Synchronous chat method that wraps async functionality"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            response = loop.run_until_complete(self._async_chat(message, agent))
            yield response
        finally:
            loop.close()

    async def _async_chat(self, message, agent=None):
        """Internal async chat method"""
        try:
            if agent:
                target_agent = None
                for a in self.agents:
                    if a.name == agent:
                        target_agent = a
                        break
                if not target_agent:
                    return {
                        'type': 'error',
                        'content': f"Agent {agent} not found",
                        'agent': 'System'
                    }

                # Process the message using the async process_message method
                response = await target_agent.process_message(message)
                if isinstance(response, str):
                    return {
                        'type': 'message',
                        'content': response,
                        'agent': agent
                    }
                return response
            else:
                # Use the first agent (CEO) by default
                response = await self.agents[0].process_message(message)
                if isinstance(response, str):
                    return {
                        'type': 'message',
                        'content': response,
                        'agent': self.agents[0].name
                    }
                return response

        except Exception as e:
            return {
                'type': 'error',
                'content': str(e),
                'agent': 'System'
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
                [ceo, competitor_tracking],  # CEO can communicate with CompetitorTrackingAgent
                [ceo, sentiment_analysis],   # CEO can communicate with SentimentAnalysisAgent
                [ceo, icp_generator],        # CEO can communicate with ICPGeneratorAgent
                [ceo, feedback_collector],   # CEO can communicate with FeedbackCollectorAgent
                [ceo, market_analysis],      # CEO can communicate with MarketAnalysisAgent
                [ceo, reporting],            # CEO can communicate with ReportingAgent
                [competitor_tracking, market_analysis],  # CompetitorTrackingAgent can communicate with MarketAnalysisAgent
                [sentiment_analysis, market_analysis],   # SentimentAnalysisAgent can communicate with MarketAnalysisAgent
                [market_analysis, reporting]            # MarketAnalysisAgent can communicate with ReportingAgent
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