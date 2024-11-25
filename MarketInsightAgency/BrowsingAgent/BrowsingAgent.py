import json
import re
from datetime import datetime

from agency_swarm import Agent
from agency_swarm.tools import CodeInterpreter, FileSearch
from shared_tools.MarkdownWriter import MarkdownWriter
from .tools.SerpAPISearch import SerpAPISearch


class BrowsingAgent(Agent):
    SCREENSHOT_FILE_NAME = "screenshot.jpg"

    def __init__(self):
        super().__init__(
            name="BrowsingAgent",
            description="Performs web searches and browsing using SerpAPI",
            instructions="./instructions.md",
            tools=[CodeInterpreter, FileSearch, MarkdownWriter, SerpAPISearch],
            temperature=0.7,
            max_prompt_tokens=4000
        )

    async def process_message(self, message):
        try:
            # Process the message
            response = await super().process_message(message)
            return response

        except Exception as e:
            print(f"Error in BrowsingAgent: {str(e)}")
            raise e

    def search_web(self, query: str, search_type: str = "search", **params):
        """
        Perform a web search using SerpAPI
        """
        try:
            # Prepare search parameters
            search_params = {
                "query": query,
                "search_type": search_type,
                "parameters": {
                    "hl": "en",  # Language
                    "gl": "us",  # Country
                    "num": 10,   # Number of results
                    **params     # Additional parameters
                }
            }

            # Execute search
            search_results = self.tools["SerpAPISearch"].run(**search_params)

            # Save search results
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = f"./reports/searches/{query.lower().replace(' ', '_')}_{timestamp}.md"
            
            self.tools["MarkdownWriter"].run(
                content=search_results,
                file_path=report_path,
                metadata={
                    "query": query,
                    "search_type": search_type,
                    "parameters": params,
                    "timestamp": timestamp
                }
            )

            return search_results

        except Exception as e:
            return f"Error performing web search: {str(e)}"

    def take_screenshot(self):
        from .tools.util.selenium import get_web_driver
        from .tools.util import get_b64_screenshot
        wd = get_web_driver()
        screenshot = get_b64_screenshot(wd)
        screenshot_data = base64.b64decode(screenshot)
        with open(self.SCREENSHOT_FILE_NAME, "wb") as screenshot_file:
            screenshot_file.write(screenshot_data)

    def create_response_content(self, response_text):
        with open(self.SCREENSHOT_FILE_NAME, "rb") as file:
            file_id = self.client.files.create(
                file=file,
                purpose="vision",
            ).id

        content = [
            {"type": "text", "text": response_text},
            {
                "type": "image_file",
                "image_file": {"file_id": file_id}
            }
        ]
        return content

    # Function to check for Unicode escape sequences
    def remove_unicode(self, data):
        return re.sub(r'[^\x00-\x7F]+', '', data)

