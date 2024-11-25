from agency_swarm import Agent
from agency_swarm.tools import CodeInterpreter, FileSearch
from shared_tools.MarkdownWriter import MarkdownWriter


class CompetitorTrackingAgent(Agent):
    def __init__(self):
        super().__init__(
            name="CompetitorTrackingAgent",
            description="Tracks and analyzes competitor activities",
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
            print(f"Error in CompetitorTrackingAgent: {str(e)}")
            raise e
