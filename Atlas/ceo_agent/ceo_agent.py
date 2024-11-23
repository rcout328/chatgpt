from agency_swarm import Agent
from .tools.document_creator import DocumentCreator

class CEOAgent(Agent):
    """
    CEO Agent responsible for high-level decision making and coordination.
    """
    
    def __init__(self):
        super().__init__(
            name="CEO",
            description="Strategic leader responsible for coordinating analysis and making high-level decisions.",
            instructions="./instructions.md",
            tools=[DocumentCreator],  # Using DocumentCreator for both MD and PDF
            temperature=0.3,
            max_prompt_tokens=4000
        ) 