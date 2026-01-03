import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import json
import os


class ResumeAnalyzer:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("✅ spaCy model loaded successfully")
        except OSError:
            print("⚠️  spaCy model 'en_core_web_sm' not found. Using fallback analysis.")
            self.nlp = None
        
        self.skills_keywords = self._load_skills_keywords()
        self.experience_patterns = self._load_experience_patterns()
        
    def _load_skills_keywords(self):
        """Load comprehensive skills keywords for better extraction"""
        return {
            "programming": ["python", "java", "javascript", "c++", "c#", "rust", "php", "ruby", "swift"],
            "web_tech": ["html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask"],
            "databases": ["sql", "dbms", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "oracle", "database"],
            "cloud": ["aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "google cloud skills boost"],
            "ml_ai": ["tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "matplotlib", "generative ai", "ai", "ml", "machine learning", "artificial intelligence"],
            "tools": ["git", "github", "jenkins", "confluence", "slack", "teams"]
        }
    
    def _load_experience_patterns(self):
        """Load experience extraction patterns"""
        return [
            r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            r'experience:\s*(\d+)\s*(?:years?|yrs?)',
            r'(\d+)\s*(?:years?|yrs?)\s*in\s*\w+',
        ]
    
    async def extract_text(self, file):
        """Extract text from uploaded resume file"""
        try:
            content = await file.read()
            
            if file.filename.endswith('.txt'):
                return content.decode('utf-8')
            elif file.filename.endswith('.pdf'):
                # Use PyPDF2 for PDF files
                try:
                    import PyPDF2
                    import io
                    
                    # Create a BytesIO object from the content
                    pdf_file = io.BytesIO(content)
                    
                    # Read PDF
                    pdf_reader = PyPDF2.PdfReader(pdf_file)
                    text = ""
                    
                    # Extract text from all pages
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                    
                    return text.strip()
                except ImportError:
                    print("PyPDF2 not available, trying fallback PDF handling")
                    # Fallback: try to decode as different encodings
                    for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                        try:
                            return content.decode(encoding)
                        except UnicodeDecodeError:
                            continue
                    # If all fail, return a basic message
                    return "PDF content could not be extracted. Please ensure PyPDF2 is installed."
            else:
                # For other file types, try different encodings
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        return content.decode(encoding)
                    except UnicodeDecodeError:
                        continue
                
                # If all fail, return basic content
                return str(content)
                
        except Exception as e:
            print(f"Error extracting text from file: {e}")
            return "Error extracting text from file. Please try again."
    
    def analyze(self, text):
        """Analyze resume text and return comprehensive analysis"""
        try:
            # Check if text extraction was successful
            if not text or text.startswith("Error") or text.startswith("PDF content could not be extracted"):
                print(f"Text extraction failed or returned invalid content: {text[:100] if text else 'Empty'}...")
                raise ValueError("Resume text could not be extracted. Please ensure the file is a valid PDF, DOC, DOCX, or TXT file.")
            
            # Validate resume content
            validity_check = self._check_resume_validity(text)
            if not validity_check["valid"]:
                raise ValueError(validity_check["message"])
            
            if self.nlp:
                doc = self.nlp(text.lower())
                skills_analysis = self._analyze_skills(doc)
            else:
                # Fallback analysis without spaCy
                skills_analysis = self._analyze_skills_fallback(text)
            
            # Extract basic information
            analysis = {
                "overall_score": 0,
                "skills_analysis": skills_analysis,
                "experience_analysis": self._analyze_experience(text),
                "education_analysis": self._analyze_education(text),
                "contact_info": self._extract_contact_info(text),
                "summary": self._generate_summary(text),
                "recommendations": []
            }
            
            # Calculate overall score
            analysis["overall_score"] = self._calculate_overall_score(analysis)
            
            # Generate recommendations
            analysis["recommendations"] = self._generate_recommendations(analysis)
            
            # Add warning if score is very low (likely not a tech resume)
            if analysis["overall_score"] < 20 and analysis["skills_analysis"].get("total_count", 0) == 0:
                analysis["warning"] = "This resume contains no recognizable technical skills. If you're applying for a technical position, consider highlighting your relevant technical skills and experience."
            
            return analysis
        except ValueError as e:
            # Re-raise ValueError with the message
            raise e
        except Exception as e:
            print(f"Error in analyze method: {str(e)}")
            raise ValueError(f"Failed to analyze resume: {str(e)}")
    
    def _analyze_skills(self, doc):
        """Analyze and categorize skills from the resume text"""
        skills_keywords = self._load_skills_keywords()
        text_lower = doc.text.lower()
        
        # Initialize skills categories
        skills_by_category = {category: [] for category in skills_keywords.keys()}
        all_skills = []
        
        # Extract skills by category
        for category, keywords in skills_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Handle variations and plurals
                    variations = [keyword, keyword + 's', keyword.replace(' ', ''), keyword.replace(' ', '-')]
                    for variation in variations:
                        if variation in text_lower:
                            # Get the actual skill name from the text (preserve case)
                            skill_name = self._extract_skill_name(text_lower, variation)
                            if skill_name and skill_name not in skills_by_category[category]:
                                skills_by_category[category].append(skill_name)
                                all_skills.append(skill_name)
                            break
        
        # Additional skill extraction for specific patterns
        additional_skills = self._extract_additional_skills(text_lower)
        all_skills.extend(additional_skills)
        
        # Remove duplicates while preserving order
        all_skills = list(dict.fromkeys(all_skills))
        
        # Calculate percentages
        total_skills = len(all_skills)
        skills_breakdown = {}
        for category, skills in skills_by_category.items():
            if total_skills > 0:
                percentage = round((len(skills) / total_skills) * 100, 1)
            else:
                percentage = 0
            skills_breakdown[category] = {
                'skills': skills,
                'count': len(skills),
                'percentage': percentage
            }
        
        return {
            'all_skills': all_skills,
            'by_category': skills_breakdown,
            'total_count': total_skills
        }
    
    def _extract_skill_name(self, text_lower, keyword):
        """Extract the actual skill name from the text"""
        # Find the position of the keyword
        pos = text_lower.find(keyword)
        if pos == -1:
            return None
        
        # Look for the skill name in the original text context
        # This is a simplified approach - in production you might want more sophisticated text processing
        skill_name = keyword.title() if keyword.islower() else keyword
        
        # Special handling for specific skills
        if keyword == 'sql':
            skill_name = 'SQL'
        elif keyword == 'dbms':
            skill_name = 'DBMS'
        elif keyword == 'Artificial Intelligence':
            skill_name = 'AI'
        elif keyword == 'Machine Learning':
            skill_name = 'ML'
        elif keyword == 'generative ai':
            skill_name = 'Generative AI'
        elif keyword == 'google cloud skills boost':
            skill_name = 'Google Cloud Skills Boost'
        
        return skill_name
    
    def _extract_additional_skills(self, text_lower):
        """Extract additional skills that might not be in the predefined keywords"""
        additional_skills = []
        
        # Look for specific patterns in the text
        patterns = [
            r'generative ai',
            r'ai/ml',
            r'machine learning',
            r'artificial intelligence',
            r'data science',
            r'computer networks',
            r'web development',
            r'software development',
            r'problem solving',
            r'teamwork',
            r'collaboration',
            r'project management',
            r'rad model',
            r'inventory management',
            r'order management',
            r'google cloud skills boost',
            r'gen ai',
            r'computer science',
            r'engineering',
            r'problem-solving',
            r'fast learning',
            r'adaptability'
        ]
        
        for pattern in patterns:
            if pattern in text_lower:
                # Convert pattern to readable skill name
                skill_name = pattern.replace('/', ' & ').replace('_', ' ').title()
                additional_skills.append(skill_name)
        
        # Special handling for database concepts
        if 'dbms concepts' in text_lower or 'database concepts' in text_lower:
            additional_skills.append('Database Concepts')
        
        # Special handling for Google Cloud specialization
        if 'google cloud skills boost' in text_lower:
            additional_skills.extend(['Google Cloud', 'Cloud Skills', 'AI Specialization'])
        
        return additional_skills
    
    def _analyze_experience(self, text):
        """Analyze work experience"""
        experience_years = 0
        
        for pattern in self.experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                experience_years = max(experience_years, int(matches[0]))
                break
        
        return {
            "years": experience_years,
            "score": min(experience_years * 10, 100),  # Cap at 100
            "level": self._categorize_experience_level(experience_years)
        }
    
    def _categorize_experience_level(self, years):
        """Categorize experience level"""
        if years < 2:
            return "Junior"
        elif years < 5:
            return "Mid-level"
        elif years < 10:
            return "Senior"
        else:
            return "Expert"
    
    def _analyze_education(self, text):
        """Analyze education background"""
        education_keywords = ["bachelor", "master", "phd", "degree", "university", "college"]
        education_score = 0
        
        for keyword in education_keywords:
            if keyword in text.lower():
                education_score += 20
        
        return {
            "score": min(education_score, 100),
            "has_degree": education_score > 0
        }
    
    def _extract_contact_info(self, text):
        """Extract contact information"""
        # Simple regex patterns for contact info
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A|a]{2,}\b'
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        email = re.findall(email_pattern, text)
        phone = re.findall(phone_pattern, text)
        
        return {
            "email": email[0] if email else None,
            "phone": phone[0] if phone else None
        }
    
    def _generate_summary(self, text):
        """Generate a summary of the resume"""
        # Use simple sentence splitting since NLTK is removed
        sentences = text.split('.')
        summary_sentences = sentences[:3]  # Take first 3 sentences
        return " ".join(summary_sentences)
    
    def _calculate_overall_score(self, analysis):
        """Calculate comprehensive overall resume score (0-100)"""
        
        # 1. SKILLS SCORE (35% weight) - Based on count and diversity
        skills_score = 0
        if analysis["skills_analysis"]:
            total_skills = analysis["skills_analysis"].get("total_count", 0)
            by_category = analysis["skills_analysis"].get("by_category", {})
            total_categories = len(by_category)
            
            if total_categories > 0:
                # Skill count score (max 50 points for 15+ skills)
                skill_count_score = min(total_skills / 15, 1) * 50
                
                # Diversity score (max 50 points for skills in 4+ categories)
                categories_with_skills = sum(1 for cat in by_category.values() if cat.get("count", 0) > 0)
                diversity_score = min(categories_with_skills / 4, 1) * 50
                
                skills_score = (skill_count_score + diversity_score) * 0.35
        
        # 2. EXPERIENCE SCORE (30% weight) - Based on years and quality
        experience_score = 0
        if analysis["experience_analysis"]:
            exp_base = analysis["experience_analysis"].get("score", 0)
            years = analysis["experience_analysis"].get("years", 0)
            
            # Bonus for more years (up to 10 years)
            years_bonus = min(years / 10, 1) * 20
            experience_score = (exp_base + years_bonus) * 0.30
        
        # 3. EDUCATION SCORE (20% weight)
        education_score = 0
        if analysis["education_analysis"]:
            edu_base = analysis["education_analysis"].get("score", 0)
            has_degree = analysis["education_analysis"].get("has_degree", False)
            
            # Bonus for having a degree
            degree_bonus = 20 if has_degree else 0
            education_score = min(edu_base + degree_bonus, 100) * 0.20
        
        # 4. CONTACT & PROFESSIONALISM SCORE (15% weight)
        contact_score = 0
        if analysis["contact_info"]:
            has_email = 40 if analysis["contact_info"].get("email") else 0
            has_phone = 30 if analysis["contact_info"].get("phone") else 0
            has_linkedin = 30 if analysis["contact_info"].get("linkedin") else 0
            contact_score = (has_email + has_phone + has_linkedin) * 0.15
        
        # Calculate total score
        total_score = skills_score + experience_score + education_score + contact_score
        
        # Ensure minimum score of 20 if resume has any content
        if total_score < 20 and analysis["skills_analysis"].get("total_count", 0) > 0:
            total_score = max(total_score, 25)
        
        return round(min(total_score, 100))
    
    def _generate_recommendations(self, analysis):
        """Generate improvement recommendations"""
        recommendations = []
        
        # Check skills diversity using the new structure
        skills_diversity = 0
        if analysis["skills_analysis"] and "by_category" in analysis["skills_analysis"]:
            total_categories = len(analysis["skills_analysis"]["by_category"])
            if total_categories > 0:
                categories_with_skills = sum(1 for cat in analysis["skills_analysis"]["by_category"].values() if cat.get("count", 0) > 0)
                skills_diversity = (categories_with_skills / total_categories) * 100
        
        if skills_diversity < 50:
            recommendations.append("Consider adding more diverse technical skills")
        
        if analysis["experience_analysis"]["score"] < 50:
            recommendations.append("Highlight more work experience and achievements")
        
        if analysis["education_analysis"]["score"] < 50:
            recommendations.append("Include more educational details and certifications")
        
        if not analysis["contact_info"]["email"]:
            recommendations.append("Add professional email address")
        
        return recommendations

    def _analyze_skills_fallback(self, text):
        """Fallback skills analysis without spaCy"""
        skills_found = {}
        total_skills = 0
        
        for category, keywords in self.skills_keywords.items():
            category_skills = []
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    category_skills.append(keyword)
                    total_skills += 1
            
            skills_found[category] = {
                "skills": category_skills,
                "count": len(category_skills),
                "score": len(category_skills) / len(keywords) * 100
            }
        
        return {
            "categories": skills_found,
            "total_skills": total_skills,
            "diversity_score": len([s for s in skills_found.values() if s["count"] > 0]) / len(skills_found) * 100
        }
    
    def _fallback_analysis(self, text):
        """Fallback analysis when main analysis fails - returns error instead of fake data"""
        raise ValueError("Unable to analyze resume. The resume content could not be properly extracted or is empty.")

    def _check_resume_validity(self, text):
        """Check if the resume is valid for technical job analysis"""
        if not text or len(text.strip()) < 50:
            return {
                "valid": False,
                "reason": "empty",
                "message": "The resume appears to be empty or contains insufficient content. Please upload a valid resume with your professional details."
            }
        
        # Check for non-technical/irrelevant content
        non_tech_indicators = [
            "recipe", "cooking", "ingredients", "tablespoon", "teaspoon", "bake", "fry",
            "menu", "restaurant", "dish", "cuisine", "chef", "kitchen",
            "fiction", "chapter", "novel", "story", "once upon a time",
            "lyrics", "verse", "chorus", "song"
        ]
        
        text_lower = text.lower()
        found_indicators = [ind for ind in non_tech_indicators if ind in text_lower]
        
        if len(found_indicators) >= 3:
            return {
                "valid": False,
                "reason": "non_technical",
                "message": f"This document appears to be a {self._detect_document_type(text_lower)}, not a professional resume. Please upload a valid resume with your work experience, skills, and education."
            }
        
        # Check for minimum resume-like content
        resume_indicators = [
            "experience", "education", "skills", "work", "job", "project",
            "university", "college", "degree", "company", "position", "role",
            "email", "@", "phone", "linkedin", "github", "objective", "summary"
        ]
        
        found_resume_content = sum(1 for ind in resume_indicators if ind in text_lower)
        
        if found_resume_content < 2:
            return {
                "valid": False,
                "reason": "not_resume",
                "message": "This document does not appear to be a professional resume. A resume should include sections like experience, education, skills, and contact information."
            }
        
        return {"valid": True, "reason": None, "message": None}
    
    def _detect_document_type(self, text_lower):
        """Detect what type of non-resume document this might be"""
        if any(word in text_lower for word in ["recipe", "cooking", "ingredients", "bake"]):
            return "recipe or cooking document"
        elif any(word in text_lower for word in ["chapter", "novel", "story", "fiction"]):
            return "story or fiction document"
        elif any(word in text_lower for word in ["lyrics", "verse", "chorus"]):
            return "song lyrics"
        elif any(word in text_lower for word in ["menu", "restaurant", "dish"]):
            return "menu or restaurant document"
        else:
            return "non-resume document"
