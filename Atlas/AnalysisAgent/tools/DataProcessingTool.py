from agency_swarm.tools import BaseTool
from pydantic import Field, BaseModel
import pandas as pd
import numpy as np
import nltk
from sklearn.preprocessing import StandardScaler

nltk.download('punkt')

class DataProcessingTool(BaseTool):
    """
    This tool processes collected market data to prepare it for analysis.
    It cleans the data, handles missing values, and transforms the data into a suitable format for analysis using NLTK and machine learning libraries.
    """

    data: pd.DataFrame = Field(
        ..., description="The market data to be processed, provided as a pandas DataFrame."
    )

    class Config:
        arbitrary_types_allowed = True

    def run(self):
        """
        The implementation of the run method, where the tool's main functionality is executed.
        This method cleans the data, handles missing values, and transforms the data for analysis.
        """
        # Step 1: Handle missing values
        self.data.fillna(method='ffill', inplace=True)  # Forward fill to handle missing values

        # Step 2: Clean the data
        # Example: Tokenize text data using NLTK
        if 'text_column' in self.data.columns:
            self.data['tokens'] = self.data['text_column'].apply(nltk.word_tokenize)

        # Step 3: Transform the data
        # Example: Standardize numerical features
        numerical_features = self.data.select_dtypes(include=[np.number]).columns
        scaler = StandardScaler()
        self.data[numerical_features] = scaler.fit_transform(self.data[numerical_features])

        # Return the processed DataFrame
        return self.data

# Example usage:
# df = pd.DataFrame({
#     'text_column': ['This is a test.', 'Another test sentence.'],
#     'numeric_column': [1.0, 2.0]
# })
# tool = DataProcessingTool(data=df)
# processed_data = tool.run()
# print(processed_data)