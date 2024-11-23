from agency_swarm import Agency, set_openai_key
from ReportingAgent import ReportingAgent
from MarketAnalysisAgent import MarketAnalysisAgent
from FeedbackCollectorAgent import FeedbackCollectorAgent
from ICPGeneratorAgent import ICPGeneratorAgent
from SentimentAnalysisAgent import SentimentAnalysisAgent
from CompetitorTrackingAgent import CompetitorTrackingAgent
from MarketInsightCEO import MarketInsightCEO
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

# Create agency with simplified structure
agency = Agency([
    ceo,  # CEO as entry point
   e
], 
    shared_instructions='./agency_manifesto.md',
    max_prompt_tokens=25000,
    temperature=0.3
)

if __name__ == '__main__':
    agency.demo_gradio()