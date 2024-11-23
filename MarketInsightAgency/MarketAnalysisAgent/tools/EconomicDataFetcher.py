from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os

# Constants for API access
ECONOMIC_API_URL = "https://api.economicdata.com"  # Replace with actual API URL
ECONOMIC_API_KEY = os.getenv("ECONOMIC_API_KEY")

class EconomicDataFetcher(BaseTool):
    """
    This tool connects to economic data sources and APIs to gather relevant market information.
    It handles authentication, data requests, and error handling for each API.
    The tool can fetch both real-time and historical economic data.
    """

    endpoint: str = Field(
        ..., description="The specific API endpoint to fetch data from (e.g., '/real-time', '/historical')."
    )
    params: dict = Field(
        default_factory=dict, description="Optional query parameters for the API request."
    )

    def run(self):
        """
        Connects to the specified economic data API endpoint and retrieves market information.
        Handles authentication, data requests, and error handling.
        """
        try:
            # Set up headers for authentication
            headers = {
                "Authorization": f"Bearer {ECONOMIC_API_KEY}",
                "Accept": "application/json"
            }

            # Make the API request
            response = requests.get(f"{ECONOMIC_API_URL}{self.endpoint}", headers=headers, params=self.params)
            response.raise_for_status()

            # Return the JSON response data
            return response.json()

        except requests.exceptions.HTTPError as http_err:
            return f"HTTP error occurred: {http_err}"
        except requests.exceptions.RequestException as req_err:
            return f"Request error occurred: {req_err}"
        except Exception as e:
            return f"An error occurred: {e}"