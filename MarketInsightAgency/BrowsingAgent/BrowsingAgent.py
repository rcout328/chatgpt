import json
import re
from datetime import datetime

from agency_swarm.agents import Agent
from agency_swarm.tools.oai import FileSearch
from typing_extensions import override
import base64
from .tools.SerpAPISearch import SerpAPISearch
from shared_tools.MarkdownWriter import MarkdownWriter
from shared_tools.TaskReporter import TaskReporter


class BrowsingAgent(Agent):
    SCREENSHOT_FILE_NAME = "screenshot.jpg"

    def __init__(self, selenium_config=None, **kwargs):
        super().__init__(
            name="BrowsingAgent",
            description="This agent performs web searches and browsing using SerpAPI and Selenium.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[SerpAPISearch, MarkdownWriter, TaskReporter],
            tools_folder="./tools",
            temperature=0.7,
            max_prompt_tokens=4000,
            model="gpt-4-1106-preview",
            **kwargs
        )
        if selenium_config is not None:
            from .tools.util.selenium import set_selenium_config
            set_selenium_config(selenium_config)

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

            # Create task report
            self.tools["TaskReporter"].run(
                task_name=f"Web Search - {query}",
                task_description=f"Performed web search using SerpAPI",
                findings=[
                    "Executed search query",
                    "Retrieved search results",
                    "Saved search report"
                ],
                actions_taken=[
                    f"Searched for: {query}",
                    f"Search type: {search_type}",
                    f"Generated search report"
                ]
            )

            return search_results

        except Exception as e:
            return f"Error performing web search: {str(e)}"

    @override
    def response_validator(self, message):
        return message

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

