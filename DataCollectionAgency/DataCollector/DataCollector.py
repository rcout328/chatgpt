from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class DataCollector(Agent):
    def __init__(self):
        super().__init__(
            name="DataCollector",
            description="An agent designed to perform web scraping tasks using BeautifulSoup. It is capable of handling HTML parsing and extracting data from web pages effectively.",
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
