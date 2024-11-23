from agency_swarm import Agent

class RecommendationAgent(Agent):
    """
    Recommendation Agent responsible for generating strategic insights and recommendations.
    """
    
    def __init__(self):
        super().__init__(
            name="Recommendation",
            description="Specialized agent for generating strategic recommendations based on analysis.",
            instructions="./instructions.md",
            tools=[],  # Using default communication tools
            temperature=0.3,
            max_prompt_tokens=4000
        ) 