from agency_swarm import Agent
from .tools import SerpSearch, NewsCollector

class DataCollectorAgent(Agent):
    def __init__(self):
        super().__init__(
            name="DataCollector",
            description="Responsible for gathering market data, competitor information, and news through various APIs.",
            instructions="./instructions.md",
            tools=[SerpSearch],
            temperature=0.5,
            max_prompt_tokens=4000,
        ) 