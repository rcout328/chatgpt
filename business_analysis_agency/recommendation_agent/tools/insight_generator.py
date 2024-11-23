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

class InsightGenerator(BaseTool):
    """
    A tool for generating business insights and recommendations based on analyzed data.
    """
    
    analysis_data: str = Field(
        ...,
        description="The analyzed data and trends to generate insights from"
    )
    
    context: str = Field(
        default="",
        description="Additional context or specific areas to focus on for insights"
    )

    def run(self):
        """
        Generates business insights and recommendations based on the provided analysis data.
        """
        try:
            prompt = f"""
            Based on the following analysis data and context, generate actionable business insights and recommendations:
            
            Analysis Data:
            {self.analysis_data}
            
            Additional Context:
            {self.context if self.context else 'No additional context provided.'}
            
            Please provide:
            1. Key Insights
            2. Actionable Recommendations
            3. Potential Risks or Considerations
            """
            
            response = client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": "You are an expert business analyst and strategic advisor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error generating insights: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    test_data = """
    Market Analysis Results:
    - Market size: $5B with 12% YoY growth
    - Key competitors: Company A (35% market share), Company B (25%)
    - Customer sentiment: Generally positive (0.75 sentiment score)
    """
    
    generator = InsightGenerator(
        analysis_data=test_data,
        context="Focus on market entry strategies and competitive positioning"
    )
    print(generator.run()) 