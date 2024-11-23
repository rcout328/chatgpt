from agency_swarm.agents import Agent


class CompetitorTrackingAgent(Agent):
    def __init__(self):
        super().__init__(
            name="CompetitorTrackingAgent",
            description="This agent monitors competitors using web scraping tools like BeautifulSoup or Scrapy.",
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
