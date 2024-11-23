from agency_swarm.tools import BaseTool
from pydantic import Field
import requests
import pandas as pd
import os

# Define your Alpha Vantage API key as a global constant
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

class MarketDataRetrievalTool(BaseTool):
    """
    This tool retrieves market data for a given stock symbol using the Alpha Vantage API.
    It returns the data in a format suitable for analysis with pandas.
    """

    symbol: str = Field(
        ..., description="The stock symbol for which to retrieve market data."
    )
    function: str = Field(
        ..., description="The type of data to retrieve (e.g., TIME_SERIES_DAILY, TIME_SERIES_INTRADAY)."
    )
    interval: str = Field(
        None, description="The interval between data points (e.g., 1min, 5min) for intraday data."
    )

    def run(self):
        """
        Retrieves market data for the specified stock symbol and function.
        Returns the data as a pandas DataFrame.
        """
        # Construct the API request URL
        base_url = "https://www.alphavantage.co/query"
        params = {
            "function": self.function,
            "symbol": self.symbol,
            "apikey": ALPHA_VANTAGE_API_KEY
        }
        
        if self.function == "TIME_SERIES_INTRADAY" and self.interval:
            params["interval"] = self.interval

        # Make the API request
        response = requests.get(base_url, params=params)
        data = response.json()

        # Parse the JSON response into a pandas DataFrame
        if self.function == "TIME_SERIES_DAILY":
            time_series_key = "Time Series (Daily)"
        elif self.function == "TIME_SERIES_INTRADAY":
            time_series_key = f"Time Series ({self.interval})"
        else:
            return "Unsupported function type."

        if time_series_key not in data:
            return f"Error retrieving data: {data.get('Error Message', 'Unknown error')}"

        df = pd.DataFrame.from_dict(data[time_series_key], orient='index')
        df.index = pd.to_datetime(df.index)
        df = df.sort_index()

        # Return the data as a pandas DataFrame
        return df

# Example usage:
# tool = MarketDataRetrievalTool(symbol="AAPL", function="TIME_SERIES_DAILY")
# result = tool.run()
# print(result)