#!/usr/bin/env python3
"""
Test the full resume analysis method
"""

from resume_analyzer import ResumeAnalyzer
import json

def test_full_analysis():
    # Your actual resume text
    resume_text = """Name: Purvesh Rohit
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
Final Year Team Project developed using the RAD Model. Built modules for inventory and order management using PHP and SQL. Contributed to backend logic and UI development. Improved efficiency of store operations through digital automation.

Technical Skills
Emerging Technologies: Generative AI, AI/ML fundamentals
Programming Languages: Python, Java, JavaScript, PHP
Databases: SQL, DBMS concepts
Networking: Basic knowledge of computer networks
Other Tools: Git/GitHub, Web Development (HTML, CSS, JS)

Academic Achievements & Participation
Completed Beginner Path of Generative AI Learning (Google Cloud Skills Boost). Presented team project at Polytechnic final year evaluation with positive feedback. Active participant in coding and AI/ML learning communities.

Personal Information
Date of Birth: 2005-08-30
Nationality: Indian
Languages: English, Hindi, Gujarati"""

    print("🔍 TESTING FULL RESUME ANALYSIS")
    print("=" * 50)
    
    # Initialize analyzer
    analyzer = ResumeAnalyzer()
    
    try:
        # Test the full analyze method
        full_analysis = analyzer.analyze(resume_text)
        print("FULL ANALYSIS RESULT:")
        print(json.dumps(full_analysis, indent=2))
        
        print("\n" + "=" * 50)
        print("SKILLS ANALYSIS CHECK:")
        if "skills_analysis" in full_analysis:
            skills = full_analysis["skills_analysis"]
            print(f"Has skills_analysis: ✅")
            print(f"Structure: {list(skills.keys())}")
            print(f"Total skills: {skills.get('total_count', 'NOT FOUND')}")
            if "by_category" in skills:
                print(f"By category: {list(skills['by_category'].keys())}")
            else:
                print("❌ No by_category in skills_analysis")
        else:
            print("❌ No skills_analysis in result")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_full_analysis()
