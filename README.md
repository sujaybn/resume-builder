# Resume Builder

A powerful tool that leverages AI to analyze job descriptions and tailor resumes to match specific roles. This application assists users in optimizing their resumes for Applicant Tracking Systems (ATS) and crafting personalized documents that align with specific job requirements.

## Key Features

- **Resume Parsing**: Extracts information from existing resumes (PDF, Word, etc.) using Natural Language Processing (NLP) to identify skills, experience, education, and other key sections.

- **Job Description Analysis**: Analyzes job descriptions to extract keywords, required skills, and qualifications, aiding in the alignment of resumes with job requirements.

- **Resume Tailoring**: Provides suggestions to enhance the user's resume based on the analyzed job description, emphasizing relevant skills and experiences.

- **AI-Powered Content Generation**: Utilizes advanced language models to generate professional summaries, skill descriptions, and experience bullet points.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Python 3.10](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Firebase Account](https://firebase.google.com/) with Admin SDK credentials

## Project Structure

The repository is organized as follows:

```
resume-builder/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   └── services/
│   ├── Dockerfile
│   └── requirements.txt
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.js
│   └── index.js
├── public/
├── .env
├── docker-compose.yml
├── package.json
└── README.md
```

- **backend/**: Contains the FastAPI backend application.
- **src/**: Holds the React frontend source code.
- **public/**: Includes static assets for the frontend.
- **.env**: Environment variables configuration file.
- **docker-compose.yml**: Defines services for Docker Compose.
- **package.json**: Manages frontend dependencies and scripts.

## Setup Instructions

Follow these steps to set up and run the project:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/sujaybn/resume-builder.git
   cd resume-builder
   ```

2. **Configure Environment Variables**:

   - Create a `.env` file in the root directory with the following content:

     ```env
     FIREBASE_CREDENTIALS=/app/auth/firebase-admin.json
     ```

   - Place your Firebase Admin SDK JSON file at `backend/app/auth/firebase-admin.json`.

3. **Install Backend Dependencies**:

   - Navigate to the backend directory:

     ```bash
     cd backend
     ```

   - Install Python dependencies:

     ```bash
     pip install -r requirements.txt
     ```

4. **Install Frontend Dependencies**:

   - Navigate to the frontend source directory:

     ```bash
     cd ../
     ```

   - Install Node.js dependencies:

     ```bash
     npm install
     ```

5. **Run the Application Using Docker Compose**:

   - Ensure you're in the root directory of the project.
   - Start the services:

     ```bash
     docker-compose up --build
     ```

   - This command will build and start both the backend and frontend services.

6. **Access the Application**:

   - Frontend: Open your browser and navigate to `http://localhost:3000/`.
   - Backend: The API is accessible at `http://localhost:8000/`.

## Usage

- **Frontend**: Use the web interface to input your existing resume and the job description. The application will analyze and provide a tailored resume.
- **Backend**: Provides API endpoints for resume parsing, job description analysis, and resume generation.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository, create a new branch, and submit a pull request. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

Special thanks to the open-source community and the contributors of the libraries and frameworks used in this project.
