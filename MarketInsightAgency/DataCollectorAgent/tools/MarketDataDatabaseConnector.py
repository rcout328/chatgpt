from agency_swarm.tools import BaseTool
from pydantic import Field
import os
import psycopg2  # For PostgreSQL
import pymongo  # For MongoDB

# Define connection details for different databases
POSTGRESQL_DB_URL = os.getenv("POSTGRESQL_DB_URL")
MONGODB_URI = os.getenv("MONGODB_URI")

class MarketDataDatabaseConnector(BaseTool):
    """
    This tool connects to various databases to fetch market data.
    It supports different types of databases such as SQL and NoSQL.
    The tool handles authentication, data queries, and error handling for each database type.
    """

    db_type: str = Field(
        ..., description="The type of database to connect to (e.g., 'postgresql', 'mongodb')."
    )
    query: str = Field(
        ..., description="The query to execute on the database."
    )

    def run(self):
        """
        Connects to the specified database and executes the provided query.
        Handles authentication and error handling for each database type.
        """
        if self.db_type == "postgresql":
            return self._fetch_from_postgresql()
        elif self.db_type == "mongodb":
            return self._fetch_from_mongodb()
        else:
            return "Unsupported database type."

    def _fetch_from_postgresql(self):
        try:
            # Connect to PostgreSQL database
            conn = psycopg2.connect(POSTGRESQL_DB_URL)
            cursor = conn.cursor()
            cursor.execute(self.query)
            result = cursor.fetchall()
            cursor.close()
            conn.close()
            return result
        except psycopg2.DatabaseError as e:
            return f"Error fetching data from PostgreSQL: {e}"

    def _fetch_from_mongodb(self):
        try:
            # Connect to MongoDB
            client = pymongo.MongoClient(MONGODB_URI)
            db = client.get_default_database()
            # Assuming the query is a JSON-like dictionary for MongoDB
            collection_name, query_filter = self.query.split(":", 1)
            collection = db[collection_name.strip()]
            result = list(collection.find(eval(query_filter.strip())))
            client.close()
            return result
        except pymongo.errors.PyMongoError as e:
            return f"Error fetching data from MongoDB: {e}"