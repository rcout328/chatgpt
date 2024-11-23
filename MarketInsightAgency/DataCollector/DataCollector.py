from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter
from .tools.WebScraperTool import WebScraperTool

class DataCollector(Agent):
    def __init__(self):
        super().__init__(
            name="DataCollector",
            description="Agent responsible for collecting data from various sources including web scraping.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[CodeInterpreter, WebScraperTool],
            tools_folder="./tools",
            temperature=0.3,
            max_prompt_tokens=25000,
        ) 