from agency_swarm.tools import BaseTool
from pydantic import Field
import pandas as pd
import sqlite3

class DataLoader(BaseTool):
    """
    DataLoader tool for loading data from various sources such as CSV files, Excel files, SQL databases, and JSON files.
    This tool utilizes the pandas library to read and import data efficiently.
    """

    source_type: str = Field(
        ..., description="Type of the data source: 'csv', 'excel', 'sql', or 'json'."
    )
    file_path: str = Field(
        None, description="Path to the CSV, Excel, or JSON file. Required if source_type is 'csv', 'excel', or 'json'."
    )
    sql_query: str = Field(
        None, description="SQL query to execute. Required if source_type is 'sql'."
    )
    database_path: str = Field(
        None, description="Path to the SQLite database file. Required if source_type is 'sql'."
    )

    def run(self):
        """
        Load data from the specified source type using the provided parameters.
        """
        if self.source_type == 'csv':
            if not self.file_path:
                raise ValueError("file_path is required for CSV source type.")
            data = pd.read_csv(self.file_path)
        
        elif self.source_type == 'excel':
            if not self.file_path:
                raise ValueError("file_path is required for Excel source type.")
            data = pd.read_excel(self.file_path)
        
        elif self.source_type == 'sql':
            if not self.sql_query or not self.database_path:
                raise ValueError("sql_query and database_path are required for SQL source type.")
            conn = sqlite3.connect(self.database_path)
            data = pd.read_sql_query(self.sql_query, conn)
            conn.close()
        
        elif self.source_type == 'json':
            if not self.file_path:
                raise ValueError("file_path is required for JSON source type.")
            data = pd.read_json(self.file_path)
        
        else:
            raise ValueError("Unsupported source type. Please use 'csv', 'excel', 'sql', or 'json'.")
        
        return data