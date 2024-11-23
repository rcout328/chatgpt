from agency_swarm import Agent

class DataCollectorAgent(Agent):
    """
    Data Collector Agent responsible for gathering and synthesizing information.
    """
    
    def __init__(self):
        super().__init__(
            name="Data Collector",
            description="Specialized agent for collecting and organizing relevant business data and information.",
            instructions="./instructions.md",
            tools=[],  # Using default communication tools
            temperature=0.3,
            max_prompt_tokens=4000
        ) 