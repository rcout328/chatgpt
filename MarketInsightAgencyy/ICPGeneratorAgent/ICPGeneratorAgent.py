from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class ICPGeneratorAgent(Agent):
    def __init__(self):
        super().__init__(
            name="ICPGeneratorAgent",
            description="This agent creates customer profiles using CRM data and demographic databases with pandas and scikit-learn.",
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
