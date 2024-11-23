from agency_swarm.agents import Agent
from shared_tools.AICentralDataSource import AICentralDataSource
from shared_tools.MarkdownWriter import MarkdownWriter
from shared_tools.TaskReporter import TaskReporter
from datetime import datetime

class MarketAnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="MarketAnalysisAgent",
            description="This agent generates and analyzes market data using AI.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[AICentralDataSource, MarkdownWriter, TaskReporter],
            tools_folder="./tools",
            temperature=0.7,
            max_prompt_tokens=4000,
            model="gpt-4-1106-preview"
        )

    def analyze_market(self, industry, region=None):
        try:
            # 1. Generate Market Size and Growth Data
            market_metrics = self.tools["AICentralDataSource"].run(
                query_type="market_data",
                parameters={
                    "industry": industry,
                    "region": region,
                    "focus": "metrics",
                    "data_points": [
                        "market_size",
                        "growth_rate",
                        "market_segments",
                        "revenue_potential"
                    ]
                },
                context=f"Generate realistic market metrics for {industry} in {region}",
                output_format="structured"
            )

            # 2. Generate Competitive Landscape Data
            competitive_data = self.tools["AICentralDataSource"].run(
                query_type="competitor_data",
                parameters={
                    "industry": industry,
                    "region": region,
                    "aspects": [
                        "major_players",
                        "market_share",
                        "competitive_advantages",
                        "strategic_moves"
                    ]
                },
                context=f"Generate detailed competitive analysis for {industry} in {region}",
                output_format="analysis"
            )

            # 3. Generate Consumer Behavior Insights
            consumer_insights = self.tools["AICentralDataSource"].run(
                query_type="customer_data",
                parameters={
                    "industry": industry,
                    "region": region,
                    "focus_areas": [
                        "preferences",
                        "buying_patterns",
                        "demographics",
                        "pain_points"
                    ]
                },
                context=f"Generate consumer behavior insights for {industry} in {region}",
                output_format="analysis"
            )

            # 4. Generate Future Trends and Predictions
            future_trends = self.tools["AICentralDataSource"].run(
                query_type="trend_data",
                parameters={
                    "industry": industry,
                    "region": region,
                    "timeframe": "next 5 years",
                    "aspects": [
                        "technology_trends",
                        "market_evolution",
                        "consumer_shifts",
                        "regulatory_changes"
                    ]
                },
                context=f"Generate future market trends for {industry} in {region}",
                output_format="analysis"
            )

            # 5. AI Analysis of Generated Data
            strategic_analysis = self.tools["AICentralDataSource"].run(
                query_type="analysis",
                parameters={
                    "market_data": market_metrics,
                    "competitive_data": competitive_data,
                    "consumer_data": consumer_insights,
                    "trend_data": future_trends,
                    "analysis_focus": [
                        "opportunities",
                        "threats",
                        "recommendations",
                        "strategic_implications"
                    ]
                },
                context=f"Analyze all generated data for {industry} in {region}",
                output_format="analysis"
            )

            # Create comprehensive report
            report_content = f"""# Market Analysis Report: {industry} in {region}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Executive Summary
{strategic_analysis}

## Market Size and Growth Analysis
{market_metrics}

## Competitive Landscape
{competitive_data}

## Consumer Insights
{consumer_insights}

## Future Trends and Predictions
{future_trends}

## Strategic Recommendations
Based on AI analysis of all generated data:
{strategic_analysis}
"""

            # Save report
            report_path = f"./reports/{industry.lower().replace(' ', '_')}_{region.lower().replace(' ', '_')}_analysis.md"
            self.tools["MarkdownWriter"].run(
                content=report_content,
                file_path=report_path,
                metadata={
                    "industry": industry,
                    "region": region,
                    "analysis_date": datetime.now().strftime("%Y-%m-%d"),
                    "analysis_type": "AI-Generated Market Analysis"
                }
            )

            # Create task report
            self.tools["TaskReporter"].run(
                task_name=f"Market Analysis - {industry} in {region}",
                task_description="AI-powered market analysis and data generation",
                findings=[
                    "Generated and analyzed market size and growth data",
                    "Generated and analyzed competitive landscape",
                    "Generated and analyzed consumer insights",
                    "Generated and analyzed future trends",
                    "Performed strategic analysis of all generated data"
                ],
                actions_taken=[
                    "Generated market metrics using AI",
                    "Generated competitive analysis using AI",
                    "Generated consumer insights using AI",
                    "Generated future trends using AI",
                    "Performed AI-powered strategic analysis",
                    "Created comprehensive market analysis report"
                ],
                recommendations=strategic_analysis.split("\n")[-5:] if strategic_analysis else []
            )

            return f"Market analysis completed successfully. Report saved to {report_path}"

        except Exception as e:
            return f"Error in market analysis: {str(e)}"

    def response_validator(self, message):
        return message
