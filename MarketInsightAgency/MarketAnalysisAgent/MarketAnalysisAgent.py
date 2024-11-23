from agency_swarm.agents import Agent
from shared_tools.MarkdownWriter import MarkdownWriter
from shared_tools.TaskReporter import TaskReporter
from datetime import datetime

class MarketAnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="MarketAnalysisAgent",
            description="This agent analyzes market data using AI and search results.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[MarkdownWriter, TaskReporter],
            tools_folder="./tools",
            temperature=0.7,
            max_prompt_tokens=4000,
            model="gpt-4-1106-preview"
        )

    def analyze_market(self, product, region=None):
        try:
            # Use DataCollector's search results to gather information
            search_queries = [
                f"{product} sales in {region if region else 'global market'}",
                f"{product} market trends {region if region else 'worldwide'}",
                f"{product} customer demographics {region if region else 'global'}",
                f"{product} market share {region if region else 'worldwide'}"
            ]

            # Collect and analyze data for each aspect
            market_data = {}
            for query in search_queries:
                results = self.send_message("DataCollector", f"Search for: {query}")
                market_data[query] = results

            # Create comprehensive report
            report_content = f"""# Market Analysis Report: {product} in {region if region else 'Global Market'}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Market Overview
Based on the search results, here are some relevant insights regarding {product} in {region if region else 'the global market'}:

### Key Market Insights
{self._format_market_insights(market_data)}

### Sales and Growth
{self._format_sales_data(market_data)}

### Market Trends
{self._format_trends(market_data)}

### Customer Demographics
{self._format_demographics(market_data)}

### Additional Insights
{self._format_additional_insights(market_data)}

Note: This analysis is based on available search data and may require further verification for specific details."""

            # Save report
            report_path = f"./reports/{product.lower().replace(' ', '_')}_{region.lower().replace(' ', '_') if region else 'global'}_analysis.md"
            self.tools["MarkdownWriter"].run(
                content=report_content,
                file_path=report_path,
                metadata={
                    "product": product,
                    "region": region,
                    "analysis_date": datetime.now().strftime("%Y-%m-%d"),
                    "analysis_type": "Search-Based Market Analysis"
                }
            )

            # Create task report
            self.tools["TaskReporter"].run(
                task_name=f"Market Analysis - {product} in {region if region else 'Global Market'}",
                task_description="Search-based market analysis and data collection",
                findings=[
                    "Collected and analyzed market data",
                    "Generated market insights",
                    "Analyzed sales and growth trends",
                    "Identified customer demographics",
                    "Compiled additional market insights"
                ],
                actions_taken=[
                    "Performed targeted market searches",
                    "Analyzed search results",
                    "Generated comprehensive report",
                    "Saved analysis findings"
                ]
            )

            return f"Market analysis completed successfully. Report saved to {report_path}"

        except Exception as e:
            return f"Error in market analysis: {str(e)}"

    def _format_market_insights(self, data):
        # Format key market insights from the search data
        insights = []
        for query, results in data.items():
            if "market" in query.lower():
                insights.append(f"- {results}")
        return "\n".join(insights) if insights else "No specific market insights found."

    def _format_sales_data(self, data):
        # Format sales and growth information
        sales_info = []
        for query, results in data.items():
            if "sales" in query.lower():
                sales_info.append(f"- {results}")
        return "\n".join(sales_info) if sales_info else "No specific sales data found."

    def _format_trends(self, data):
        # Format market trends information
        trends = []
        for query, results in data.items():
            if "trends" in query.lower():
                trends.append(f"- {results}")
        return "\n".join(trends) if trends else "No specific trend information found."

    def _format_demographics(self, data):
        # Format demographic information
        demographics = []
        for query, results in data.items():
            if "demographics" in query.lower():
                demographics.append(f"- {results}")
        return "\n".join(demographics) if demographics else "No specific demographic information found."

    def _format_additional_insights(self, data):
        # Format any additional insights
        insights = []
        for query, results in data.items():
            if "market share" in query.lower():
                insights.append(f"- {results}")
        return "\n".join(insights) if insights else "No additional insights found."

    def response_validator(self, message):
        return message
