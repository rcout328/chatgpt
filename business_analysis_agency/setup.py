from setuptools import setup, find_packages

setup(
    name="business_analysis_agency",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'agency-swarm>=1.0.0',
        'google-search-results==2.4.2',
        'nltk>=3.8.1',
        'pytrends>=4.9.0',
        'langchain>=0.0.300',
        'pandas>=2.0.0',
        'numpy>=1.24.0',
        'python-dotenv>=1.0.0',
        'pydantic>=2.0.0',
        'openai>=1.3.0',
        'tiktoken>=0.5.0',
        'tenacity>=8.2.0',
        'newsapi-python==0.2.7'
    ]
) 