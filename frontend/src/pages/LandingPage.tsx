import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/custom-button'
import { Brain, Users, FileText, TrendingUp, Star, Shield } from 'lucide-react'
import heroImage from '@/assets/hero-bg.jpg'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Advanced algorithms analyze resumes and match candidates with precision"
    },
    {
      icon: TrendingUp,
      title: "Smart Rankings",
      description: "Candidates ranked by compatibility, skills match, and experience relevance"
    },
    {
      icon: FileText,
      title: "Resume Analysis",
      description: "Detailed breakdown of skills, experience, and qualifications"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for HR professionals and job seekers"
    },
    {
      icon: Star,
      title: "Quality Scoring",
      description: "Comprehensive scoring system for objective candidate evaluation"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security for sensitive candidate information"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ResumeAI
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart Resume Shortlisting
              <span className="block text-accent">Powered by AI</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Transform your hiring process with intelligent candidate matching. 
              Find the perfect fit faster with AI-driven resume analysis and ranking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="glass" 
                size="xl"
                onClick={() => navigate('/register?role=hr')}
                className="w-full sm:w-auto"
              >
                <Users className="w-5 h-5 mr-2" />
                I'm an HR Professional
              </Button>
              <Button 
                variant="glass" 
                size="xl"
                onClick={() => navigate('/register?role=candidate')}
                className="w-full sm:w-auto"
              >
                <FileText className="w-5 h-5 mr-2" />
                I'm a Job Seeker
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ResumeAI?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI technology to streamline your recruitment process
              and discover top talent efficiently.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl hover-lift shadow-lg border"
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ResumeAI</span>
          </div>
          <p className="text-background/70">
            © 2024 ResumeAI. Revolutionizing recruitment with artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage