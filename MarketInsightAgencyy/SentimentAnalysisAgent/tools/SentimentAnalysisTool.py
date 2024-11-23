from agency_swarm.tools import BaseTool
from pydantic import Field
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import spacy

# Ensure necessary NLTK data is downloaded
nltk.download('vader_lexicon')

class SentimentAnalysisTool(BaseTool):
    """
    This tool utilizes NLP libraries such as NLTK and spaCy to analyze the sentiment of text data.
    It processes text to identify positive, negative, and neutral sentiments.
    The tool handles text preprocessing, tokenization, and sentiment scoring.
    """

    text: str = Field(
        ..., description="The text data to analyze for sentiment."
    )

    def run(self):
        """
        Analyzes the sentiment of the provided text data.
        Processes text to identify positive, negative, and neutral sentiments.
        """
        # Load spaCy model for text preprocessing
        nlp = spacy.load("en_core_web_sm")

        # Preprocess and tokenize text using spaCy
        doc = nlp(self.text)
        processed_text = " ".join([token.lemma_ for token in doc if not token.is_stop])

        # Initialize NLTK's SentimentIntensityAnalyzer
        sia = SentimentIntensityAnalyzer()

        # Perform sentiment analysis
        sentiment_scores = sia.polarity_scores(processed_text)

        # Determine sentiment category
        if sentiment_scores['compound'] >= 0.05:
            sentiment = "positive"
        elif sentiment_scores['compound'] <= -0.05:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        # Return sentiment analysis results
        return {
            "processed_text": processed_text,
            "sentiment_scores": sentiment_scores,
            "sentiment": sentiment
        }