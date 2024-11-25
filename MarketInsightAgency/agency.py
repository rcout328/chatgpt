import sys
from pathlib import Path

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent))

from agency_swarm import Agency, set_openai_key
from MarketAnalysisAgent.MarketAnalysisAgent import MarketAnalysisAgent
from MarketInsightCEO.MarketInsightCEO import MarketInsightCEO
from CompetitorTrackingAgent.CompetitorTrackingAgent import CompetitorTrackingAgent
from SentimentAnalysisAgent.SentimentAnalysisAgent import SentimentAnalysisAgent
from ICPGeneratorAgent.ICPGeneratorAgent import ICPGeneratorAgent
from FeedbackCollectorAgent.FeedbackCollectorAgent import FeedbackCollectorAgent
from ReportingAgent.ReportingAgent import ReportingAgent
from BrowsingAgent.BrowsingAgent import BrowsingAgent
import os
from dotenv import load_dotenv

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
market_analysis = MarketAnalysisAgent()
competitor_tracking = CompetitorTrackingAgent()
sentiment_analysis = SentimentAnalysisAgent()
icp_generator = ICPGeneratorAgent()
feedback_collector = FeedbackCollectorAgent()
reporting = ReportingAgent()
browsing_agent = BrowsingAgent()

# Set common configurations for all agents
agents = [
    ceo,
    market_analysis,
    competitor_tracking,
    sentiment_analysis,
    icp_generator,
    feedback_collector,
    reporting,
    browsing_agent
]

for agent in agents:
    agent.temperature = float(os.getenv('TEMPERATURE', 0.7))
    agent.model = os.getenv('OPENAI_MODEL', "gpt-4-1106-preview")

# Create agency with communication flows
agency = Agency(
    [
        ceo,  # CEO is the entry point
        browsing_agent,
        competitor_tracking,
        sentiment_analysis,
        icp_generator,
        feedback_collector,
        market_analysis,
        reporting,
        [ceo, competitor_tracking],  # CEO can communicate with CompetitorTrackingAgent
        [ceo, sentiment_analysis],   # CEO can communicate with SentimentAnalysisAgent
        [ceo, icp_generator],        # CEO can communicate with ICPGeneratorAgent
        [ceo, feedback_collector],   # CEO can communicate with FeedbackCollectorAgent
        [ceo, market_analysis],      # CEO can communicate with MarketAnalysisAgent
        [ceo, reporting],            # CEO can communicate with ReportingAgent
        [ceo, browsing_agent],       # CEO can communicate with BrowsingAgent
        [competitor_tracking, market_analysis],  # CompetitorTrackingAgent can communicate with MarketAnalysisAgent
        [sentiment_analysis, market_analysis],   # SentimentAnalysisAgent can communicate with MarketAnalysisAgent
        [market_analysis, reporting],            # MarketAnalysisAgent can communicate with ReportingAgent
        [browsing_agent, market_analysis],       # BrowsingAgent can communicate with MarketAnalysisAgent
    ],
    shared_instructions='./agency_manifesto.md',
    max_prompt_tokens=int(os.getenv('MAX_TOKENS', 4000)),
    temperature=float(os.getenv('TEMPERATURE', 0.7))
)

if __name__ == '__main__':
    agency.demo_gradio()