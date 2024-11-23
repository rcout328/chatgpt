from agency_swarm import Agency, set_openai_key
from DataCollectionAgent import DataCollectionAgent
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Set OpenAI API key
api_key = os.getenv('OPENAI_API_KEY')
set_openai_key(api_key)

# Initialize the agent
data_collector = DataCollectionAgent()

# Test cases
def test_company_research():
    # Test Case 1: Research a specific company
    print("\nTest Case 1: Research Tata Group in India")
    result = data_collector.collect_company_data(
        company_name="Tata Group",
        jurisdiction_code="in"
    )
    print(result)

    # Test Case 2: Research a tech company
    print("\nTest Case 2: Research Apple Inc in US")
    result = data_collector.collect_company_data(
        company_name="Apple Inc",
        jurisdiction_code="us_de"
    )
    print(result)

    # Test Case 3: Research a local company
    print("\nTest Case 3: Research Gujarat-based Agarbatti Manufacturer")
    result = data_collector.collect_company_data(
        company_name="Cycle Pure Agarbathies",
        jurisdiction_code="in_gj"
    )
    print(result)

if __name__ == "__main__":
    test_company_research() 