from agency_swarm.tools import BaseTool
from pydantic import Field

class SendMessage(BaseTool):
    """
    A tool for sending messages between agents in the agency.
    """
    my_primary_instructions: str = Field(
        ...,
        description="Primary instructions or context for the message"
    )
    recipient: str = Field(
        ...,
        description="The name of the agent to send the message to"
    )
    message: str = Field(
        ...,
        description="The message content to be sent"
    )
    additional_instructions: str = Field(
        "",
        description="Any additional instructions or context for the message"
    )

    def run(self):
        """
        Execute the message sending operation.
        Returns the message details as a formatted string.
        """
        return f"Message sent to {self.recipient}: {self.message}" 