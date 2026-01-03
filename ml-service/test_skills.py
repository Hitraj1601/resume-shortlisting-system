#!/usr/bin/env python3

import spacy
from resume_analyzer import ResumeAnalyzer

def test_skills_extraction():
    """Test the skills extraction with sample resume text"""
    
    # Sample resume text based on user's resume
    sample_resume = """
    Resume
    Name: Purvesh Rohit
    Email ID: purveshr401@gmail.com
    Contact Number: 7859806528
    Location: Vadodara, India
    LinkedIn: linkedin.com/in/purvesh-rohit-6a3586324
    
    Career Objective
    Aspiring Computer Science Engineer with strong interest in software development and problem-solving. Seeking an opportunity as a Software Engineer Intern at Mastercard to apply my knowledge of programming, databases, and teamwork while gaining practical industry experience.
    
    Education
    Bachelor of Engineering in Computer Science & Engineering
    The Maharaja Sayajirao University of Baroda | July 2024 – Present
    CGPA: 7.67/10 (A+ Grade) | Current: 3rd Year
    
    Diploma in Computer Engineering
    Polytechnic, The Maharaja Sayajirao University of Baroda | June 2021 – May 2024
    Percentage: 82.48% (92.60 percentile) | Location: Vadodara, Gujarat
    
    Secondary School Certificate (10th Standard)
    GSEB Board | 2021
    Percentage: 82% | School: Gujarat Public School | Location: Vadodara
    
    Certifications
    Google Cloud Skills Boost – Generative AI Specialization (Ongoing)
    Beginner Path: Completed (July 2025)
    Intermediate Path: In Progress (Expected Aug 2025)
    Advanced Path: Expected Sep 2025
    
    Professional Experience / Internship
    Currently a fresher with no formal industry internship yet. Completed academic projects as part of coursework and self-learning.
    
    Projects, Seminars, Workshop
    Polytechnic Student Store Website (01/2024 – 03/2024)
    Final Year Team Project developed using the RAD Model.
    Built modules for inventory and order management using PHP and SQL.
    Contributed to backend logic and UI development.
    Improved efficiency of store operations through digital automation.
    
    Technical Skills
    Emerging Technologies: Generative AI, AI/ML fundamentals
    Programming Languages: Python, Java, JavaScript, PHP
    Databases: SQL, DBMS concepts
    Networking: Basic knowledge of computer networks
    Other Tools: Git/GitHub, Web Development (HTML, CSS, JS)
    
    Academic Achievements & Participation
    Completed Beginner Path of Generative AI Learning (Google Cloud Skills Boost).
    Presented team project at Polytechnic final year evaluation with positive feedback.
    Active participant in coding and AI/ML learning communities.
    
    Personal Information
    Date of Birth: 04/01/2005
    Languages Known: English, Hindi, Gujarati
    Passion/Hobbies: Exploring Generative AI, Problem-solving, Web Projects, Reading tech blogs
    
    Key Strengths
    Quick learner, Team-oriented, Curious, Strong foundation in coding basics
    
    Weaknesses
    Sometimes spend extra time perfecting details, but improving efficiency with quality.
    Limited professional industry exposure, compensated by strong academic projects and continuous learning.
    Occasionally hesitant to ask for help immediately, but improving through collaborative learning
    """
    
    try:
        # Initialize the analyzer
        analyzer = ResumeAnalyzer()
        
        # Process the text
        doc = spacy.load("en_core_web_sm")(sample_resume)
        
        # Analyze skills
        skills_result = analyzer._analyze_skills(doc)
        
        print("=== SKILLS ANALYSIS RESULTS ===")
        print(f"Total Skills Found: {skills_result.get('total_count', 0)}")
        print(f"All Skills: {skills_result.get('all_skills', [])}")
        print("\n=== SKILLS BY CATEGORY ===")
        
        if 'by_category' in skills_result:
            for category, data in skills_result['by_category'].items():
                print(f"\n{category.upper()}:")
                print(f"  Skills: {data.get('skills', [])}")
                print(f"  Count: {data.get('count', 0)}")
                print(f"  Percentage: {data.get('percentage', 0)}%")
        else:
            print("No category breakdown available")
            
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_skills_extraction()
