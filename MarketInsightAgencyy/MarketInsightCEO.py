from agency_swarm import Agent

class MarketInsightCEO(Agent):
    def __init__(self):
        super().__init__(
            name="MarketInsightCEO",
            description="Strategic planning and market insight coordination",
            instructions="./instructions.md",
            tools=[],  # Add any specific tools needed
            temperature=0.3,
            max_prompt_tokens=4000
        ) 