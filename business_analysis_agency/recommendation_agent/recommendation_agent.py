from agency_swarm import Agent
from .tools.insight_generator import InsightGenerator
from .tools.report_creator import ReportCreator

class RecommendationAgent(Agent):
    def __init__(self):
        super().__init__(
            name="Advisor",
            description="Generates actionable recommendations based on analyzed data and insights.",
            instructions="./instructions.md",
            tools=[InsightGenerator, ReportCreator],
            temperature=0.7,
            max_prompt_tokens=4000,
        ) 