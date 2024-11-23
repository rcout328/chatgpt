from agency_swarm.agents import Agent
from agency_swarm.tools import CodeInterpreter

class SentimentAnalysisAgent(Agent):
    def __init__(self):
        super().__init__(
            name="SentimentAnalysisAgent",
            description="This agent processes news and social media sentiment using NLP libraries like NLTK and spaCy.",
            instructions="./instructions.md",
            files_folder="./files",
            schemas_folder="./schemas",
            tools=[CodeInterpreter],
            tools_folder="./tools",
            temperature=0.3,
            max_prompt_tokens=25000,
        )
        
    def response_validator(self, message):
        return message
