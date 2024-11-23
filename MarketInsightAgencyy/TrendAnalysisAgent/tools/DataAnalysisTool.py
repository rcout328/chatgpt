from agency_swarm.tools import BaseTool
from pydantic import Field, BaseModel
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

class DataAnalysisTool(BaseTool):
    """
    This tool processes and analyzes market data using pandas and scikit-learn.
    It performs data cleaning, feature extraction, and trend detection using a linear regression model.
    """

    data: pd.DataFrame = Field(
        ..., description="The market data as a pandas DataFrame."
    )

    class Config:
        arbitrary_types_allowed = True

    def run(self):
        """
        Processes the market data, performs feature extraction, and detects trends using a linear regression model.
        Returns the model's mean squared error and a DataFrame with predictions.
        """
        # Data Cleaning: Drop any rows with missing values
        cleaned_data = self.data.dropna()

        # Feature Extraction: Use 'Open', 'High', 'Low', 'Volume' as features
        features = cleaned_data[['Open', 'High', 'Low', 'Volume']]
        target = cleaned_data['Close']

        # Split the data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

        # Standardize the features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # Train a Linear Regression model
        model = LinearRegression()
        model.fit(X_train_scaled, y_train)

        # Make predictions
        predictions = model.predict(X_test_scaled)

        # Calculate the mean squared error
        mse = mean_squared_error(y_test, predictions)

        # Create a DataFrame with actual and predicted values
        results_df = pd.DataFrame({'Actual': y_test, 'Predicted': predictions}, index=y_test.index)

        # Return the mean squared error and the results DataFrame
        return mse, results_df

# Example usage:
# Assume 'market_data' is a pandas DataFrame with columns ['Open', 'High', 'Low', 'Close', 'Volume']
# tool = DataAnalysisTool(data=market_data)
# mse, results = tool.run()
# print("Mean Squared Error:", mse)
# print(results)