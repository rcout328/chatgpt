from agency_swarm import Agency, set_openai_key
from MarketInsightCEO import MarketInsightCEO
from CompetitorTrackingAgent import CompetitorTrackingAgent
from SentimentAnalysisAgent import SentimentAnalysisAgent
from ICPGeneratorAgent import ICPGeneratorAgent
from FeedbackCollectorAgent import FeedbackCollectorAgent
from MarketAnalysisAgent import MarketAnalysisAgent
from ReportingAgent import ReportingAgent
from dotenv import load_dotenv
import os
from pathlib import Path

# Get the current directory and load the .env file from there
current_dir = Path(__file__).parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Get and verify OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables. Please check your .env file.")

# Set OpenAI API key
set_openai_key(api_key)

# Initialize agents
ceo = MarketInsightCEO()
competitor_tracking = CompetitorTrackingAgent()
sentiment_analysis = SentimentAnalysisAgent()
icp_generator = ICPGeneratorAgent()
feedback_collector = FeedbackCollectorAgent()
market_analysis = MarketAnalysisAgent()
reporting = ReportingAgent()

# Create agency instance
agency = Agency(
    [
        ceo,  # CEO as entry point
        [ceo, competitor_tracking],
        [ceo, sentiment_analysis],
        [ceo, icp_generator],
        [ceo, feedback_collector],
        [ceo, market_analysis],
        [ceo, reporting]
    ],
    shared_instructions='agency_manifesto.md',
    temperature=float(os.getenv('TEMPERATURE', 0.3)),
    max_prompt_tokens=int(os.getenv('MAX_TOKENS', 4000))
)

# Make sure the agency is initialized before running the app
if __name__ == "__main__":
    print("Agency initialized successfully")
    print(f"Available agents: {[agent.name for agent in agency.agents]}")