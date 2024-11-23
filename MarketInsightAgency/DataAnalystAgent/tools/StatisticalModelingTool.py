from agency_swarm.tools import BaseTool
from pydantic import Field, ConfigDict
from typing import Dict, List, Union, Optional
import numpy as np

class StatisticalModelingTool(BaseTool):
    """
    A tool for performing statistical analysis and modeling using AI-powered analysis instead of pandas.
    """
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    data: Dict[str, List[float]] = Field(
        ...,
        description="Data dictionary with column names as keys and numeric lists as values"
    )
    
    target_column: str = Field(
        ...,
        description="Name of the target variable column"
    )
    
    feature_columns: List[str] = Field(
        ...,
        description="List of feature column names to use in the model"
    )
    
    model_type: str = Field(
        "linear",
        description="Type of statistical model to use (linear, logistic)"
    )

    def run(self) -> str:
        try:
            # Extract features and target
            X = np.array([self.data[col] for col in self.feature_columns]).T
            y = np.array(self.data[self.target_column])
            
            # Add constant term
            X = np.column_stack([np.ones(len(X)), X])
            
            # Simple linear regression implementation
            if self.model_type.lower() == "linear":
                # Calculate coefficients using normal equation
                beta = np.linalg.inv(X.T @ X) @ X.T @ y
                
                # Calculate predictions and metrics
                y_pred = X @ beta
                mse = np.mean((y - y_pred) ** 2)
                r2 = 1 - np.sum((y - y_pred) ** 2) / np.sum((y - np.mean(y)) ** 2)
                
                # Format results
                results = (
                    f"Model Summary:\n"
                    f"-------------\n"
                    f"Model Type: {self.model_type}\n"
                    f"Mean Squared Error: {mse:.4f}\n"
                    f"R-squared: {r2:.4f}\n\n"
                    f"Coefficients:\n"
                )
                
                for i, col in enumerate(['intercept'] + self.feature_columns):
                    results += f"{col}: {beta[i]:.4f}\n"
                
                return results
                
            else:
                return "Currently only linear regression is supported"
            
        except Exception as e:
            return f"Error in statistical modeling: {str(e)}"

if __name__ == "__main__":
    # Test data
    test_data = {
        "x": [1, 2, 3, 4, 5],
        "y": [2.1, 3.8, 5.2, 6.9, 8.3]
    }
    
    tool = StatisticalModelingTool(
        data=test_data,
        target_column="y",
        feature_columns=["x"],
        model_type="linear"
    )
    print(tool.run()) 