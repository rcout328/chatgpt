from agency_swarm import Agency, set_openai_key
from ReportingAgent import ReportingAgent
from MarketAnalysisAgent import MarketAnalysisAgent
from FeedbackCollectorAgent import FeedbackCollectorAgent
from ICPGeneratorAgent import ICPGeneratorAgent
from SentimentAnalysisAgent import SentimentAnalysisAgent
from CompetitorTrackingAgent import CompetitorTrackingAgent
from MarketInsightCEO import MarketInsightCEO
from DataCollector import DataCollector
from BrowsingAgent import BrowsingAgent
from shared_tools.MarkdownWriter import MarkdownWriter
from shared_tools.TaskReporter import TaskReporter
from shared_tools.GPTDataProcessor import GPTDataProcessor
from shared_tools.AIDataAnalyzer import AIDataAnalyzer
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

# Initialize agents first
ceo = MarketInsightCEO()
competitor_tracking = CompetitorTrackingAgent()
sentiment_analysis = SentimentAnalysisAgent()
icp_generator = ICPGeneratorAgent()
feedback_collector = FeedbackCollectorAgent()
market_analysis = MarketAnalysisAgent()
reporting = ReportingAgent()
data_collector = DataCollector()
browsing_agent = BrowsingAgent()

# Create tool instances with unique names for each agent
def create_tool_instance(tool_class, agent_prefix):
    """Create a new tool class with a unique name for each agent"""
    return type(
        f"{agent_prefix}{tool_class.__name__}",
        (tool_class,),
        {"__module__": tool_class.__module__}
    )

# Configure tools for each agent
ceo.tools = [
    create_tool_instance(MarkdownWriter, "CEO_"),
    create_tool_instance(TaskReporter, "CEO_")
]

competitor_tracking.tools = [
    create_tool_instance(AIDataAnalyzer, "CompTrack_"),
    create_tool_instance(MarkdownWriter, "CompTrack_"),
    create_tool_instance(TaskReporter, "CompTrack_")
]

sentiment_analysis.tools = [
    create_tool_instance(AIDataAnalyzer, "Sentiment_"),
    create_tool_instance(MarkdownWriter, "Sentiment_"),
    create_tool_instance(TaskReporter, "Sentiment_")
]

icp_generator.tools = [
    create_tool_instance(AIDataAnalyzer, "ICP_"),
    create_tool_instance(MarkdownWriter, "ICP_"),
    create_tool_instance(TaskReporter, "ICP_")
]

feedback_collector.tools = [
    create_tool_instance(AIDataAnalyzer, "Feedback_"),
    create_tool_instance(MarkdownWriter, "Feedback_"),
    create_tool_instance(TaskReporter, "Feedback_")
]

market_analysis.tools = [
    create_tool_instance(AIDataAnalyzer, "Market_"),
    create_tool_instance(MarkdownWriter, "Market_"),
    create_tool_instance(TaskReporter, "Market_")
]

reporting.tools = [
    create_tool_instance(GPTDataProcessor, "Report_"),
    create_tool_instance(MarkdownWriter, "Report_"),
    create_tool_instance(TaskReporter, "Report_")
]

browsing_agent.tools = [
    create_tool_instance(AIDataAnalyzer, "Browse_"),
    create_tool_instance(MarkdownWriter, "Browse_"),
    create_tool_instance(TaskReporter, "Browse_")
]

# Set common configurations for all agents
agents = [ceo, competitor_tracking, sentiment_analysis, icp_generator, 
          feedback_collector, market_analysis, reporting, 
          data_collector, browsing_agent]

for agent in agents:
    agent.temperature = 0.7
    agent.model = "gpt-4-1106-preview"

# Create agency with GPT-enhanced structure
agency = Agency([
    ceo,
    data_collector,
    browsing_agent,
    competitor_tracking,
    sentiment_analysis,
    icp_generator,
    feedback_collector,
    market_analysis,
    reporting,
    data_collector,
    browsing_agent,
    [ceo, competitor_tracking],
    [ceo, sentiment_analysis],
    [ceo, icp_generator],
    [ceo, feedback_collector],
    [ceo, market_analysis],
    [ceo, reporting],
    [ceo, data_collector],
    [ceo, browsing_agent]
], 
    shared_instructions='./agency_manifesto.md',
    max_prompt_tokens=4000,
    temperature=0.7
)

if __name__ == '__main__':
    agency.demo_gradio()