from agency_swarm.tools import BaseTool
from pydantic import Field, ConfigDict
import pandas as pd
from typing import Any, Dict, List, Optional
import statsmodels.api as sm
import numpy as np

class StatisticalModelingTool(BaseTool):
    """
    A tool for performing statistical analysis and modeling on data.
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
        """
        Run statistical analysis and modeling on the provided data.
        """
        try:
            # Convert dictionary to DataFrame
            df = pd.DataFrame(self.data)
            
            # Prepare features and target
            X = df[self.feature_columns]
            y = df[self.target_column]
            
            # Add constant for statsmodels
            X = sm.add_constant(X)
            
            # Fit model based on type
            if self.model_type.lower() == "linear":
                model = sm.OLS(y, X).fit()
            elif self.model_type.lower() == "logistic":
                model = sm.Logit(y, X).fit()
            else:
                return f"Unsupported model type: {self.model_type}"
            
            # Generate summary statistics
            summary = model.summary()
            
            # Calculate additional metrics
            predictions = model.predict(X)
            mse = np.mean((y - predictions) ** 2)
            r2 = model.rsquared if hasattr(model, 'rsquared') else None
            
            # Format results
            results = (
                f"Model Summary:\n"
                f"-------------\n"
                f"Model Type: {self.model_type}\n"
                f"Mean Squared Error: {mse:.4f}\n"
            )
            
            if r2 is not None:
                results += f"R-squared: {r2:.4f}\n"
            
            results += f"\nDetailed Summary:\n{str(summary)}"
            
            return results
            
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