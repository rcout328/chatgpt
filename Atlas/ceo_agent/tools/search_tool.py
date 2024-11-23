from agency_swarm.tools import BaseTool
from pydantic import Field
from serpapi import GoogleSearch
from dotenv import load_dotenv
import os
from datetime import datetime
from typing import Optional

load_dotenv()

class SearchTool(BaseTool):
    """
    A tool for performing Google searches using the SerpAPI service.
    The CEO can use this to research topics, companies, or markets.
    """
    
    query: str = Field(
        ...,
        description="The search query to look up"
    )
    
    num_results: int = Field(
        default=5,
        description="Number of search results to return (default: 5)"
    )
    
    use_browser: bool = Field(
        default=False,
        description="Whether to use BrowsingAgent for detailed web search"
    )

    def run(self):
        """
        Performs a Google search using SerpAPI and returns formatted results.
        If use_browser is True, delegates to BrowsingAgent for detailed search.
        """
        try:
            if self.use_browser:
                # Delegate to BrowsingAgent
                from agency_swarm import get_agency
                agency = get_agency()
                browsing_agent = next(
                    (agent for agent in agency.agents if agent.__class__.__name__ == "BrowsingAgent"),
                    None
                )
                
                if browsing_agent:
                    search_url = f"https://www.google.com/search?q={self.query}"
                    return agency.get_completion(
                        f"Please search and analyze information about: {self.query}",
                        agent=browsing_agent
                    )
                else:
                    return "BrowsingAgent not found in the agency."

            # Regular SERP API search
            api_key = os.getenv("SERPAPI_API_KEY")
            if not api_key:
                return "Error: SERPAPI_API_KEY not found in environment variables"

            search_params = {
                "engine": "google",
                "q": self.query,
                "api_key": api_key,
                "num": self.num_results,
                "gl": os.getenv("DEFAULT_LOCATION", "us"),
                "hl": os.getenv("DEFAULT_LANGUAGE", "en")
            }
            
            # Print for debugging
            print(f"Using SERP API key: {api_key[:10]}...")
            print(f"Search parameters: {search_params}")
            
            # Perform the search
            search = GoogleSearch(search_params)
            results = search.get_dict()
            
            if not results:
                return f"No results found for query: {self.query}"
            
            # Format the results
            formatted_results = []
            
            # Add knowledge graph information if available
            if "knowledge_graph" in results:
                kg = results["knowledge_graph"]
                formatted_results.append(
                    "# Knowledge Graph Information\n"
                    f"Title: {kg.get('title', 'N/A')}\n"
                    f"Description: {kg.get('description', 'N/A')}\n"
                    f"Type: {kg.get('type', 'N/A')}\n"
                )
            
            # Add organic search results
            if "organic_results" in results:
                formatted_results.append("# Search Results\n")
                for i, result in enumerate(results["organic_results"][:self.num_results], 1):
                    formatted_result = (
                        f"## Result {i}\n"
                        f"Title: {result.get('title', 'No title')}\n"
                        f"Link: {result.get('link', 'No link')}\n"
                        f"Snippet: {result.get('snippet', 'No snippet available')}\n"
                    )
                    formatted_results.append(formatted_result)
            else:
                formatted_results.append("No organic results found.")
            
            # Create markdown content
            markdown_content = "\n".join(formatted_results)
            
            # Save search results to a markdown file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"search_results_{timestamp}.md"
            
            # Use MarkdownCreator to save the results
            from .markdown_creator import MarkdownCreator
            markdown_creator = MarkdownCreator(
                content=markdown_content,
                filename=filename,
                folder="search_results"
            )
            markdown_creator.run()
            
            return markdown_content
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            return f"Error performing search: {str(e)}\nDetails: {error_details}"

if __name__ == "__main__":
    # Test the tool
    searcher = SearchTool(
        query="latest developments in artificial intelligence",
        num_results=3
    )
    print(searcher.run()) 