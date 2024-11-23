from agency_swarm import Agency
from ceo_agent.ceo_agent import CEOAgent
from data_collector_agent.data_collector_agent import DataCollectorAgent
from analysis_agent.analysis_agent import AnalysisAgent
from recommendation_agent.recommendation_agent import RecommendationAgent
from utils.config import MAX_TOKENS, TEMPERATURE
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize agents
ceo = CEOAgent()
data_collector = DataCollectorAgent()
analysis = AnalysisAgent()
recommendation = RecommendationAgent()

# Create agency with communication flows
agency = Agency(
    [
        ceo,  # CEO is the entry point
        [ceo, data_collector],  # CEO can communicate with data collector
        [ceo, analysis],  # CEO can communicate with analysis agent
        [ceo, recommendation],  # CEO can communicate with recommendation agent
        [data_collector, analysis],  # Data collector can communicate with analysis
        [analysis, recommendation],  # Analysis can communicate with recommendation
    ],
    shared_instructions='./agency_manifesto.md',
    max_prompt_tokens=MAX_TOKENS,
    temperature=TEMPERATURE,
)

if __name__ == '__main__':
    agency.demo_gradio()