from agency_swarm import Agent

class AnalysisAgent(Agent):
    """
    Analysis Agent responsible for processing and analyzing collected data.
    """
    
    def __init__(self):
        super().__init__(
            name="Analysis",
            description="Specialized agent for analyzing business data and identifying key insights.",
            instructions="./instructions.md",
            tools=[],  # Using default communication tools
            temperature=0.3,
            max_prompt_tokens=4000
        ) 