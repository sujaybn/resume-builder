from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

# Load a pre-trained text generation model
generator = pipeline("text-generation", model="gpt2")

# Firebase authentication setup
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS", "/app/auth/resume-builder-3a80a-firebase-admin.json")

# Initialize Firebase only if not already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_cred_path)
    firebase_admin.initialize_app(cred)

security = HTTPBearer()

class ResumeRequest(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"message": "Resume Generator API is running!"}

@app.post("/generate")
async def generate_resume(resume: ResumeRequest):
    try:
        # Generate text using Hugging Face Transformers
        generated_text = generator(
            f"Generate a professional resume based on: {resume.content}",
            max_length=200,  # Adjust max_length as needed
            num_return_sequences=1,
        )
        return {"generated_resume": generated_text[0]["generated_text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
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
            max_length=200,
            num_return_sequences=1,
        )
        return {
            "user_id": user_id,
            "generated_resume": generated_text[0]["generated_text"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
