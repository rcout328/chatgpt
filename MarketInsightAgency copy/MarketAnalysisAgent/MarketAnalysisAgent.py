from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class MarketAnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="MarketAnalysisAgent",
            description="This agent conducts market opportunity analysis using economic data and statistical modeling.",
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
