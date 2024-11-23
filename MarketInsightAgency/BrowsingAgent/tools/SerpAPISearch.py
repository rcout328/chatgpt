from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Optional, Dict, Any, List
import requests
from datetime import datetime

class SerpAPISearch(BaseTool):
    """
    Tool for performing Google searches using SerpAPI.
    """
    
    query: str = Field(
        ...,
        description="Search query to be executed"
    )
    
    search_type: str = Field(
        default="search",
        description="Type of search (search, images, news, shopping, etc.)"
    )
    
    parameters: Dict[str, Any] = Field(
        default_factory=lambda: {
            "hl": "en",
            "gl": "us",
            "num": 10
        },
        description="Additional search parameters (location, language, etc.)"
    )

    def __init__(self, **data):
        super().__init__(**data)
        self.api_key = "ab5994a0325d006f6567d50536425e38ed348e96bb7db92be50c07adb92e7dd3"
        self.base_url = "https://serpapi.com/search"

    def run(self) -> str:
        try:
            # Prepare search parameters
            params = {
                "api_key": self.api_key,
                "q": self.query,
                "engine": "google",
                **self.parameters
            }

            # Make API request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()

            # Format results
            formatted_output = self._format_search_results(data)
            return formatted_output

        except Exception as e:
            return f"Error performing search: {str(e)}"

    def _format_search_results(self, data: Dict) -> str:
        """Format search results in a readable way"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result = f"""# Google Search Results
Generated: {timestamp}

## Search Query
{self.query}

## Search Parameters
{self._format_dict(self.parameters)}

"""
        # Add organic results
        if "organic_results" in data:
            result += "\n## Organic Results\n"
            for idx, item in enumerate(data["organic_results"], 1):
                result += f"\n### {idx}. {item.get('title', 'No Title')}\n"
                result += f"Link: {item.get('link', 'No Link')}\n"
                result += f"Snippet: {item.get('snippet', 'No Snippet')}\n"

        # Add knowledge graph if available
        if "knowledge_graph" in data:
            result += "\n## Knowledge Graph\n"
            kg = data["knowledge_graph"]
            result += f"Title: {kg.get('title', 'N/A')}\n"
            result += f"Type: {kg.get('type', 'N/A')}\n"
            if "description" in kg:
                result += f"Description: {kg['description']}\n"

        # Add related questions if available
        if "related_questions" in data:
            result += "\n## People Also Ask\n"
            for question in data["related_questions"]:
                result += f"\nQ: {question.get('question', 'N/A')}\n"
                result += f"A: {question.get('snippet', 'N/A')}\n"

        # Add related searches if available
        if "related_searches" in data:
            result += "\n## Related Searches\n"
            for search in data["related_searches"]:
                result += f"- {search.get('query', 'N/A')}\n"

        return result

    def _format_dict(self, d: Dict[str, Any], indent: int = 0) -> str:
        """Helper method to format dictionary nicely in markdown"""
        result = ""
        for key, value in d.items():
            result += "  " * indent + f"- **{key}**: {value}\n"
        return result

if __name__ == "__main__":
    # Test the tool
    tool = SerpAPISearch(
        query="artificial intelligence trends 2024",
        parameters={
            "location": "United States",
            "hl": "en",
            "gl": "us",
            "num": 5
        }
    )
    print(tool.run()) 