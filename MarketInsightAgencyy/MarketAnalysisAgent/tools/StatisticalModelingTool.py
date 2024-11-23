from agency_swarm.tools import BaseTool
from pydantic import Field
import pandas as pd
import numpy as np
import statsmodels.api as sm
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns
from statsmodels.tsa.arima.model import ARIMA

class StatisticalModelingTool(BaseTool):
    """
    This tool uses statistical modeling libraries such as statsmodels and scikit-learn to analyze economic data.
    It applies techniques like regression analysis, time series forecasting, and clustering to extract insights.
    The tool generates reports and visualizations to communicate findings.
    """

    data: pd.DataFrame = Field(
        ..., description="The economic data to be analyzed, provided as a pandas DataFrame."
    )
    target_variable: str = Field(
        ..., description="The target variable for regression analysis."
    )
    time_series_column: str = Field(
        ..., description="The column name representing the time series data."
    )
    n_clusters: int = Field(
        3, description="The number of clusters for clustering analysis."
    )

    def run(self):
        """
        Analyzes the provided economic data using statistical modeling techniques.
        Generates reports and visualizations to communicate findings.
        """
        # Perform regression analysis
        regression_results = self._perform_regression_analysis()

        # Perform time series forecasting
        time_series_forecast = self._perform_time_series_forecasting()

        # Perform clustering analysis
        clustering_results = self._perform_clustering_analysis()

        # Generate visualizations
        self._generate_visualizations()

        return {
            "regression_results": regression_results,
            "time_series_forecast": time_series_forecast,
            "clustering_results": clustering_results
        }

    def _perform_regression_analysis(self):
        """
        Performs regression analysis on the economic data.
        """
        X = self.data.drop(columns=[self.target_variable])
        y = self.data[self.target_variable]
        X = sm.add_constant(X)  # Add a constant term for the intercept

        model = sm.OLS(y, X).fit()
        return model.summary().as_text()

    def _perform_time_series_forecasting(self):
        """
        Performs time series forecasting using ARIMA.
        """
        ts_data = self.data.set_index(self.time_series_column)
        model = ARIMA(ts_data[self.target_variable], order=(1, 1, 1))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=5)
        return forecast

    def _perform_clustering_analysis(self):
        """
        Performs clustering analysis on the economic data.
        """
        X = self.data.drop(columns=[self.target_variable])
        kmeans = KMeans(n_clusters=self.n_clusters, random_state=42)
        self.data['Cluster'] = kmeans.fit_predict(X)
        return self.data['Cluster'].value_counts()

    def _generate_visualizations(self):
        """
        Generates visualizations for the analysis.
        """
        # Regression plot
        sns.pairplot(self.data, kind='reg')
        plt.title('Regression Analysis')
        plt.show()

        # Time series plot
        plt.figure(figsize=(10, 6))
        plt.plot(self.data[self.time_series_column], self.data[self.target_variable], label='Actual')
        plt.title('Time Series Data')
        plt.xlabel('Time')
        plt.ylabel(self.target_variable)
        plt.legend()
        plt.show()

        # Clustering plot
        sns.scatterplot(x=self.data.columns[0], y=self.data.columns[1], hue='Cluster', data=self.data)
        plt.title('Clustering Analysis')
        plt.show()