from agency_swarm import Agency
from data_collector_agent.data_collector_agent import DataCollectorAgent
from analysis_agent.analysis_agent import AnalysisAgent
from recommendation_agent.recommendation_agent import RecommendationAgent

# Initialize agents
data_collector = DataCollectorAgent()
analyst = AnalysisAgent()
advisor = RecommendationAgent()

# Create agency with bidirectional communication flows
agency = Agency(
    [
        data_collector,  # Entry point for data collection
        [data_collector, analyst],  # Data collector can communicate with analyst
        [analyst, data_collector],  # Analyst can request more data
        [analyst, advisor],  # Analyst can communicate with advisor
        [advisor, analyst],  # Advisor can request additional analysis
        [advisor, data_collector],  # Advisor can request specific data
    ],
    shared_instructions="agency_manifesto.md",
    temperature=0.5,
    max_prompt_tokens=4000
)

if __name__ == "__main__":
    agency.demo_gradio() 