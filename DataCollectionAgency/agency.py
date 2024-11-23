from agency_swarm import Agency
from DataCollector import DataCollector
from dotenv import load_dotenv
import os
from agency_swarm.util import set_openai_key

# Load environment variables
load_dotenv()

# Set OpenAI API key
set_openai_key(os.getenv("OPENAI_API_KEY"))

# Create an instance of the DataCollector agent
data_collector = DataCollector()

agency = Agency([data_collector],
                shared_instructions='./agency_manifesto.md',  # shared instructions for all agents
                max_prompt_tokens=25000,  # default tokens in conversation for all agents
                temperature=0.3,  # default temperature for all agents
                )

if __name__ == '__main__':
    agency.demo_gradio()