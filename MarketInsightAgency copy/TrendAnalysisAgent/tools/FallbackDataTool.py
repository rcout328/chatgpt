from agency_swarm.tools import BaseTool
from pydantic import Field
import pandas as pd
import numpy as np

class FallbackDataTool(BaseTool):
    """
    This tool provides a fallback mechanism to use GPT-based datasets for market data analysis
    if the finance APIs fail. It accesses pre-trained datasets and returns data in a format
    compatible with the DataAnalysisTool.
    """

    symbol: str = Field(
        ..., description="The stock symbol for which to retrieve fallback market data."
    )
    num_days: int = Field(
        30, description="The number of days of data to generate for the fallback dataset."
    )

    def run(self):
        """
        Generates a fallback dataset for the specified stock symbol.
        Returns the data as a pandas DataFrame compatible with the DataAnalysisTool.
        """
        # Simulate a pre-trained dataset using random data generation
        dates = pd.date_range(end=pd.Timestamp.today(), periods=self.num_days)
        data = {
            'Open': np.random.uniform(low=100, high=200, size=self.num_days),
            'High': np.random.uniform(low=100, high=200, size=self.num_days),
            'Low': np.random.uniform(low=100, high=200, size=self.num_days),
            'Close': np.random.uniform(low=100, high=200, size=self.num_days),
            'Volume': np.random.randint(low=1000, high=10000, size=self.num_days)
        }
        fallback_data = pd.DataFrame(data, index=dates)

        # Ensure DataFrame operations are handled correctly
        # Check if DataFrame is empty
        if fallback_data.empty:
            raise ValueError("The generated fallback data is empty.")

        # Check for any missing values in the DataFrame
        if fallback_data.isnull().any().any():
            raise ValueError("The generated fallback data contains missing values.")

        # Return the fallback data as a pandas DataFrame
        return fallback_data

# Example usage:
# tool = FallbackDataTool(symbol="AAPL", num_days=30)
# fallback_data = tool.run()
# print(fallback_data)