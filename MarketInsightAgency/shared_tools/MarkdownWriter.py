from agency_swarm.tools import BaseTool
from pydantic import Field
from typing import Optional, Dict, Any
import os
from datetime import datetime

class MarkdownWriter(BaseTool):
    """
    A tool for creating and updating markdown files. Can be used by any agent to document their tasks,
    create reports, or store information in markdown format.
    """
    
    content: str = Field(
        ...,
        description="The content to write to the markdown file"
    )
    
    file_path: str = Field(
        ...,
        description="The path where the markdown file should be saved (including filename)"
    )
    
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata to include at the top of the file in YAML format"
    )
    
    append: bool = Field(
        default=False,
        description="If True, append to existing file. If False, create new or overwrite"
    )

    def run(self) -> str:
        try:
            # Create directories if they don't exist
            os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
            
            # Prepare content with metadata if provided
            final_content = ""
            if self.metadata:
                final_content += "---\n"
                for key, value in self.metadata.items():
                    final_content += f"{key}: {value}\n"
                final_content += "---\n\n"
            
            final_content += self.content
            
            # Add timestamp if appending
            if self.append:
                final_content = f"\n\n## Update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n{final_content}"
            
            # Write or append to file
            mode = 'a' if self.append else 'w'
            with open(self.file_path, mode, encoding='utf-8') as f:
                f.write(final_content)
            
            return f"Successfully {'appended to' if self.append else 'created'} markdown file at {self.file_path}"
            
        except Exception as e:
            return f"Error writing markdown file: {str(e)}"

if __name__ == "__main__":
    # Test the tool
    test_content = """
# Test Report
## Overview
This is a test report.

### Key Points
- Point 1
- Point 2
    """
    
    test_metadata = {
        "author": "TestAgent",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "type": "test_report"
    }
    
    tool = MarkdownWriter(
        content=test_content,
        file_path="./test_report.md",
        metadata=test_metadata
    )
    print(tool.run()) 