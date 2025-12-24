# ML Service for Resume Shortlisting System

This Python FastAPI service provides AI-powered resume analysis and job matching functionality.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the service:**
   ```bash
   python app.py
   ```
   
   The service will run on `http://localhost:8000`

## Testing the Service

### 1. Test Endpoints
Run the test script to verify all endpoints are working:
```bash
python test_service.py
```

### 2. Manual Testing
You can also test endpoints manually:

- **Health Check:** `GET http://localhost:8000/health`
- **Test Endpoint:** `GET http://localhost:8000/test`
- **Root:** `GET http://localhost:8000/`

### 3. Test Resume Analysis
Use curl to test resume analysis:
```bash
curl -X POST "http://localhost:8000/analyze-resume" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_resume.txt"
```

## API Endpoints

### `POST /analyze-resume`
Upload a resume file for AI analysis.

**Request:** Multipart form with `file` field
**Response:** JSON with analysis results including:
- Skills analysis
- Experience assessment
- Education details
- Overall AI score
- Recommendations

### `GET /health`
Service health check endpoint.

### `GET /test`
Test endpoint to verify service is working.

## Frontend Integration

The frontend will automatically:
1. Check service health on page load
2. Show service status in the UI
3. Use ML analysis for resume uploads
4. Fall back to mock data if service is unavailable

## Troubleshooting

### CORS Issues
If you see CORS errors in the browser console:
1. Ensure the service is running on `http://localhost:8000`
2. Check that the frontend is running on `http://localhost:5173` or `http://localhost:3000`
3. Restart the ML service after making CORS changes

### Service Not Available
If the frontend shows "ML service unavailable":
1. Check if the service is running: `python app.py`
2. Verify the port 8000 is not blocked
3. Check console logs for specific error messages

## Development

The service includes:
- **ResumeAnalyzer:** Extracts and analyzes resume content
- **JDAnalyzer:** Analyzes job descriptions
- **CandidateMatcher:** Matches candidates to job requirements

All analysis is performed using NLP and machine learning techniques.
