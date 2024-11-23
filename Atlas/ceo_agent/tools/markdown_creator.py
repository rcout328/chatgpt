from agency_swarm.tools import BaseTool
from pydantic import Field
from pathlib import Path
import os

class MarkdownCreator(BaseTool):
    """
    A tool for creating and managing markdown files. The CEO can use this to document strategies,
    analyses, and recommendations.
    """
    
    content: str = Field(
        ...,
        description="The content to write to the markdown file"
    )
    
    filename: str = Field(
        ...,
        description="Name of the markdown file (with or without .md extension)"
    )
    
    folder: str = Field(
        default="reports",
        description="Folder to save the markdown file in (will be created if it doesn't exist)"
    )

    def run(self):
        try:
            # Ensure filename has .md extension
            if not self.filename.endswith('.md'):
                self.filename += '.md'
            
            # Create folder if it doesn't exist
            folder_path = Path(self.folder)
            folder_path.mkdir(parents=True, exist_ok=True)
            
            # Create full file path
            file_path = folder_path / self.filename
            
            # Write content to file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(self.content)
            
            return f"Successfully created markdown file: {file_path}"
            
        except Exception as e:
            return f"Error creating markdown file: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    creator = MarkdownCreator(
        content="# Test Report\n\nThis is a test report.",
        filename="test_report.md",
        folder="test_reports"
    )
    print(creator.run()) 