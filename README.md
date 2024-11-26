Here is the revised document with the project name updated to MarketInsightAgency and the folder names updated to MarketInsightAgency for the backend and Agent for the frontend:

MarketInsightAgency

Overview

MarketInsightAgency is a Python-based conversational system with a Next.js frontend, designed for managing multi-agent interactions. Built on the Agency Swarm framework, this project emphasizes scalability, performance, and dynamic, context-aware responses.

The project is organized into two main folders for better management:

	•	MarketInsightAgency: Backend code for managing multi-agent logic using Python.
	•	Agent: Frontend interface built with Next.js for user interaction.

This system combines robust backend logic with a responsive and interactive frontend, providing a seamless experience for users.

Features

	•	Multi-Agent Architecture: Utilizes Agency Swarm to coordinate multiple agents efficiently.
	•	Dynamic Responses: Offers intelligent and context-aware interactions.
	•	Scalable and Modular Design: Easily extensible to meet custom use cases.
	•	User-Friendly Frontend: Built with Next.js for smooth and intuitive interaction.

Technologies Used

Backend (MarketInsightAgency)

	•	Language Model: OpenAI GPT-based architecture
	•	Framework: Agency Swarm for multi-agent management
	•	Environment Management: virtualenv or conda
	•	Dependencies: Managed via requirements.txt

Frontend (Agent)

	•	Framework: Next.js
	•	Language: JavaScript/TypeScript
	•	Styling: TailwindCSS or CSS modules (optional)

Getting Started

Prerequisites

Ensure you have the following installed:

	•	Python 3.8+
	•	pip
	•	Node.js (16.x or later)
	•	virtualenv (optional but recommended)

Installation

Backend Setup

	1.	Clone the Repository

git clone https://github.com/rcout328/MarketInsightAgency.git  
cd MarketInsightAgency/MarketInsightAgency  


	2.	Set Up a Virtual Environment (Optional)

python -m venv venv  
source venv/bin/activate  # On Windows: venv\Scripts\activate  


	3.	Install Dependencies

pip install -r requirements.txt  


	4.	Run the Backend Application

python agency.py  



Frontend Setup

	1.	Navigate to the Agent folder:

cd ../Agent  


	2.	Install Node.js dependencies:

npm install  


	3.	Start the Next.js development server:

npm run dev  



Creating requirements.txt

To update the requirements.txt file, navigate to the MarketInsightAgency folder and run:

pip freeze > requirements.txt  

License

This project is licensed under the MIT License.

Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests.

Contact

For questions or feedback, reach out at:

	•	Email: solovpxoffical@gmail.com
	•	GitHub: rcout328

