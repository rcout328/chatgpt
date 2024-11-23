from agency_swarm import Agency, set_openai_key
from DataCollectionAgent import DataCollectionAgent
from MarketInsightCEO import MarketInsightCEO
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')
set_openai_key(api_key)

# Initialize agents
ceo = MarketInsightCEO()
data_collector = DataCollectionAgent()

# Create agency
agency = Agency([
    ceo,  # CEO as entry point
    [ceo, data_collector],  # CEO can communicate with DataCollector
], 
    shared_instructions='./agency_manifesto.md',
    max_prompt_tokens=4000,
    temperature=0.7
)

if __name__ == '__main__':
    # Start the agency with Gradio interface
    agency.demo_gradio() 