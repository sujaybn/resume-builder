from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import logging
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load text generation model
try:
    generator = pipeline("text-generation", model="EleutherAI/gpt-neo-125M")
except Exception as e:
    logger.error(f"Failed to initialize text generator: {str(e)}")
    raise RuntimeError("Text generation service unavailable")

TEMPLATES = {
    "basic": ["Contact Information", "Summary", "Skills", "Experience", "Education"],
    "modern": ["Header", "Profile", "Technical Skills", "Professional Experience", "Education"]
}

def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract text from uploaded PDF file."""
    try:
        with pdfplumber.open(file.file) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid PDF file")

def calculate_similarity(resume: str, job_desc: str) -> float:
    """Calculate similarity score between resume and job description."""
    try:
        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([resume, job_desc])
        return cosine_similarity(vectors[0], vectors[1])[0][0]
    except ValueError as e:
        logger.error(f"Similarity calculation error: {str(e)}")
        return 0.0  

@app.post("/generate")
async def generate_resume(
    content: str = Form(...),
    template: str = Form("basic"),
    job_description: str = Form(""),
    job_description_file: UploadFile = File(None)
):
    """Generate a resume based on user input and job description."""
    try:
        if job_description_file:
            if job_description_file.content_type == "application/pdf":
                job_description = extract_text_from_pdf(job_description_file)
            else:
                job_description = (await job_description_file.read()).decode("utf-8")

        if not content.strip():
            raise HTTPException(status_code=400, detail="Resume content is required")

        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")

        similarity_score = calculate_similarity(content, job_description)

        prompt = f"""
        Generate a professional resume based on the following information:
        {content}

        Include the following sections: {", ".join(TEMPLATES.get(template, TEMPLATES["basic"]))}

        Format the resume in plain text with clear section headings.
        Incorporate keywords from this job description: {job_description}
        """

        # ✅ Fix: Use max_new_tokens to specify only the generated part
        generated_text = generator(prompt, max_new_tokens=200, temperature=0.7, top_p=0.9, do_sample=True)

        resume_text = generated_text[0]["generated_text"].strip()
        
        return {
            "generated_resume": f"{resume_text}\n\nJob Match Score: {similarity_score:.2%}"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Resume generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Resume generation failed.")

