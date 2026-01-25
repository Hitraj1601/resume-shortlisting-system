import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building, Calendar, DollarSign, Star, Filter } from 'lucide-react';
import { useResume } from '@/contexts/ResumeContext';
import { useVacancy } from '@/contexts/VacancyContext';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | { min?: number; max?: number; currency?: string };
  deadline: string;
  description: string;
  requirements: string | string[];
  skills: string[];
  experience: string | { min?: number; max?: number };
  matchScore?: number;
}

const JobSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const { resumeData, applyToJob, isJobApplied } = useResume();
  const { openVacancies } = useVacancy();

  // Helper to format salary for display
  const formatSalary = (salary: any): string => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'object') {
      const { min, max, currency = 'USD' } = salary;
      if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
      if (min) return `${currency} ${min.toLocaleString()}+`;
      if (max) return `Up to ${currency} ${max.toLocaleString()}`;
      return 'Not specified';
    }
    return String(salary);
  };

  // Memoize jobs with match scores to prevent recalculation on every render
  const jobs: Job[] = useMemo(() => {
    // Calculate match score for a vacancy - deterministic calculation
    const calculateMatchScore = (vacancy: any, resumeSkillsData: any): number => {
      if (!resumeSkillsData?.by_category) {
        // Generate a deterministic score based on vacancy id hash
        const hash = vacancy.id?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0;
        return 70 + (hash % 25); // Score between 70-94 based on id
      }

      try {
        // Extract skills from resume analysis
        const resumeSkills = Object.values(resumeSkillsData.by_category)
          .flat()
          .map((skill: any) => typeof skill === 'string' ? skill.toLowerCase() : String(skill).toLowerCase());

        // Get vacancy skills
        const vacancySkills = vacancy.skills?.map((skill: string) => skill.toLowerCase()) || [];

        if (vacancySkills.length === 0) {
          // Generate deterministic score based on vacancy id
          const hash = vacancy.id?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0;
          return 70 + (hash % 20); // Score between 70-89 based on id
        }

        // Calculate skills match percentage
        const matchedSkills = vacancySkills.filter((skill: string) => 
          resumeSkills.some((resumeSkill: string) => 
            resumeSkill.includes(skill) || skill.includes(resumeSkill)
          )
        );

        const skillsMatch = Math.round((matchedSkills.length / vacancySkills.length) * 100);
        
        // Base score with skills bonus
        let baseScore = 70;
        if (skillsMatch > 50) {
          baseScore += Math.min(skillsMatch - 50, 30); // Max 30 points bonus
        }

        return Math.min(baseScore, 100);
      } catch (error) {
        console.error('Error calculating match score:', error);
        // Generate deterministic fallback based on vacancy id
        const hash = vacancy.id?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0;
        return 70 + (hash % 20);
      }
    };

    return openVacancies.map(vacancy => {
      const matchScore = calculateMatchScore(vacancy, resumeData?.skillsAnalysis);
      return {
        id: vacancy.id,
        title: vacancy.title,
        company: vacancy.company,
        location: vacancy.location,
        type: vacancy.type,
        salary: vacancy.salary,
        deadline: vacancy.deadline,
        description: vacancy.description,
        requirements: vacancy.requirements,
        skills: vacancy.skills,
        experience: vacancy.experience,
        matchScore
      };
    });
  }, [openVacancies, resumeData?.skillsAnalysis]);



  const handleApply = async (job: Job) => {
    try {
      // Find the original vacancy data to pass to applyToJob
      const vacancyData = openVacancies.find(v => v.id === job.id);
      await applyToJob(job.id, job.title, job.company, vacancyData);
      toast.success(`Successfully applied to ${job.title} at ${job.company}`);
    } catch (error) {
      toast.error('Failed to apply for the job. Please try again.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    // Experience level filtering (you can customize this based on your vacancy data structure)
    const matchesExperience = selectedExperience === 'all' || true; // Placeholder for now
    
    return matchesSearch && matchesType && matchesLocation && matchesExperience;
  });

  const jobTypes = ['all', ...Array.from(new Set(jobs.map(job => job.type)))];
  const locations = ['all', ...Array.from(new Set(jobs.map(job => job.location)))];
  const experienceLevels = ['all', 'Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'];

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedLocation('all');
    setSelectedExperience('all');
    setSortBy('relevance');
  };

  // Sort jobs based on selected criteria
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'matchScore':
        return (b.matchScore || 0) - (a.matchScore || 0);
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'salary':
        // Extract numeric value from salary for comparison
        const getSalaryValue = (salary: any): number => {
          if (!salary) return 0;
          if (typeof salary === 'string') return parseInt(salary.replace(/[^0-9]/g, '')) || 0;
          if (typeof salary === 'object') return salary.max || salary.min || 0;
          return 0;
        };
        return getSalaryValue(b.salary) - getSalaryValue(a.salary);
      default:
        return 0; // relevance - no sorting
    }
  });

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
          <p className="text-gray-600">
            Find your next opportunity from {jobs.length} available positions
          </p>
        </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              {(selectedType !== 'all' || selectedLocation !== 'all' || selectedExperience !== 'all') && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Enter city or location..."
                      value={selectedLocation === 'all' ? '' : selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value || 'all')}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Experience Level</label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>
                        {level === 'all' ? 'All Levels' : level}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="matchScore">Match Score</option>
                    <option value="deadline">Deadline</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {sortedJobs.length} job{sortedJobs.length !== 1 ? 's' : ''} found
          {filteredJobs.length !== sortedJobs.length && ` (${filteredJobs.length} total)`}
        </p>
        {showFilters && (
          <div className="flex gap-2">
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Type: {selectedType}
              </Badge>
            )}
            {selectedLocation !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Location: {selectedLocation}
              </Badge>
            )}
            {selectedExperience !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Experience: {selectedExperience}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {job.title}
                  </CardTitle>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                </div>
                {job.matchScore && (
                  <Badge className={`ml-2 ${getMatchScoreColor(job.matchScore)}`}>
                    {job.matchScore}% Match
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {job.location}
              </div>
              
                             <div className="flex items-center text-sm text-gray-600">
                 <Building className="h-4 w-4 mr-2" />
                 {job.type}
               </div>
               
               <div className="flex items-center text-sm text-gray-600">
                 <DollarSign className="h-4 w-4 mr-2" />
                 {formatSalary(job.salary)}
               </div>
               
               <div className="flex items-center text-sm text-gray-600">
                 <Calendar className="h-4 w-4 mr-2" />
                 {formatDeadline(job.deadline)}
               </div>
               
               <div className="flex items-center text-sm text-gray-600">
                 <Star className="h-4 w-4 mr-2" />
                 {typeof job.experience === 'object' 
                   ? `${job.experience.min || 0}-${job.experience.max || 0} years`
                   : (job.experience || 'Not specified')}
               </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {job.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => handleApply(job)}
                className="w-full"
                disabled={!resumeData || isJobApplied(job.id)}
                variant={isJobApplied(job.id) ? "secondary" : "default"}
              >
                {!resumeData 
                  ? 'Upload Resume First' 
                  : isJobApplied(job.id) 
                    ? '✓ Applied' 
                    : 'Apply Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      )}
        </div>
      </DashboardLayout>
    );
  };

export default JobSearch;