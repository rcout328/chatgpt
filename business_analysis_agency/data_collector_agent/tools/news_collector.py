from agency_swarm.tools import BaseTool
from pydantic import Field
import os
from dotenv import load_dotenv
from newsapi import NewsApiClient
from datetime import datetime, timedelta

load_dotenv()

class NewsCollector(BaseTool):
    """
    A tool for collecting news articles related to specific topics, companies, or industries
    using the NewsAPI service.
    """

    query: str = Field(
        ..., 
        description="The search query for news articles (e.g., company name, industry, topic)"
    )
    
    days_back: int = Field(
        default=30,
        description="Number of days to look back for news articles (default: 30)"
    )

    def run(self):
        """
        Fetches news articles based on the provided query and time range.
        Returns formatted news data as a string.
        """
        try:
            # Initialize NewsAPI client
            newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=self.days_back)
            
            # Fetch news articles
            response = newsapi.get_everything(
                q=self.query,
                from_param=start_date.strftime('%Y-%m-%d'),
                to=end_date.strftime('%Y-%m-%d'),
                language='en',
                sort_by='relevancy'
            )
            
            if not response['articles']:
                return f"No news articles found for query: {self.query}"
            
            # Format the results
            formatted_articles = []
            for article in response['articles'][:10]:  # Limit to top 10 articles
                formatted_article = (
                    f"Title: {article['title']}\n"
                    f"Date: {article['publishedAt']}\n"
                    f"Source: {article['source']['name']}\n"
                    f"Description: {article['description']}\n"
                    f"URL: {article['url']}\n"
                )
                formatted_articles.append(formatted_article)
            
            return "\n---\n".join(formatted_articles)
            
        except Exception as e:
            return f"Error collecting news: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    collector = NewsCollector(query="artificial intelligence", days_back=7)
    print(collector.run()) 