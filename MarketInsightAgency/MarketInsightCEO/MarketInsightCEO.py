from agency_swarm.agents import Agent


class MarketInsightCEO(Agent):
    def __init__(self):
        super().__init__(
            name="MarketInsightCEO",
            description="This agent oversees the agency's operations, coordinates between agents, and communicates with clients.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[],
            tools_folder="./tools",
            temperature=0.3,
            max_prompt_tokens=25000,
        )
        
    def response_validator(self, message):
        return message
