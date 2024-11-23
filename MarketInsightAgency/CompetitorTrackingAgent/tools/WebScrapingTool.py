from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
from bs4 import BeautifulSoup
import time

class WebScrapingTool(BaseTool):
    """
    This tool utilizes web scraping libraries such as BeautifulSoup to extract data from competitor websites.
    It handles HTTP requests, parses HTML content, and extracts relevant information based on specified criteria.
    The tool also manages errors and respects website crawling policies.
    """

    url: str = Field(
        ..., description="The URL of the website to scrape."
    )
    element: str = Field(
        ..., description="The HTML element to extract data from (e.g., 'div', 'span')."
    )
    class_name: str = Field(
        ..., description="The class name of the HTML element to target for data extraction."
    )

    def run(self):
        """
        Extracts data from the specified website URL.
        Handles HTTP requests, parses HTML content, and extracts relevant information.
        """
        try:
            # Respect website crawling policies by including a delay
            time.sleep(1)

            # Send HTTP request to the specified URL
            response = requests.get(self.url)
            response.raise_for_status()

            # Parse HTML content using BeautifulSoup
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract relevant information based on specified criteria
            extracted_data = []
            for element in soup.find_all(self.element, class_=self.class_name):
                extracted_data.append(element.get_text(strip=True))

            return extracted_data

        except requests.exceptions.RequestException as e:
            return f"Error during HTTP request: {e}"
        except Exception as e:
            return f"An error occurred during web scraping: {e}"