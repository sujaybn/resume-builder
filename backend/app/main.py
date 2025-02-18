from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import os
from starlette import status
from transformers import pipeline

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use a smaller text generation model for performance
generator = pipeline("text-generation", model="EleutherAI/gpt-neo-125M")  # Faster and lighter model

# Firebase authentication setup
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS", "/app/auth/resume-builder-3a80a-firebase-admin.json")

# Check if Firebase credentials exist before initializing
if not os.path.exists(firebase_cred_path):
    raise RuntimeError(f"Firebase credentials file not found: {firebase_cred_path}")

# Initialize Firebase only if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_cred_path)
    firebase_admin.initialize_app(cred)

security = HTTPBearer()

# Resume templates
TEMPLATES = {
    "basic": {
        "sections": ["Contact Information", "Summary", "Skills", "Experience", "Education"]
    },
    "modern": {
        "sections": ["Header", "Profile", "Technical Skills", "Professional Experience", "Education"]
    }
}

class ResumeRequest(BaseModel):
    content: str
    template: str = "basic"


@app.post("/generate")
async def generate_resume(resume: ResumeRequest):
    try:
        prompt = f"""
        Generate a professional resume based on the following information:
        {resume.content}

        Include the following sections:
        1. Contact Information
        2. Summary
        3. Skills
        4. Experience
        5. Education

        Format the resume in plain text with clear section headings.
        Each section should be concise and relevant to the input provided.
        """

        generated_text = generator(
            prompt,
            max_length=500,  # Adjust max_length as needed
            num_return_sequences=1,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
        )

        resume_text = generated_text[0]["generated_text"].strip()

        return {"generated_resume": resume_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )


@app.post("/generate_with_auth")
async def generate_resume_with_user(
    resume: ResumeRequest,
    user_id: str = Depends(get_current_user),
):
    try:
        generated_text = generator(
            f"Generate a professional resume based on: {resume.content}",
            max_length=500,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.7,
        )
        return {
            "user_id": user_id,
            "generated_resume": generated_text[0]["generated_text"].strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
