from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
from bs4 import BeautifulSoup

class WebScrapingTool(BaseTool):
    """
    A tool for performing web scraping tasks using BeautifulSoup.
    This tool fetches a web page, parses the HTML content, and extracts specific data based on given criteria or tags.
    """

    url: str = Field(
        ..., description="The URL of the web page to scrape."
    )
    tag: str = Field(
        ..., description="The HTML tag to search for in the web page."
    )
    attribute: str = Field(
        None, description="The attribute of the HTML tag to filter by, if any."
    )
    attribute_value: str = Field(
        None, description="The value of the attribute to filter by, if any."
    )

    def run(self):
        """
        Fetches the web page, parses the HTML content, and extracts data based on the specified tag and attribute.
        """
        try:
            # Make an HTTP request to fetch the web page
            response = requests.get(self.url)
            response.raise_for_status()  # Raise an error for bad responses

            # Parse the HTML content using BeautifulSoup
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find all elements matching the specified tag and attribute
            if self.attribute and self.attribute_value:
                elements = soup.find_all(self.tag, {self.attribute: self.attribute_value})
            else:
                elements = soup.find_all(self.tag)

            # Extract and return the text content of the found elements
            extracted_data = [element.get_text(strip=True) for element in elements]
            return extracted_data

        except requests.RequestException as e:
            return f"An error occurred while fetching the web page: {e}"
        except Exception as e:
            return f"An error occurred during parsing or extraction: {e}"