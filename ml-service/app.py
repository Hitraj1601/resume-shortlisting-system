from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
from resume_analyzer import ResumeAnalyzer
from jd_analyzer import JDAnalyzer
from candidate_matcher import CandidateMatcher

load_dotenv()

app = FastAPI(title="Resume Shortlisting AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize AI services
resume_analyzer = ResumeAnalyzer()
jd_analyzer = JDAnalyzer()
candidate_matcher = CandidateMatcher()

class AnalysisRequest(BaseModel):
    text: str
    analysis_type: str

@app.get("/")
async def root():
    return {"message": "AI Resume Shortlisting Service"}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    """Analyze uploaded resume and return AI score and analysis"""
    try:
        print(f"Processing file: {file.filename}, size: {file.size}")
        
        # Extract text from resume
        text = await resume_analyzer.extract_text(file)
        print(f"Extracted text length: {len(text)}")
        
        # Analyze resume
        analysis = resume_analyzer.analyze(text)
        print(f"Analysis completed successfully")
        
        return {
            "success": True,
            "data": analysis
        }
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/analyze-jd")
async def analyze_jd(request: AnalysisRequest):
    """Analyze job description and extract key requirements"""
    try:
        analysis = jd_analyzer.analyze(request.text)
        
        return {
            "success": True,
            "data": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-candidates")
async def match_candidates(jd_text: str, candidate_resumes: list):
    """Match candidates to job description"""
    try:
        matches = candidate_matcher.match(jd_text, candidate_resumes)
        
        return {
            "success": True,
            "data": matches
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify service is working"""
    return {
        "message": "ML service is working!",
        "endpoints": [
            "/health - Service health check",
            "/analyze-resume - Resume analysis",
            "/analyze-jd - Job description analysis",
            "/match-candidates - Candidate matching"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring"""
    try:
        return {
            "status": "healthy", 
            "service": "AI Resume Shortlisting",
            "timestamp": "2024-01-15T10:00:00Z"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.options("/health")
async def health_check_options():
    """Handle OPTIONS request for health check"""
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
