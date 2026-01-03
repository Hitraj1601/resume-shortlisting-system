import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Analysis Prompts
const prompts = {
  resumeAnalysis: `
    Analyze the following resume and provide a comprehensive assessment:
    
    Resume Text: {resumeText}
    
    Job Description: {jobDescription}
    
    Please provide:
    1. Skills Match Score (0-100): Rate how well the candidate's skills match the job requirements
    2. Experience Score (0-100): Rate the candidate's relevant experience
    3. Cultural Fit Score (0-100): Assess cultural alignment
    4. Communication Score (0-100): Evaluate written communication skills
    5. Overall Score (0-100): Weighted average of all scores
    
    For each skill mentioned in the job description:
    - Identify if the candidate has it
    - Rate proficiency level (Beginner/Intermediate/Advanced/Expert)
    - Provide specific examples from the resume
    
    Additional Analysis:
    - Key strengths
    - Areas for improvement
    - Specific recommendations
    - Risk factors
    - Potential questions for interview
    
    Format the response as JSON with the following structure:
    {
      "scores": {
        "skillsMatch": number,
        "experienceScore": number,
        "culturalFit": number,
        "communication": number,
        "overall": number
      },
      "skillsAnalysis": [
        {
          "skill": "string",
          "hasSkill": boolean,
          "proficiency": "string",
          "examples": ["string"],
          "matchScore": number
        }
      ],
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendations": ["string"],
      "interviewQuestions": ["string"],
      "riskFactors": ["string"]
    }
  `,

  jdAnalysis: `
    Analyze the following job description and extract key information:
    
    Job Description: {jobDescription}
    
    Please provide:
    1. Required skills with importance levels (1-10)
    2. Experience requirements
    3. Key responsibilities
    4. Preferred qualifications
    5. Company culture indicators
    6. Salary range indicators
    7. Required vs preferred qualifications
    
    Format as JSON:
    {
      "skills": [
        {
          "skill": "string",
          "importance": number,
          "required": boolean
        }
      ],
      "experience": {
        "minYears": number,
        "maxYears": number,
        "level": "string"
      },
      "responsibilities": ["string"],
      "qualifications": {
        "required": ["string"],
        "preferred": ["string"]
      },
      "culture": ["string"],
      "salary": {
        "range": "string",
        "indicators": ["string"]
      }
    }
  `,

  candidateComparison: `
    Compare the following candidates for the job position:
    
    Job Description: {jobDescription}
    
    Candidates: {candidates}
    
    For each candidate, provide:
    1. Overall ranking (1-5)
    2. Strengths and weaknesses
    3. Best fit for the role
    4. Areas of concern
    5. Interview priority
    
    Format as JSON:
    {
      "rankings": [
        {
          "candidateId": "string",
          "rank": number,
          "overallScore": number,
          "strengths": ["string"],
          "weaknesses": ["string"],
          "fit": "string",
          "concerns": ["string"],
          "interviewPriority": "string"
        }
      ],
      "summary": {
        "topCandidate": "string",
        "keyDifferentiators": ["string"],
        "recommendations": ["string"]
      }
    }
  `,
};

// AI Service Functions
export const analyzeResume = async (resumeText, jobDescription) => {
  try {
    const startTime = Date.now();
    
    const prompt = prompts.resumeAnalysis
      .replace('{resumeText}', resumeText)
      .replace('{jobDescription}', jobDescription);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR recruiter and resume analyst. Provide accurate, professional assessments in the exact JSON format requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const processingTime = Date.now() - startTime;
    const response = completion.choices[0].message.content;

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Validate response structure
    if (!analysis.scores || !analysis.skillsAnalysis) {
      throw new Error('Incomplete AI analysis response');
    }

    return {
      success: true,
      analysis,
      metadata: {
        model: 'gpt-4',
        processingTime,
        tokensUsed: completion.usage?.total_tokens || 0,
        cost: calculateCost(completion.usage),
      },
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const analyzeJobDescription = async (jobDescription) => {
  try {
    const startTime = Date.now();
    
    const prompt = prompts.jdAnalysis.replace('{jobDescription}', jobDescription);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional. Extract and analyze job requirements accurately.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const processingTime = Date.now() - startTime;
    const response = completion.choices[0].message.content;

    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (parseError) {
      throw new Error('Invalid AI response format');
    }

    return {
      success: true,
      analysis,
      metadata: {
        model: 'gpt-4',
        processingTime,
        tokensUsed: completion.usage?.total_tokens || 0,
        cost: calculateCost(completion.usage),
      },
    };
  } catch (error) {
    console.error('JD analysis failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const compareCandidates = async (candidates, jobDescription) => {
  try {
    const startTime = Date.now();
    
    const prompt = prompts.candidateComparison
      .replace('{candidates}', JSON.stringify(candidates))
      .replace('{jobDescription}', jobDescription);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR recruiter. Provide fair and objective candidate comparisons.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const processingTime = Date.now() - startTime;
    const response = completion.choices[0].message.content;

    let comparison;
    try {
      comparison = JSON.parse(response);
    } catch (parseError) {
      throw new Error('Invalid AI response format');
    }

    return {
      success: true,
      comparison,
      metadata: {
        model: 'gpt-4',
        processingTime,
        tokensUsed: completion.usage?.total_tokens || 0,
        cost: calculateCost(completion.usage),
      },
    };
  } catch (error) {
    console.error('Candidate comparison failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Extract text from resume (placeholder - implement based on file type)
export const extractResumeText = async (resumeFile) => {
  try {
    // This is a placeholder - implement based on your file processing needs
    // You might use pdf-parse for PDFs, mammoth for Word docs, etc.
    
    if (resumeFile.mimetype === 'application/pdf') {
      // Use pdf-parse
      return 'Extracted PDF text would go here';
    } else if (resumeFile.mimetype.includes('word') || resumeFile.mimetype.includes('document')) {
      // Use mammoth or similar for Word docs
      return 'Extracted Word document text would go here';
    } else if (resumeFile.mimetype === 'text/plain') {
      // Plain text
      return resumeFile.buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
};

// Calculate API cost (approximate)
const calculateCost = (usage) => {
  if (!usage) return 0;
  
  // GPT-4 pricing (approximate)
  const inputCostPer1K = 0.03;
  const outputCostPer1K = 0.06;
  
  const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1K;
  const outputCost = (usage.completion_tokens / 1000) * outputCostPer1K;
  
  return inputCost + outputCost;
};

// Batch processing for multiple resumes
export const batchAnalyzeResumes = async (resumes, jobDescription) => {
  try {
    const results = [];
    const batchSize = 5; // Process 5 at a time to avoid rate limits
    
    for (let i = 0; i < resumes.length; i += batchSize) {
      const batch = resumes.slice(i, i + batchSize);
      const batchPromises = batch.map(resume => 
        analyzeResume(resume.text, jobDescription)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limits
      if (i + batchSize < resumes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Batch analysis failed:', error);
    throw error;
  }
};

// Test AI service connection
export const testAIService = async () => {
  try {
    const testPrompt = 'Hello, this is a test message. Please respond with "AI service is working correctly."';
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: testPrompt,
        },
      ],
      max_tokens: 50,
    });
    
    const response = completion.choices[0].message.content;
    console.log('✅ AI service test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ AI service test failed:', error.message);
    return false;
  }
};
