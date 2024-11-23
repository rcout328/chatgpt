from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class ReportingAgent(Agent):
    def __init__(self):
        super().__init__(
            name="ReportingAgent",
            description="This agent generates reports and visualizations using libraries like Jinja2 and matplotlib, aggregating data from all other agents.",
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
