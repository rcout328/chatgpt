from agency_swarm import Agent
from agency_swarm.tools import CodeInterpreter, FileSearch
from shared_tools.MarkdownWriter import MarkdownWriter

class MarketAnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="MarketAnalysisAgent",
            description="Analyzes market trends and opportunities",
            instructions="./instructions.md",
            tools=[CodeInterpreter, FileSearch, MarkdownWriter],
            temperature=0.7,
            max_prompt_tokens=4000
        )

    async def process_message(self, message):
        try:
            # Process the message
            response = await super().process_message(message)
            return response

        except Exception as e:
            print(f"Error in MarketAnalysisAgent: {str(e)}")
            raise e
