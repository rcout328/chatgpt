from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class AnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="AnalysisAgent",
            description="The AnalysisAgent processes collected market data to detect trends and patterns using NLTK and machine learning. It analyzes data received from the DataCollectorAgent and communicates the results to the RecommendationAgent.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[CodeInterpreter],
            tools_folder="./tools",
            temperature=0.3,
            max_prompt_tokens=25000,
        )
        
    def response_validator(self, message):
        return message
