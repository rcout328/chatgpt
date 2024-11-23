from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os

# Constants for API access
INTERCOM_API_URL = "https://api.intercom.io"
INTERCOM_ACCESS_TOKEN = os.getenv("INTERCOM_ACCESS_TOKEN")

class FeedbackAPIConnector(BaseTool):
    """
    This tool connects to feedback platforms and APIs like Intercom to gather user feedback.
    It handles authentication, data requests, and error handling for each API.
    The tool can fetch both real-time and historical feedback data.
    """

    endpoint: str = Field(
        ..., description="The specific API endpoint to fetch data from (e.g., '/conversations')."
    )
    params: dict = Field(
        default_factory=dict, description="Optional query parameters for the API request."
    )

    def run(self):
        """
        Connects to the specified feedback API endpoint and retrieves feedback data.
        Handles authentication, data requests, and error handling.
        """
        try:
            # Set up headers for authentication
            headers = {
                "Authorization": f"Bearer {INTERCOM_ACCESS_TOKEN}",
                "Accept": "application/json"
            }

            # Make the API request
            response = requests.get(f"{INTERCOM_API_URL}{self.endpoint}", headers=headers, params=self.params)
            response.raise_for_status()

            # Return the JSON response data
            return response.json()

        except requests.exceptions.HTTPError as http_err:
            return f"HTTP error occurred: {http_err}"
        except requests.exceptions.RequestException as req_err:
            return f"Request error occurred: {req_err}"
        except Exception as e:
            return f"An error occurred: {e}"