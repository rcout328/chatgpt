from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Optional, Dict, Any, List
import openai
from datetime import datetime

class AIDataAnalyzer(BaseTool):
    """
    A universal tool for replacing API calls with AI-powered analysis.
    This tool uses GPT to simulate and generate data that would normally come from external APIs.
    """
    
    query_type: str = Field(
        ...,
        description="Type of analysis/data needed (e.g., 'web_scraping', 'sentiment_analysis', 'market_data', 'social_media_metrics')"
    )
    
    query_params: Dict[str, Any] = Field(
        ...,
        description="Parameters that would normally go to an API, now used to guide the AI analysis"
    )
    
    context: Optional[str] = Field(
        default=None,
        description="Additional context to help the AI generate more accurate responses"
    )

    def run(self) -> str:
        try:
            # Define prompts for different types of data analysis
            prompts = {
                "web_scraping": """Act as a web scraping tool. Based on the provided parameters, generate realistic website data for:
                - Content structure
                - Key information
                - Relevant metrics
                Format the response as if it was scraped from a real website.""",
                
                "sentiment_analysis": """Act as a sentiment analysis API. Analyze the text and provide:
                - Sentiment scores (positive/negative/neutral)
                - Key phrases
                - Emotional indicators
                - Confidence scores""",
                
                "market_data": """Act as a market data API. Generate realistic market data including:
                - Market trends
                - Competitor metrics
                - Industry statistics
                - Growth indicators""",
                
                "social_media_metrics": """Act as a social media analytics API. Generate realistic metrics for:
                - Engagement rates
                - Follower growth
                - Content performance
                - Audience demographics""",
                
                "competitor_data": """Act as a competitor analysis tool. Generate realistic competitive intelligence:
                - Market positioning
                - Product offerings
                - Pricing strategies
                - Recent developments""",
                
                "customer_feedback": """Act as a customer feedback analysis tool. Generate realistic customer insights:
                - Satisfaction metrics
                - Common complaints
                - Positive feedback
                - Improvement suggestions"""
            }
            
            # Get the appropriate prompt
            base_prompt = prompts.get(
                self.query_type,
                "Generate realistic data based on the provided parameters."
            )
            
            # Construct the message
            messages = [
                {"role": "system", "content": base_prompt},
                {"role": "user", "content": f"Parameters: {str(self.query_params)}"}
            ]
            
            if self.context:
                messages.append({"role": "user", "content": f"Additional context: {self.context}"})
            
            # Get AI response
            response = openai.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            # Format the response as a structured report
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            result = response.choices[0].message.content
            
            formatted_output = f"""# AI-Generated {self.query_type.replace('_', ' ').title()} Report
Generated: {timestamp}

## Query Parameters
{self._format_dict(self.query_params)}

## Analysis Results
{result}

---
*Generated using AI analysis*
"""
            return formatted_output
            
        except Exception as e:
            return f"Error in AI analysis: {str(e)}"

    def _format_dict(self, d: Dict[str, Any], indent: int = 0) -> str:
        """Helper method to format dictionary nicely in markdown"""
        result = ""
        for key, value in d.items():
            result += "  " * indent + f"- **{key}**: {value}\n"
        return result

if __name__ == "__main__":
    # Test the tool
    tool = AIDataAnalyzer(
        query_type="market_data",
        query_params={
            "industry": "Technology",
            "timeframe": "Last 3 months",
            "competitors": ["Company A", "Company B"],
            "metrics": ["market_share", "revenue_growth"]
        },
        context="Focus on emerging technology trends in AI and machine learning"
    )
    print(tool.run()) 