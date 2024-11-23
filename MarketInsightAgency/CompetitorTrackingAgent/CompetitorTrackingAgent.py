from agency_swarm.agents import Agent
from shared_tools.AICentralDataSource import AICentralDataSource
from shared_tools.MarkdownWriter import MarkdownWriter
from shared_tools.TaskReporter import TaskReporter


class CompetitorTrackingAgent(Agent):
    def __init__(self):
        super().__init__(
            name="CompetitorTrackingAgent",
            description="This agent tracks competitor activities using AI-powered analysis.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[AICentralDataSource, MarkdownWriter, TaskReporter],
            tools_folder="./tools",
            temperature=0.7,
            max_prompt_tokens=4000,
            model="gpt-4-1106-preview"
        )
        
    def response_validator(self, message):
        return message
