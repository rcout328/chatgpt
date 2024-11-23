from agency_swarm.tools import BaseTool
from pydantic import Field
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

class CustomerProfileGenerator(BaseTool):
    """
    This tool utilizes pandas to clean and preprocess CRM and demographic data.
    It uses scikit-learn to apply machine learning techniques for identifying patterns and segments within the data.
    The tool generates detailed customer profiles highlighting key characteristics and behaviors.
    """

    data: str = Field(
        ..., description="The CRM and demographic data in CSV format to be processed."
    )
    n_clusters: int = Field(
        3, description="The number of clusters to identify in the data."
    )

    def run(self):
        """
        Cleans, preprocesses, and analyzes the provided CRM and demographic data.
        Identifies patterns and segments, and generates detailed customer profiles.
        """
        # Load data into a Pandas DataFrame
        data_io = pd.io.common.StringIO(self.data)
        df = pd.read_csv(data_io)

        # Data cleaning and preprocessing
        df_cleaned = self._clean_data(df)

        # Feature scaling
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df_cleaned)

        # Apply KMeans clustering
        kmeans = KMeans(n_clusters=self.n_clusters, random_state=42)
        df_cleaned['Cluster'] = kmeans.fit_predict(scaled_data)

        # Apply PCA for dimensionality reduction
        pca = PCA(n_components=2)
        df_cleaned['PCA1'], df_cleaned['PCA2'] = pca.fit_transform(scaled_data).T

        # Generate customer profiles
        profiles = self._generate_profiles(df_cleaned)

        return profiles

    def _clean_data(self, df):
        """
        Cleans and preprocesses the data.
        """
        # Drop missing values
        df = df.dropna()

        # Convert categorical variables to dummy/indicator variables
        df = pd.get_dummies(df, drop_first=True)

        return df

    def _generate_profiles(self, df):
        """
        Generates detailed customer profiles based on clustering results.
        """
        profiles = {}
        for cluster in df['Cluster'].unique():
            cluster_data = df[df['Cluster'] == cluster]
            profiles[cluster] = {
                "size": len(cluster_data),
                "mean_values": cluster_data.mean().to_dict(),
                "pca_coordinates": cluster_data[['PCA1', 'PCA2']].mean().tolist()
            }
        return profiles