from agency_swarm.tools import BaseTool
from pydantic import Field
import json
from typing import Dict, Any

class TrendAnalyzer(BaseTool):
    """
    Analyzes search results and trends from the DataCollector's SerpSearch tool.
    Identifies patterns, trends, and key insights from the collected data.
    """

    search_data: str = Field(
        ...,
        description="JSON string containing search results from SerpSearch tool"
    )

    def run(self):
        """
        Process and analyze the search results to identify trends and patterns.
        """
        try:
            # Parse the JSON data
            data = json.loads(self.search_data)
            
            analysis_results = {
                "query_analyzed": data.get("query"),
                "timestamp": data.get("timestamp"),
                "insights": {
                    "top_topics": [],
                    "trending_terms": [],
                    "key_metrics": {}
                }
            }

            # Analyze organic results
            if "organic_results" in data.get("data", {}):
                organic_insights = self._analyze_organic_results(data["data"]["organic_results"])
                analysis_results["insights"]["organic_insights"] = organic_insights

            # Analyze news results
            if "news_results" in data.get("data", {}):
                news_insights = self._analyze_news_results(data["data"]["news_results"])
                analysis_results["insights"]["news_insights"] = news_insights

            # Analyze related queries
            if "related_queries" in data.get("data", {}):
                related_insights = self._analyze_related_queries(data["data"]["related_queries"])
                analysis_results["insights"]["related_insights"] = related_insights

            return json.dumps(analysis_results, indent=2)

        except Exception as e:
            return f"Error analyzing trends: {str(e)}"

    def _analyze_organic_results(self, results: list) -> Dict[str, Any]:
        """Analyze organic search results for patterns and insights."""
        return {
            "top_domains": self._extract_domains(results),
            "common_themes": self._extract_themes(results),
            "result_count": len(results)
        }

    def _analyze_news_results(self, results: list) -> Dict[str, Any]:
        """Analyze news results for temporal patterns and key stories."""
        return {
            "recent_coverage": self._analyze_dates(results),
            "key_sources": self._extract_sources(results),
            "story_count": len(results)
        }

    def _analyze_related_queries(self, queries: list) -> Dict[str, Any]:
        """Analyze related queries for trend identification."""
        return {
            "related_terms": queries[:5],
            "query_count": len(queries)
        }

    def _extract_domains(self, results: list) -> list:
        """Extract and count unique domains from results."""
        from urllib.parse import urlparse
        domains = [urlparse(result.get("link", "")).netloc for result in results]
        return list(set(domains))

    def _extract_themes(self, results: list) -> list:
        """Extract common themes from result titles and snippets."""
        # Simple implementation - could be enhanced with NLP
        themes = []
        for result in results:
            title = result.get("title", "").lower()
            if "market" in title:
                themes.append("market analysis")
            if "trend" in title:
                themes.append("trending topics")
            if "forecast" in title or "prediction" in title:
                themes.append("future predictions")
        return list(set(themes))

    def _extract_sources(self, results: list) -> list:
        """Extract and count unique news sources."""
        sources = [result.get("source") for result in results if result.get("source")]
        return list(set(sources))

    def _analyze_dates(self, results: list) -> Dict[str, int]:
        """Analyze the temporal distribution of news results."""
        from collections import Counter
        dates = [result.get("date") for result in results if result.get("date")]
        return dict(Counter(dates))

if __name__ == "__main__":
    # Test the tool with sample data from SerpSearch
    sample_data = {
        "query": "AI market trends",
        "timestamp": "2024-01-01",
        "data": {
            "organic_results": [
                {"title": "AI Market Analysis 2024", "link": "https://example.com/analysis"},
                {"title": "Future Trends in AI", "link": "https://example.com/trends"}
            ],
            "news_results": [
                {"title": "AI News", "source": "TechNews", "date": "2024-01-01"},
                {"title": "Market Update", "source": "BusinessDaily", "date": "2024-01-01"}
            ]
        }
    }
    
    tool = TrendAnalyzer(search_data=json.dumps(sample_data))
    print(tool.run()) 