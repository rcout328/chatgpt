from agency_swarm.tools import BaseTool
from pydantic import Field
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import spacy

# Ensure necessary NLTK data is downloaded
nltk.download('vader_lexicon')

class FeedbackTextAnalyzer(BaseTool):
    """
    This tool uses text analysis libraries to process and analyze feedback data.
    It identifies key themes, sentiments, and actionable insights from the feedback.
    The tool handles text preprocessing, sentiment analysis, and theme extraction.
    """

    feedback_data: list = Field(
        ..., description="A list of feedback text data to be analyzed."
    )
    n_themes: int = Field(
        5, description="The number of key themes to extract from the feedback data."
    )

    def run(self):
        """
        Processes and analyzes the provided feedback data.
        Identifies key themes, sentiments, and actionable insights.
        """
        # Load spaCy model for text preprocessing
        nlp = spacy.load("en_core_web_sm")

        # Preprocess feedback data
        processed_feedback = [self._preprocess_text(nlp, text) for text in self.feedback_data]

        # Perform sentiment analysis
        sentiments = [self._analyze_sentiment(text) for text in processed_feedback]

        # Extract key themes
        themes = self._extract_themes(processed_feedback)

        return {
            "sentiments": sentiments,
            "themes": themes
        }

    def _preprocess_text(self, nlp, text):
        """
        Preprocesses the text data using spaCy for lemmatization and stop word removal.
        """
        doc = nlp(text)
        return " ".join([token.lemma_ for token in doc if not token.is_stop and not token.is_punct])

    def _analyze_sentiment(self, text):
        """
        Analyzes the sentiment of the text using NLTK's SentimentIntensityAnalyzer.
        """
        sia = SentimentIntensityAnalyzer()
        sentiment_scores = sia.polarity_scores(text)
        return sentiment_scores

    def _extract_themes(self, processed_feedback):
        """
        Extracts key themes from the feedback data using LDA.
        """
        vectorizer = CountVectorizer(max_df=0.95, min_df=2, stop_words='english')
        dtm = vectorizer.fit_transform(processed_feedback)

        lda = LatentDirichletAllocation(n_components=self.n_themes, random_state=42)
        lda.fit(dtm)

        themes = []
        for index, topic in enumerate(lda.components_):
            top_words = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[-10:]]
            themes.append({"theme": index, "keywords": top_words})

        return themes