from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Optional, Dict, Any, List
import os
from datetime import datetime
import openai
from dotenv import load_dotenv

class GPTDataProcessor(BaseTool):
    """
    A tool for processing data using GPT models and generating insights.
    This tool can be used to analyze text, generate reports, and extract insights using LLM capabilities.
    """
    
    input_text: str = Field(
        ...,
        description="The text input to be processed by the GPT model"
    )
    
    task_type: str = Field(
        ...,
        description="Type of analysis to perform (e.g., 'market_analysis', 'sentiment_analysis', 'competitor_analysis')"
    )
    
    model: str = Field(
        default="gpt-4-1106-preview",
        description="The GPT model to use for processing"
    )
    
    additional_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context or parameters for the analysis"
    )
    
    output_format: str = Field(
        default="markdown",
        description="Format of the output (markdown, json, text)"
    )

    def run(self) -> str:
        try:
            # Prepare the system message based on task type
            system_messages = {
                "market_analysis": """You are a market analysis expert. Analyze the provided data and generate insights about:
                - Market trends
                - Growth opportunities
                - Potential challenges
                - Strategic recommendations""",
                
                "sentiment_analysis": """You are a sentiment analysis expert. Analyze the provided text and determine:
                - Overall sentiment (positive, negative, neutral)
                - Key emotional indicators
                - Sentiment trends
                - Notable patterns""",
                
                "competitor_analysis": """You are a competitor analysis expert. Analyze the provided data and identify:
                - Competitor strengths and weaknesses
                - Market positioning
                - Competitive advantages
                - Strategic moves""",
            }
            
            system_message = system_messages.get(
                self.task_type,
                "You are an AI expert. Analyze the provided data and generate comprehensive insights."
            )
            
            # Prepare messages for GPT
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": self.input_text}
            ]
            
            # Add additional context if provided
            if self.additional_context:
                context_message = "\n\nAdditional Context:\n"
                for key, value in self.additional_context.items():
                    context_message += f"- {key}: {value}\n"
                messages.append({"role": "user", "content": context_message})
            
            # Get response from GPT
            response = openai.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            analysis_result = response.choices[0].message.content
            
            # Format the output
            if self.output_format == "markdown":
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                formatted_output = f"""# {self.task_type.replace('_', ' ').title()} Report
Generated: {timestamp}

{analysis_result}

---
*Generated using {self.model}*
"""
            else:
                formatted_output = analysis_result
            
            return formatted_output
            
        except Exception as e:
            return f"Error processing data with GPT: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    test_input = """
    Company A has launched a new product line targeting young professionals.
    Their social media engagement has increased by 45% in the last quarter.
    Customer feedback indicates high satisfaction but concerns about pricing.
    """
    
    tool = GPTDataProcessor(
        input_text=test_input,
        task_type="market_analysis",
        additional_context={
            "industry": "Technology",
            "target_market": "Young Professionals",
            "time_period": "Q3 2023"
        }
    )
    print(tool.run()) 