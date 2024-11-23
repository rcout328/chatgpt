from agency_swarm.tools import BaseTool
from pydantic import Field
from pathlib import Path
import os
from datetime import datetime
from fpdf import FPDF

class DocumentCreator(BaseTool):
    """
    A tool for creating both markdown and PDF documents. The CEO can use this to create
    various types of documentation including reports, analyses, and recommendations.
    """
    
    content: str = Field(
        ...,
        description="The content to write to the document"
    )
    
    filename: str = Field(
        ...,
        description="Name of the file (with or without extension)"
    )
    
    file_type: str = Field(
        default="markdown",
        description="Type of file to create: 'markdown' or 'pdf'"
    )
    
    folder: str = Field(
        default="documents",
        description="Folder to save the document in (will be created if it doesn't exist)"
    )

    def run(self):
        try:
            # Create folder if it doesn't exist
            folder_path = Path(self.folder)
            folder_path.mkdir(parents=True, exist_ok=True)
            
            # Handle file extension
            if self.file_type.lower() == 'pdf':
                if not self.filename.endswith('.pdf'):
                    self.filename += '.pdf'
                return self._create_pdf()
            else:
                if not self.filename.endswith('.md'):
                    self.filename += '.md'
                return self._create_markdown()
            
        except Exception as e:
            return f"Error creating document: {str(e)}"

    def _create_markdown(self):
        """Create a markdown document"""
        file_path = Path(self.folder) / self.filename
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(self.content)
            
            return f"Successfully created markdown file: {file_path}"
        except Exception as e:
            return f"Error creating markdown file: {str(e)}"

    def _create_pdf(self):
        """Create a PDF document"""
        file_path = Path(self.folder) / self.filename
        
        try:
            # Initialize PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            
            # Set font
            pdf.set_font("Arial", size=12)
            
            # Add content
            # Split content into lines and write them
            lines = self.content.split('\n')
            for line in lines:
                # Handle markdown headers
                if line.startswith('# '):
                    pdf.set_font("Arial", 'B', 16)
                    pdf.cell(0, 10, line[2:], ln=True)
                    pdf.set_font("Arial", size=12)
                elif line.startswith('## '):
                    pdf.set_font("Arial", 'B', 14)
                    pdf.cell(0, 10, line[3:], ln=True)
                    pdf.set_font("Arial", size=12)
                elif line.strip():  # Only write non-empty lines
                    pdf.multi_cell(0, 10, line)
            
            # Save PDF
            pdf.output(str(file_path))
            
            return f"Successfully created PDF file: {file_path}"
        except Exception as e:
            return f"Error creating PDF file: {str(e)}"

if __name__ == "__main__":
    # Test markdown creation
    creator = DocumentCreator(
        content="# Test Document\n\nThis is a test document.",
        filename="test_document",
        file_type="markdown",
        folder="test_documents"
    )
    print(creator.run())
    
    # Test PDF creation
    creator = DocumentCreator(
        content="# Test PDF\n\nThis is a test PDF document.",
        filename="test_document",
        file_type="pdf",
        folder="test_documents"
    )
    print(creator.run()) 