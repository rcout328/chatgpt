from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv

load_dotenv()

class TaskReporter(BaseTool):
    """
    A tool for reporting task status and progress to the CEO agent.
    """
    task_name: str = Field(
        ..., description="Name of the task being reported"
    )
    status: str = Field(
        ..., description="Current status of the task (e.g., 'started', 'in_progress', 'completed', 'failed')"
    )
    progress: float = Field(
        ..., description="Progress percentage (0-100)"
    )
    details: str = Field(
        ..., description="Additional details or notes about the task"
    )

    def run(self):
        """
        Report task status and progress to the CEO agent.
        """
        try:
            # Format the report message
            report_message = (
                f"Task Report:\n"
                f"Task: {self.task_name}\n"
                f"Status: {self.status}\n"
                f"Progress: {self.progress}%\n"
                f"Details: {self.details}"
            )

            # In a real implementation, you might want to:
            # 1. Log the report to a database
            # 2. Send notifications
            # 3. Update dashboards
            # 4. Trigger other workflows

            return report_message

        except Exception as e:
            error_message = f"Error reporting task: {str(e)}"
            print(error_message)
            return error_message

if __name__ == "__main__":
    # Test the tool
    reporter = TaskReporter(
        task_name="Market Analysis",
        status="in_progress",
        progress=75.0,
        details="Analyzing competitor data and market trends"
    )
    print(reporter.run()) 