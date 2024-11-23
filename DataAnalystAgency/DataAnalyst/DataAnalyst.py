from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter
from .tools.DataLoader import DataLoader
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DataAnalyst(Agent):
    def __init__(self):
        super().__init__(
            name="DataAnalyst",
            description="The DataAnalyst agent is responsible for analyzing data using data analysis libraries such as pandas, NumPy, or any other relevant tools for data processing and analysis.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[CodeInterpreter, DataLoader],
            tools_folder="./tools",
            temperature=float(os.getenv('TEMPERATURE', 0.3)),
            max_prompt_tokens=int(os.getenv('MAX_TOKENS', 25000)),
        )
        
    def response_validator(self, message):
        return message
