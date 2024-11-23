from agency_swarm import Agent

class BaseMarketAgent(Agent):
    def response_validator(self, response):
        """Validate and format the response"""
        if isinstance(response, str):
            return {
                'type': 'message',
                'content': response,
                'agent': self.name
            }
        return response 