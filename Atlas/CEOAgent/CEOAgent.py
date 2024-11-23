from agency_swarm.agents import Agent


class CEOAgent(Agent):
    def __init__(self):
        super().__init__(
            name="CEOAgent",
            description="The CEO Agent oversees the entire process and coordinates between the DataCollectorAgent, AnalysisAgent, and RecommendationAgent. It acts as the entry point for communication with the user and ensures that the agency's mission and goals are being met.",
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
