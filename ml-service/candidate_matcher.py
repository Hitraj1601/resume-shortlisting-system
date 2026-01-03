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
        
        similarities = cosine_similarity(jd_vector, candidate_vectors).flatten()
        
        # Create matching results
        matches = []
        for i, similarity in enumerate(similarities):
            candidate = candidate_resumes[i]
            match_score = self._calculate_comprehensive_score(
                similarity, 
                candidate, 
                jd_text
            )
            
            matches.append({
                "candidate_id": candidate.get('id', f"candidate_{i}"),
                "name": candidate.get('name', f"Candidate {i+1}"),
                "similarity_score": round(similarity * 100, 2),
                "comprehensive_score": round(match_score, 2),
                "skills_match": self._analyze_skills_match(candidate, jd_text),
                "experience_match": self._analyze_experience_match(candidate, jd_text),
                "recommendation": self._generate_recommendation(match_score)
            })
        
        # Sort by comprehensive score
        matches.sort(key=lambda x: x['comprehensive_score'], reverse=True)
        
        return matches
    
    def _calculate_comprehensive_score(self, similarity, candidate, jd_text):
        """Calculate comprehensive matching score"""
        base_score = similarity * 100
        
        # Skills bonus (up to 20 points)
        skills_bonus = self._calculate_skills_bonus(candidate, jd_text)
        
        # Experience bonus (up to 15 points)
        experience_bonus = self._calculate_experience_bonus(candidate, jd_text)
        
        # Education bonus (up to 10 points)
        education_bonus = self._calculate_education_bonus(candidate, jd_text)
        
        # Contact info bonus (up to 5 points)
        contact_bonus = 5 if candidate.get('email') else 0
        
        total_score = base_score + skills_bonus + experience_bonus + education_bonus + contact_bonus
        
        return min(total_score, 100)
    
    def _calculate_skills_bonus(self, candidate, jd_text):
        """Calculate skills matching bonus"""
        candidate_skills = set(candidate.get('skills', []))
        jd_skills = self._extract_skills_from_jd(jd_text)
        
        if not jd_skills:
            return 0
        
        # Calculate skills overlap
        overlap = len(candidate_skills.intersection(jd_skills))
        total_required = len(jd_skills)
        
        if total_required == 0:
            return 0
        
        match_percentage = overlap / total_required
        
        # Bonus: 20 points for 100% match, 0 for 0% match
        return match_percentage * 20
    
    def _extract_skills_from_jd(self, jd_text):
        """Extract skills mentioned in job description"""
        # Common technical skills
        technical_skills = [
            "python", "java", "javascript", "react", "angular", "vue", "node.js",
            "express", "django", "flask", "mysql", "postgresql", "mongodb",
            "aws", "azure", "docker", "kubernetes", "git", "jenkins"
        ]
        
        found_skills = []
        jd_lower = jd_text.lower()
        
        for skill in technical_skills:
            if skill in jd_lower:
                found_skills.append(skill)
        
        return set(found_skills)
    
    def _calculate_experience_bonus(self, candidate, jd_text):
        """Calculate experience matching bonus"""
        candidate_exp = candidate.get('experience_years', 0)
        required_exp = self._extract_required_experience(jd_text)
        
        if required_exp == 0:
            return 0
        
        if candidate_exp >= required_exp:
            # Bonus for meeting or exceeding requirements
            return 15
        elif candidate_exp >= required_exp * 0.7:
            # Partial bonus for close match
            return 10
        else:
            # No bonus for insufficient experience
            return 0
    
    def _extract_required_experience(self, jd_text):
        """Extract required experience from job description"""
        import re
        
        patterns = [
            r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            r'experience:\s*(\d+)\s*(?:years?|yrs?)',
            r'minimum\s*(\d+)\s*(?:years?|yrs?)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, jd_text, re.IGNORECASE)
            if matches:
                return int(matches[0])
        
        return 0
    
    def _calculate_education_bonus(self, candidate, jd_text):
        """Calculate education matching bonus"""
        candidate_education = candidate.get('education_level', '').lower()
        jd_education = self._extract_required_education(jd_text)
        
        if not jd_education:
            return 0
        
        education_hierarchy = {
            'high school': 1,
            'bachelor': 2,
            'master': 3,
            'phd': 4
        }
        
        candidate_level = 0
        for level, value in education_hierarchy.items():
            if level in candidate_education:
                candidate_level = value
                break
        
        required_level = 0
        for level, value in education_hierarchy.items():
            if level in jd_education.lower():
                required_level = value
                break
        
        if candidate_level >= required_level:
            return 10
        else:
            return 0
    
    def _extract_required_education(self, jd_text):
        """Extract required education from job description"""
        education_keywords = ['bachelor', 'master', 'phd', 'degree']
        
        for keyword in education_keywords:
            if keyword in jd_text.lower():
                return keyword
        
        return ''
    
    def _analyze_skills_match(self, candidate, jd_text):
        """Analyze skills matching in detail"""
        candidate_skills = set(candidate.get('skills', []))
        jd_skills = self._extract_skills_from_jd(jd_text)
        
        if not jd_skills:
            return "No specific skills mentioned in JD"
        
        overlap = candidate_skills.intersection(jd_skills)
        missing = jd_skills - candidate_skills
        
        return {
            "matched_skills": list(overlap),
            "missing_skills": list(missing),
            "match_percentage": len(overlap) / len(jd_skills) * 100
        }
    
    def _analyze_experience_match(self, candidate, jd_text):
        """Analyze experience matching"""
        candidate_exp = candidate.get('experience_years', 0)
        required_exp = self._extract_required_experience(jd_text)
        
        if required_exp == 0:
            return "No specific experience requirement mentioned"
        
        if candidate_exp >= required_exp:
            status = "Meets requirement"
        elif candidate_exp >= required_exp * 0.7:
            status = "Close match"
        else:
            status = "Below requirement"
        
        return {
            "candidate_experience": candidate_exp,
            "required_experience": required_exp,
            "status": status,
            "gap": required_exp - candidate_exp
        }
    
    def _generate_recommendation(self, score):
        """Generate recommendation based on score"""
        if score >= 90:
            return "Strongly recommended"
        elif score >= 80:
            return "Recommended"
        elif score >= 70:
            return "Consider"
        elif score >= 60:
            return "Maybe consider"
        else:
            return "Not recommended"
    
    def _fallback_matching(self, jd_text, candidate_resumes):
        """Fallback matching if vectorization fails"""
        matches = []
        
        for i, candidate in enumerate(candidate_resumes):
            # Simple keyword-based matching
            jd_lower = jd_text.lower()
            candidate_text = candidate.get('text', '').lower()
            
            # Count keyword matches
            common_words = set(jd_lower.split()) & set(candidate_text.split())
            match_score = len(common_words) / max(len(jd_lower.split()), 1) * 100
            
            matches.append({
                "candidate_id": candidate.get('id', f"candidate_{i}"),
                "name": candidate.get('name', f"Candidate {i+1}"),
                "similarity_score": round(match_score, 2),
                "comprehensive_score": round(match_score, 2),
                "skills_match": "Fallback analysis",
                "experience_match": "Fallback analysis",
                "recommendation": "Fallback recommendation"
            })
        
        return matches




