from agency_swarm import Agency
from DataAnalyst import DataAnalyst
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create an instance of the DataAnalyst agent
data_analyst = DataAnalyst()

# Create the agency with proper structure
agency = Agency(
    [
        data_analyst,  # Entry point agent (single agent)
        [data_analyst],  # Communication flows
    ],
    shared_instructions='./agency_manifesto.md',  # shared instructions for all agents
    max_prompt_tokens=int(os.getenv('MAX_TOKENS', 25000)),  # get from env or use default
    temperature=float(os.getenv('TEMPERATURE', 0.3)),  # get from env or use default
)

if __name__ == '__main__':
    agency.demo_gradio()
