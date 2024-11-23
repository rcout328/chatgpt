from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

class TaskReporter(BaseTool):
    """
    A tool for generating comprehensive task reports in markdown format.
    This tool helps agents document their activities, findings, and results.
    """
    
    task_name: str = Field(
        ...,
        description="Name or title of the task"
    )
    
    task_description: str = Field(
        ...,
        description="Detailed description of the task"
    )
    
    findings: List[str] = Field(
        ...,
        description="List of key findings or results"
    )
    
    actions_taken: List[str] = Field(
        ...,
        description="List of actions taken during the task"
    )
    
    recommendations: Optional[List[str]] = Field(
        default=None,
        description="Optional list of recommendations based on findings"
    )
    
    additional_info: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Any additional information to include in the report"
    )
    
    output_dir: str = Field(
        default="./reports",
        description="Directory where the report should be saved"
    )

    def run(self) -> str:
        try:
            # Create output directory if it doesn't exist
            os.makedirs(self.output_dir, exist_ok=True)
            
            # Generate filename based on task name and timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_task_name = "".join(c if c.isalnum() else "_" for c in self.task_name)
            filename = f"{safe_task_name}_{timestamp}.md"
            file_path = os.path.join(self.output_dir, filename)
            
            # Prepare report content
            content = f"""# {self.task_name}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Task Description
{self.task_description}

## Actions Taken
{"".join(f'- {action}\n' for action in self.actions_taken)}

## Key Findings
{"".join(f'- {finding}\n' for finding in self.findings)}
"""
            
            # Add recommendations if provided
            if self.recommendations:
                content += "\n## Recommendations\n"
                content += "".join(f"- {rec}\n" for rec in self.recommendations)
            
            # Add additional information if provided
            if self.additional_info:
                content += "\n## Additional Information\n"
                for key, value in self.additional_info.items():
                    content += f"\n### {key}\n{value}\n"
            
            # Write the report
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return f"Task report generated successfully at {file_path}"
            
        except Exception as e:
            return f"Error generating task report: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    tool = TaskReporter(
        task_name="Market Analysis",
        task_description="Analysis of competitor pricing strategies",
        findings=[
            "Competitor A reduced prices by 10%",
            "Competitor B introduced new premium tier"
        ],
        actions_taken=[
            "Collected pricing data from all competitors",
            "Analyzed historical price trends",
            "Identified pricing patterns"
        ],
        recommendations=[
            "Consider adjusting our premium tier pricing",
            "Monitor Competitor A's customer retention"
        ],
        additional_info={
            "Data Sources": "Web scraping, Public reports",
            "Analysis Period": "Q3 2023"
        }
    )
    print(tool.run()) 