from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
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

# Load a more reliable text generation model (OpenAI API recommended)
try:
    generator = pipeline("text2text-generation",  model="tiiuae/falcon-7b-instruct")
except Exception as e:
    logger.error(f"Failed to initialize text generator: {str(e)}")
    raise RuntimeError("Text generation service unavailable")

# Max input length to prevent crashes
MAX_LENGTH = 3000

def extract_text_from_pdf(file: UploadFile) -> str:
    """Extract text from an uploaded PDF file."""
    try:
        with pdfplumber.open(file.file) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid PDF file")

def calculate_similarity(resume: str, job_desc: str) -> float:
    """Calculate similarity score between resume and job description."""
    try:
        if not resume.strip() or not job_desc.strip():
            return 0.0  # Avoid errors if input is empty

        vectorizer = TfidfVectorizer()
        vectors = vectorizer.fit_transform([resume, job_desc])

        return cosine_similarity(vectors[0], vectors[1])[0][0]
    except ValueError as e:
        logger.error(f"Similarity calculation error: {str(e)}")
        return 0.0  

def refine_resume(resume_text: str, job_desc: str) -> str:
    """Enhance the resume by incorporating keywords while maintaining structure."""
    prompt = f"""
    Improve this resume to match the job description.
    Add relevant keywords, skills, and responsibilities while keeping the structure the same.

    Resume:
    {resume_text}

    Job Description:
    {job_desc}

    Return only the improved resume, without explanations.
    """

    try:
        generated_text = generator(
            prompt, 
            max_length=500, 
            num_return_sequences=1
        )

        refined_text = generated_text[0]["generated_text"].strip()

        if len(refined_text) < 100:  # Ensure valid output
            raise ValueError("AI returned insufficient text.")

        return refined_text

    except Exception as e:
        logger.error(f"AI model error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI model failed to generate resume.")

@app.post("/generate")
async def generate_resume(
    resume_content: str = Form(...),
    job_description_file: UploadFile = File(...)
):
    """Refine an existing resume based on a job description."""
    try:
        # Extract job description text
        if job_description_file.content_type == "application/pdf":
            job_desc = extract_text_from_pdf(job_description_file)
        else:
            job_desc = (await job_description_file.read()).decode("utf-8")

        if not resume_content.strip():
            raise HTTPException(status_code=400, detail="Resume content is required")

        if not job_desc.strip():
            raise HTTPException(status_code=400, detail="Job description is required")

        # Validate input length
        if len(resume_content) > MAX_LENGTH or len(job_desc) > MAX_LENGTH:
            raise HTTPException(status_code=400, detail="Input too long. Please shorten resume or job description.")

        # Calculate similarity before improvement
        match_score_before = calculate_similarity(resume_content, job_desc)

        # Refine resume
        improved_resume = refine_resume(resume_content, job_desc)

        # Calculate similarity after improvement
        match_score_after = calculate_similarity(improved_resume, job_desc)

        return {
            "original_match_score": f"{match_score_before:.2%}",
            "improved_match_score": f"{match_score_after:.2%}",
            "refined_resume": improved_resume
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Resume refinement failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Resume refinement failed.")
