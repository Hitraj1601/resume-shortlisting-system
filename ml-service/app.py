from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from datetime import datetime
from dotenv import load_dotenv
from resume_analyzer import ResumeAnalyzer
from jd_analyzer import JDAnalyzer
from candidate_matcher import CandidateMatcher

load_dotenv()

app = FastAPI(title="Resume Shortlisting AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize AI services
resume_analyzer = ResumeAnalyzer()
jd_analyzer = JDAnalyzer()
candidate_matcher = CandidateMatcher()

class AnalysisRequest(BaseModel):
    text: str

class TextAnalysisRequest(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "AI Resume Shortlisting Service", "status": "running"}

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    """Analyze uploaded resume and return AI score and analysis"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided. Please upload a resume file.")
        
        # Check file type
        allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type '{file_ext}'. Allowed types: PDF, DOC, DOCX, TXT"
            )
        
        # Check file size (max 5MB)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")
        
        # Reset file pointer for extraction
        await file.seek(0)
        
        print(f"Processing file: {file.filename}, size: {len(content)} bytes")
        
        # Extract text from resume
        text = await resume_analyzer.extract_text(file)
        print(f"Extracted text length: {len(text)}")
        
        # Analyze resume - this will raise ValueError for invalid content
        analysis = resume_analyzer.analyze(text)
        print(f"Analysis completed successfully")
        
        return {
            "success": True,
            "data": analysis
        }
    except ValueError as e:
        # Handle validation errors (empty resume, non-technical content, etc.)
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/analyze-resume-text")
async def analyze_resume_text(request: TextAnalysisRequest):
    """Analyze resume text directly"""
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Resume text is required.")
        
        analysis = resume_analyzer.analyze(request.text)
        
        return {
            "success": True,
            "data": analysis
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/analyze-jd")
async def analyze_jd(request: AnalysisRequest):
    """Analyze job description and extract key requirements"""
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Job description text is required.")
        
        analysis = jd_analyzer.analyze(request.text)
        
        return {
            "success": True,
            "data": analysis
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match-candidates")
async def match_candidates(jd_text: str, candidate_resumes: list):
    """Match candidates to job description"""
    try:
        if not jd_text or len(jd_text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Job description text is required.")
        
        if not candidate_resumes or len(candidate_resumes) == 0:
            raise HTTPException(status_code=400, detail="At least one candidate resume is required.")
        
        matches = candidate_matcher.match(jd_text, candidate_resumes)
        
        return {
            "success": True,
            "data": matches
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring"""
    return {
        "status": "healthy", 
        "service": "AI Resume Shortlisting",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.options("/health")
async def health_check_options():
    """Handle OPTIONS request for health check"""
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
