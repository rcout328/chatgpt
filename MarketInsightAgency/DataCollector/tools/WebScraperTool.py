from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
from bs4 import BeautifulSoup
import pandas as pd

class WebScraperTool(BaseTool):
    """
    A tool for web scraping that extracts data from specified URLs using BeautifulSoup.
    """
    
    url: str = Field(
        ..., 
        description="The URL to scrape data from"
    )
    
    selector: str = Field(
        ..., 
        description="CSS selector to target specific elements"
    )

    def run(self):
        """
        Scrapes data from the specified URL using the given CSS selector.
        Returns the extracted data as a list.
        """
        try:
            # Send GET request to the URL
            response = requests.get(self.url)
            response.raise_for_status()
            
            # Parse HTML content
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find elements using the selector
            elements = soup.select(self.selector)
            
            # Extract text from elements
            data = [element.text.strip() for element in elements]
            
            return data
            
        except Exception as e:
            return f"Error scraping data: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    scraper = WebScraperTool(
        url="https://example.com",
        selector="p"
    )
    print(scraper.run()) 