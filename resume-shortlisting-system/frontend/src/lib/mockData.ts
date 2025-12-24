// Mock Data for Demo

// Demo Login Credentials
export const demoCredentials = {
  hr: {
    email: "hr@demo.com",
    password: "hr123",
    role: "hr"
  },
  candidate: {
    email: "candidate@demo.com", 
    password: "candidate123",
    role: "candidate"
  }
}

// Mock Job Vacancies
export const mockVacancies = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Remote",
    experience: "3-5 years",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    applicants: 15,
    deadline: "2024-02-15",
    status: "open",
    description: "Join our innovative team to build cutting-edge web applications using modern technologies.",
    requirements: ["3+ years React experience", "TypeScript proficiency", "REST/GraphQL APIs", "Agile methodology"],
    openings: 2
  },
  {
    id: "2", 
    title: "UX/UI Designer",
    company: "DesignHub",
    location: "New York, NY",
    type: "Hybrid",
    experience: "2-4 years",
    skills: ["Figma", "Sketch", "Adobe Creative Suite", "Prototyping"],
    applicants: 8,
    deadline: "2024-02-20",
    status: "open",
    description: "Create intuitive and beautiful user experiences for our digital products.",
    requirements: ["Portfolio required", "Figma expertise", "User research experience", "Design systems knowledge"],
    openings: 1
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Austin, TX", 
    type: "Onsite",
    experience: "4-6 years",
    skills: ["Python", "Django", "React", "PostgreSQL"],
    applicants: 23,
    deadline: "2024-01-30",
    status: "closed",
    description: "Build scalable web applications from concept to deployment.",
    requirements: ["Full stack experience", "Python/Django", "Database design", "AWS/Cloud platforms"],
    openings: 1
  }
]

// Mock Applications for candidates
export const mockApplications = [
  {
    id: "app1",
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    appliedDate: "2024-01-15",
    status: "Applied",
    aiScore: 85,
    skillsMatch: 90,
    experienceScore: 80,
    lastUpdated: "2024-01-15",
    notes: "Strong React skills, good cultural fit"
  },
  {
    id: "app2",
    jobId: "2",
    jobTitle: "UX/UI Designer",
    company: "DesignHub",
    appliedDate: "2024-01-10",
    status: "Under Review",
    aiScore: 78,
    skillsMatch: 75,
    experienceScore: 70,
    lastUpdated: "2024-01-12",
    notes: "Portfolio review in progress"
  },
  {
    id: "app3",
    jobId: "3",
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    appliedDate: "2024-01-05",
    status: "Rejected",
    aiScore: 65,
    skillsMatch: 60,
    experienceScore: 55,
    lastUpdated: "2024-01-08",
    notes: "Skills mismatch - more backend focused"
  }
]

// Mock Candidates with AI Scores
export const mockCandidates = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1-555-0123",
    location: "San Francisco, CA",
    experience: "5 years",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
    aiScore: 92,
    skillsMatch: 95,
    experienceScore: 88,
    certifications: ["AWS Solutions Architect", "React Developer Certification"],
    resumeUrl: "/resumes/alex_johnson.pdf",
    appliedDate: "2024-01-20",
    rank: 1,
    strengths: ["Strong React expertise", "Cloud architecture experience", "Leadership skills"],
    weaknesses: ["Limited mobile development", "No design experience"]
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@email.com", 
    phone: "+1-555-0124",
    location: "Seattle, WA",
    experience: "4 years",
    skills: ["React", "Vue.js", "JavaScript", "Python", "Docker"],
    aiScore: 87,
    skillsMatch: 89,
    experienceScore: 85,
    certifications: ["Google Cloud Professional", "Scrum Master"],
    resumeUrl: "/resumes/sarah_chen.pdf",
    appliedDate: "2024-01-18",
    rank: 2,
    strengths: ["Full stack capabilities", "Modern frameworks", "Team collaboration"],
    weaknesses: ["Limited GraphQL experience", "No TypeScript projects"]
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    email: "mike.rodriguez@email.com",
    phone: "+1-555-0125", 
    location: "Denver, CO",
    experience: "3 years",
    skills: ["React", "JavaScript", "HTML/CSS", "Git", "Figma"],
    aiScore: 78,
    skillsMatch: 75,
    experienceScore: 80,
    certifications: ["Frontend Masters Certificate"],
    resumeUrl: "/resumes/mike_rodriguez.pdf",
    appliedDate: "2024-01-22",
    rank: 3,
    strengths: ["Strong frontend skills", "Design awareness", "Quick learner"],
    weaknesses: ["Limited backend experience", "No cloud platform knowledge"]
  }
]

// Mock User Profile
export const mockUser = {
  hr: {
    id: "hr1",
    name: "Jennifer Smith",
    email: "hr@demo.com",
    role: "hr" as const,
    company: "TechCorp Inc.",
    avatar: "/avatars/hr-avatar.jpg"
  },
  candidate: {
    id: "candidate1", 
    name: "John Doe",
    email: "candidate@demo.com",
    role: "candidate" as const,
    experience: "3 years",
    skills: ["React", "JavaScript", "Python"],
    avatar: "/avatars/candidate-avatar.jpg"
  }
}

// Mock Notifications
export const mockNotifications = [
  {
    id: "1",
    type: "application",
    title: "New Application Received",
    message: "Alex Johnson applied for Senior Frontend Developer position",
    time: "2 hours ago",
    read: false
  },
  {
    id: "2", 
    type: "deadline",
    title: "Application Deadline Approaching",
    message: "UX/UI Designer position closes in 3 days",
    time: "1 day ago",
    read: true
  }
]