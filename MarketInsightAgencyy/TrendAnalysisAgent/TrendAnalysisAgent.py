from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class TrendAnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="TrendAnalysisAgent",
            description="The TrendAnalysisAgent is responsible for detecting market trends using finance APIs and tools like pandas and scikit-learn. It should have a fallback mechanism to use GPT-based datasets if APIs fail.",
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
