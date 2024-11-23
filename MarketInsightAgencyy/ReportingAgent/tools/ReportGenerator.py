from agency_swarm.tools import BaseTool
from pydantic import Field, ConfigDict
import pandas as pd
from typing import Any
import matplotlib.pyplot as plt
from jinja2 import Environment, FileSystemLoader
import os

class ReportGenerator(BaseTool):
    """
    A tool for generating reports with visualizations from data.
    """
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    data: Any = Field(
        ..., 
        description="Data to be included in the report. Should be a pandas DataFrame or dict that can be converted to DataFrame."
    )
    template_dir: str = Field(
        ..., 
        description="Directory containing the Jinja2 template"
    )
    template_name: str = Field(
        ..., 
        description="Name of the Jinja2 template file"
    )
    report_output_path: str = Field(
        ..., 
        description="Output path for the generated report"
    )

    def run(self):
        """
        Generate a report with visualizations from the provided data.
        """
        # Convert data to DataFrame if it's not already
        if not isinstance(self.data, pd.DataFrame):
            try:
                self.data = pd.DataFrame(self.data)
            except Exception as e:
                return f"Error converting data to DataFrame: {str(e)}"

        try:
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(self.report_output_path), exist_ok=True)
            
            # Generate visualizations
            viz_paths = self._create_visualizations()
            
            # Generate report using template
            env = Environment(loader=FileSystemLoader(self.template_dir))
            template = env.get_template(self.template_name)
            
            report_content = template.render(
                data=self.data,
                visualizations=viz_paths
            )
            
            # Save report
            with open(self.report_output_path, 'w') as f:
                f.write(report_content)
            
            return f"Report generated successfully at {self.report_output_path}"
            
        except Exception as e:
            return f"Error generating report: {str(e)}"

    def _create_visualizations(self):
        """
        Create visualizations from the data and return their file paths.
        """
        viz_paths = []
        
        # Create visualizations directory
        viz_dir = os.path.join(os.path.dirname(self.report_output_path), 'visualizations')
        os.makedirs(viz_dir, exist_ok=True)
        
        # Generate visualizations
        try:
            # Example: Basic line plot for each numeric column
            for col in self.data.select_dtypes(include=['float64', 'int64']).columns:
                plt.figure(figsize=(10, 6))
                self.data[col].plot()
                plt.title(f'{col} Over Time')
                plt.xlabel('Index')
                plt.ylabel(col)
                
                viz_path = os.path.join(viz_dir, f'{col}_plot.png')
                plt.savefig(viz_path)
                plt.close()
                
                viz_paths.append(viz_path)
                
        except Exception as e:
            print(f"Error creating visualizations: {str(e)}")
            
        return viz_paths

if __name__ == "__main__":
    # Test data
    test_data = {
        'column1': [1, 2, 3, 4, 5],
        'column2': [2, 4, 6, 8, 10]
    }
    
    tool = ReportGenerator(
        data=test_data,
        template_dir="./templates",
        template_name="report_template.html",
        report_output_path="./output/report.html"
    )
    print(tool.run())