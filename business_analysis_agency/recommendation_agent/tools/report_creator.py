from agency_swarm.tools import BaseTool
from pydantic import Field
from dotenv import load_dotenv
import sys
from pathlib import Path

# Add the project root to Python path
project_root = str(Path(__file__).parent.parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from utils.openai_config import client

load_dotenv()

class ReportCreator(BaseTool):
    """
    A tool for creating comprehensive business analysis reports that combine insights, 
    data, and recommendations into a well-structured document.
    """
    
    insights: str = Field(
        ...,
        description="Generated insights and recommendations to include in the report"
    )
    
    analysis_data: str = Field(
        ...,
        description="Raw analysis data and findings to support the insights"
    )
    
    target_audience: str = Field(
        default="business stakeholders",
        description="The intended audience for the report (e.g., executives, stakeholders, team)"
    )

    def run(self):
        """
        Creates a structured business report combining insights and analysis data.
        """
        try:
            prompt = f"""
            Create a professional business analysis report based on the following information:
            
            Insights and Recommendations:
            {self.insights}
            
            Supporting Analysis Data:
            {self.analysis_data}
            
            Target Audience: {self.target_audience}
            
            Please structure the report with the following sections:
            1. Executive Summary
            2. Key Findings
            3. Detailed Analysis
            4. Recommendations
            5. Implementation Considerations
            6. Conclusion
            
            Format the report professionally and ensure it's appropriate for the target audience.
            """
            
            response = client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": "You are an expert business report writer who creates clear, professional, and actionable reports."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=2000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error creating report: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    test_insights = """
    Key Insights:
    1. Market shows strong growth potential
    2. Two major competitors dominate 60% of market share
    3. Customer sentiment is positive
    
    Recommendations:
    1. Enter market with differentiated offering
    2. Focus on remaining 40% market share
    3. Leverage positive customer sentiment
    """
    
    test_analysis = """
    Market Analysis:
    - Market size: $5B
    - Growth rate: 12% YoY
    - Key players: Company A (35%), Company B (25%)
    - Sentiment score: 0.75 positive
    """
    
    creator = ReportCreator(
        insights=test_insights,
        analysis_data=test_analysis,
        target_audience="executive team"
    )
    print(creator.run()) 