import re
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy
import json

class JDAnalyzer:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.requirement_keywords = self._load_requirement_keywords()
        self.seniority_indicators = self._load_seniority_indicators()
        
    def _load_requirement_keywords(self):
        """Load keywords for different requirement categories"""
        return {
            "technical_skills": ["python", "java", "javascript", "react", "node.js", "sql", "aws"],
            "soft_skills": ["leadership", "communication", "teamwork", "problem-solving", "analytical"],
            "experience_levels": ["entry-level", "mid-level", "senior", "lead", "manager", "director"],
            "education": ["bachelor", "master", "phd", "degree", "certification"],
            "tools": ["git", "jira", "confluence", "slack", "teams", "zoom"]
        }
    
    def _load_seniority_indicators(self):
        """Load indicators for job seniority level"""
        return {
            "junior": ["entry-level", "junior", "0-2 years", "recent graduate", "internship"],
            "mid": ["mid-level", "3-5 years", "intermediate", "experienced"],
            "senior": ["senior", "5+ years", "lead", "principal", "architect"],
            "management": ["manager", "director", "head", "vp", "cto", "ceo"]
        }
    
    def analyze(self, jd_text):
        """Analyze job description and extract key information"""
        doc = self.nlp(jd_text.lower())
        
        analysis = {
            "overall_complexity": 0,
            "required_skills": self._extract_required_skills(doc),
            "experience_requirements": self._extract_experience_requirements(jd_text),
            "seniority_level": self._determine_seniority_level(jd_text),
            "key_responsibilities": self._extract_responsibilities(jd_text),
            "qualifications": self._extract_qualifications(jd_text),
            "company_culture": self._analyze_company_culture(jd_text),
            "difficulty_score": 0
        }
        
        # Calculate difficulty score
        analysis["difficulty_score"] = self._calculate_difficulty_score(analysis)
        
        return analysis
    
    def _extract_required_skills(self, doc):
        """Extract required technical and soft skills"""
        skills_found = {}
        
        for category, keywords in self.requirement_keywords.items():
            category_skills = []
            for token in doc:
                if token.text in keywords:
                    category_skills.append(token.text)
            
            skills_found[category] = {
                "skills": category_skills,
                "count": len(category_skills),
                "importance": len(category_skills) * 10  # Score based on frequency
            }
        
        return skills_found
    
    def _extract_experience_requirements(self, text):
        """Extract experience requirements"""
        experience_patterns = [
            r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            r'experience:\s*(\d+)\s*(?:years?|yrs?)',
            r'(\d+)\s*(?:years?|yrs?)\s*in\s*\w+',
            r'minimum\s*(\d+)\s*(?:years?|yrs?)',
        ]
        
        experience_years = 0
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                experience_years = max(experience_years, int(matches[0]))
                break
        
        return {
            "minimum_years": experience_years,
            "level": self._categorize_experience_level(experience_years)
        }
    
    def _categorize_experience_level(self, years):
        """Categorize experience level"""
        if years < 2:
            return "Junior"
        elif years < 5:
            return "Mid-level"
        elif years < 8:
            return "Senior"
        else:
            return "Expert"
    
    def _determine_seniority_level(self, text):
        """Determine job seniority level"""
        text_lower = text.lower()
        
        for level, indicators in self.seniority_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    return level
        
        return "mid"  # Default to mid-level
    
    def _extract_responsibilities(self, text):
        """Extract key responsibilities"""
        responsibility_patterns = [
            r'responsible\s+for\s+([^.]*)',
            r'duties\s+include\s+([^.]*)',
            r'will\s+([^.]*)',
            r'must\s+([^.]*)',
        ]
        
        responsibilities = []
        for pattern in responsibility_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            responsibilities.extend(matches)
        
        return responsibilities[:5]  # Return top 5
    
    def _extract_qualifications(self, text):
        """Extract required qualifications"""
        qualification_patterns = [
            r'qualifications?:\s*([^.]*)',
            r'requirements?:\s*([^.]*)',
            r'must\s+have\s+([^.]*)',
            r'required\s+([^.]*)',
        ]
        
        qualifications = []
        for pattern in qualification_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            qualifications.extend(matches)
        
        return qualifications[:5]  # Return top 5
    
    def _analyze_company_culture(self, text):
        """Analyze company culture indicators"""
        culture_keywords = {
            "collaborative": ["team", "collaboration", "partnership", "together"],
            "innovative": ["innovation", "creative", "cutting-edge", "modern"],
            "fast-paced": ["fast-paced", "dynamic", "agile", "quick"],
            "professional": ["professional", "formal", "corporate", "business"],
            "casual": ["casual", "relaxed", "fun", "flexible"]
        }
        
        culture_indicators = {}
        for culture, keywords in culture_keywords.items():
            count = sum(1 for keyword in keywords if keyword in text.lower())
            culture_indicators[culture] = count
        
        return culture_indicators
    
    def _calculate_difficulty_score(self, analysis):
        """Calculate job difficulty score"""
        base_score = 50
        
        # Adjust based on experience requirements
        experience_score = analysis["experience_requirements"]["minimum_years"] * 5
        base_score += min(experience_score, 30)
        
        # Adjust based on skills complexity
        technical_skills = analysis["required_skills"].get("technical_skills", {})
        skills_score = technical_skills.get("count", 0) * 3
        base_score += min(skills_score, 20)
        
        return min(base_score, 100)


import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import json

class CandidateMatcher:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)
        )
        
    def match(self, jd_text, candidate_resumes):
        """Match candidates to job description"""
        if not candidate_resumes:
            return []
        
        # Prepare texts for vectorization
        texts = [jd_text] + [resume.get('text', '') for resume in candidate_resumes]
        
        # Create TF-IDF vectors
        try:
            tfidf_matrix = self.vectorizer.fit_transform(texts)
        except ValueError:
            # Fallback if vectorization fails
            return self._fallback_matching(jd_text, candidate_resumes)
        
        # Calculate similarities
        jd_vector = tfidf_matrix[0:1]
        candidate_vectors = tfidf_matrix[1:]
        

