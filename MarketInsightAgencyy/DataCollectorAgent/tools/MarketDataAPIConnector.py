from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import os

# Define API keys and endpoints for different market data providers
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
ALPHA_VANTAGE_ENDPOINT = "https://www.alphavantage.co/query"

IEX_CLOUD_API_KEY = os.getenv("IEX_CLOUD_API_KEY")
IEX_CLOUD_ENDPOINT = "https://cloud.iexapis.com/stable"

class MarketDataAPIConnector(BaseTool):
    """
    This tool connects to various market data APIs to fetch real-time and historical market data.
    It supports multiple APIs, allowing the agent to switch between them as needed.
    The tool handles authentication, data requests, and error handling for each API.
    """

    api_provider: str = Field(
        ..., description="The market data API provider to use (e.g., 'alpha_vantage', 'iex_cloud')."
    )
    symbol: str = Field(
        ..., description="The stock symbol for which to fetch market data."
    )
    data_type: str = Field(
        ..., description="The type of data to fetch ('real_time' or 'historical')."
    )

    def run(self):
        """
        Connects to the specified market data API and fetches the requested data.
        Handles authentication and error handling for each API.
        """
        if self.api_provider == "alpha_vantage":
            return self._fetch_from_alpha_vantage()
        elif self.api_provider == "iex_cloud":
            return self._fetch_from_iex_cloud()
        else:
            return "Unsupported API provider."

    def _fetch_from_alpha_vantage(self):
        try:
            params = {
                "function": "TIME_SERIES_INTRADAY" if self.data_type == "real_time" else "TIME_SERIES_DAILY",
                "symbol": self.symbol,
                "interval": "1min",
                "apikey": ALPHA_VANTAGE_API_KEY
            }
            response = requests.get(ALPHA_VANTAGE_ENDPOINT, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return f"Error fetching data from Alpha Vantage: {e}"

    def _fetch_from_iex_cloud(self):
        try:
            endpoint = f"{IEX_CLOUD_ENDPOINT}/stock/{self.symbol}/quote" if self.data_type == "real_time" else f"{IEX_CLOUD_ENDPOINT}/stock/{self.symbol}/chart/1m"
            params = {
                "token": IEX_CLOUD_API_KEY
            }
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return f"Error fetching data from IEX Cloud: {e}"