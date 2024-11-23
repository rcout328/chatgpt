from agency_swarm.tools import BaseTool
from pydantic import Field
from dotenv import load_dotenv
import os
from serpapi import GoogleSearch

load_dotenv()

class SerpSearch(BaseTool):
    """
    A tool for performing Google searches using the SerpAPI service.
    """
    
    query: str = Field(
        ...,
        description="The search query to look up"
    )
    
    num_results: int = Field(
        default=5,
        description="Number of search results to return (default: 5)"
    )

    def run(self):
        """
        Performs a Google search using SerpAPI and returns formatted results.
        """
        try:
            # Initialize search parameters
            search_params = {
                "engine": "google",
                "q": self.query,
                "api_key": os.getenv("SERPAPI_API_KEY"),
                "num": self.num_results,
                "gl": os.getenv("DEFAULT_LOCATION", "us"),
                "hl": os.getenv("DEFAULT_LANGUAGE", "en")
            }
            
            # Perform the search
            search = GoogleSearch(search_params)
            results = search.get_dict()
            
            # Check if we have organic results
            if "organic_results" not in results:
                return f"No results found for query: {self.query}"
            
            # Format the results
            formatted_results = []
            for result in results["organic_results"][:self.num_results]:
                formatted_result = (
                    f"Title: {result.get('title', 'No title')}\n"
                    f"Link: {result.get('link', 'No link')}\n"
                    f"Snippet: {result.get('snippet', 'No snippet available')}\n"
                )
                formatted_results.append(formatted_result)
            
            # Add any knowledge graph information if available
            if "knowledge_graph" in results:
                kg = results["knowledge_graph"]
                formatted_results.insert(0, (
                    "Knowledge Graph Information:\n"
                    f"Title: {kg.get('title', 'No title')}\n"
                    f"Description: {kg.get('description', 'No description')}\n"
                    f"Type: {kg.get('type', 'No type')}\n"
                ))
            
            return "\n---\n".join(formatted_results)
            
        except Exception as e:
            return f"Error performing search: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    searcher = SerpSearch(query="latest developments in artificial intelligence", num_results=3)
    print(searcher.run()) 