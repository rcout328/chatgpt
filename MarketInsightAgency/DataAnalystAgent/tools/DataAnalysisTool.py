from agency_swarm.tools import BaseTool
from pydantic import Field
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import io

class DataAnalysisTool(BaseTool):
    """
    This tool utilizes data analysis libraries such as Pandas and NumPy to process and analyze structured data.
    It is capable of identifying trends, patterns, and anomalies in the data.
    The tool also generates reports and visualizations to communicate findings.
    """

    data: str = Field(
        ..., description="The structured data in CSV format to be analyzed."
    )

    def run(self):
        """
        Processes and analyzes the provided structured data.
        Identifies trends, patterns, and anomalies, and generates reports and visualizations.
        """
        # Load data into a Pandas DataFrame
        data_io = io.StringIO(self.data)
        df = pd.read_csv(data_io)

        # Perform basic data analysis
        summary = self._generate_summary(df)
        trends = self._identify_trends(df)
        anomalies = self._detect_anomalies(df)

        # Generate visualizations
        visualizations = self._generate_visualizations(df)

        # Compile the report
        report = {
            "summary": summary,
            "trends": trends,
            "anomalies": anomalies,
            "visualizations": visualizations
        }

        return report

    def _generate_summary(self, df):
        """
        Generates a summary of the data including basic statistics.
        """
        summary = df.describe().to_dict()
        return summary

    def _identify_trends(self, df):
        """
        Identifies trends in the data using rolling averages.
        """
        trends = {}
        for column in df.select_dtypes(include=[np.number]).columns:
            trends[column] = df[column].rolling(window=5).mean().dropna().tolist()
        return trends

    def _detect_anomalies(self, df):
        """
        Detects anomalies in the data using z-score method.
        """
        anomalies = {}
        for column in df.select_dtypes(include=[np.number]).columns:
            z_scores = np.abs((df[column] - df[column].mean()) / df[column].std())
            anomalies[column] = df[column][z_scores > 3].tolist()
        return anomalies

    def _generate_visualizations(self, df):
        """
        Generates visualizations for the data.
        """
        visualizations = {}
        for column in df.select_dtypes(include=[np.number]).columns:
            plt.figure(figsize=(10, 6))
            sns.lineplot(data=df, x=df.index, y=column)
            plt.title(f'Trend for {column}')
            plt.xlabel('Index')
            plt.ylabel(column)
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            visualizations[column] = buf.getvalue()
            plt.close()
        return visualizations