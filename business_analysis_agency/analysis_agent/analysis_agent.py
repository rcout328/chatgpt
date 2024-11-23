from agency_swarm import Agent
from .tools.trend_analyzer import TrendAnalyzer
from .tools.sentiment_analyzer import SentimentAnalyzer

class AnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="Analyst",
            description="Processes and analyzes collected data to identify trends, patterns, and insights.",
            instructions="./instructions.md",
            tools=[TrendAnalyzer, SentimentAnalyzer],
            temperature=0.3,
            max_prompt_tokens=4000,
        ) 