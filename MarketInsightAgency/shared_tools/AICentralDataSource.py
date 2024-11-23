from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Optional, Dict, Any, List
import openai
from datetime import datetime

class AICentralDataSource(BaseTool):
    """
    Central AI data source that replaces all external APIs and databases.
    This tool serves as the single source of truth for all data needs in the agency.
    """
    
    query_type: str = Field(
        ...,
        description="Type of data needed (e.g., 'market_data', 'competitor_data', 'customer_data', 'financial_data', 'trend_data')"
    )
    
    parameters: Dict[str, Any] = Field(
        ...,
        description="Parameters to guide the AI in generating appropriate data"
    )
    
    context: Optional[str] = Field(
        default=None,
        description="Additional context to help generate more accurate and relevant data"
    )
    
    output_format: str = Field(
        default="structured",
        description="Format of the output (structured, raw, metrics, analysis)"
    )

    def run(self) -> str:
        try:
            # Define data generation prompts for different types
            data_prompts = {
                "market_data": """Generate realistic market data including:
                - Market size and growth rates
                - Market segments and shares
                - Key performance indicators
                - Industry benchmarks""",
                
                "competitor_data": """Generate realistic competitor information including:
                - Market positioning
                - Product offerings
                - Pricing strategies
                - Competitive advantages
                - Recent developments""",
                
                "customer_data": """Generate realistic customer data including:
                - Demographics
                - Behavior patterns
                - Preferences
                - Satisfaction metrics
                - Purchase history""",
                
                "financial_data": """Generate realistic financial data including:
                - Revenue figures
                - Growth metrics
                - Profit margins
                - Market valuations
                - Investment trends""",
                
                "trend_data": """Generate realistic trend analysis including:
                - Emerging patterns
                - Consumer behaviors
                - Technology adoption
                - Market shifts
                - Future predictions""",
                
                "social_media_data": """Generate realistic social media metrics including:
                - Engagement rates
                - Sentiment analysis
                - Content performance
                - Audience growth
                - Platform-specific trends""",
                
                "product_data": """Generate realistic product information including:
                - Feature comparisons
                - Performance metrics
                - User feedback
                - Market fit analysis
                - Development roadmap"""
            }
            
            # Get the appropriate prompt
            base_prompt = data_prompts.get(
                self.query_type,
                "Generate comprehensive and realistic data based on the provided parameters."
            )
            
            # Add format-specific instructions
            format_instructions = {
                "structured": "Format the response as a structured dataset with clear categories and metrics.",
                "raw": "Provide the data in a detailed narrative format with specific examples and figures.",
                "metrics": "Focus on quantitative metrics and statistical measures.",
                "analysis": "Provide in-depth analysis with insights and recommendations."
            }
            
            # Construct the message
            messages = [
                {"role": "system", "content": f"{base_prompt}\n\n{format_instructions[self.output_format]}"},
                {"role": "user", "content": f"Parameters: {str(self.parameters)}"}
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
            
            # Format the response
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            result = response.choices[0].message.content
            
            formatted_output = f"""# AI-Generated {self.query_type.replace('_', ' ').title()} Report
Generated: {timestamp}

## Query Parameters
{self._format_dict(self.parameters)}

## Generated Data
{result}

---
*Generated by AI Central Data Source*
"""
            return formatted_output
            
        except Exception as e:
            return f"Error generating data: {str(e)}"

    def _format_dict(self, d: Dict[str, Any], indent: int = 0) -> str:
        """Helper method to format dictionary nicely in markdown"""
        result = ""
        for key, value in d.items():
            result += "  " * indent + f"- **{key}**: {value}\n"
        return result

if __name__ == "__main__":
    # Test the tool
    tool = AICentralDataSource(
        query_type="competitor_data",
        parameters={
            "industry": "Technology",
            "timeframe": "Last 3 months",
            "companies": ["Company A", "Company B"],
            "focus_areas": ["market_share", "product_strategy"]
        },
        context="Focus on AI and machine learning developments",
        output_format="analysis"
    )
    print(tool.run()) 