from agency_swarm.tools import BaseTool
from pydantic import Field
from dotenv import load_dotenv
import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from utils.openai_config import analyze_sentiment

load_dotenv()

class SentimentAnalyzer(BaseTool):
    """
    A tool for analyzing sentiment in text data using OpenAI's API.
    """
    
    text: str = Field(
        ...,
        description="The text content to analyze for sentiment"
    )

    def run(self):
        """
        Analyzes the sentiment of the provided text and returns the analysis results.
        """
        result = analyze_sentiment(self.text)
        
        if result['status'] == 'success':
            return result['analysis']
        else:
            return f"Failed to analyze sentiment: {result['analysis']}"

if __name__ == "__main__":
    # Test the tool
    analyzer = SentimentAnalyzer(text="This product is amazing and exceeded all my expectations!")
    print(analyzer.run()) 