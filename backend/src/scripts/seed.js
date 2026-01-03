import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Vacancy from '../models/Vacancy.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Vacancy.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@resumeai.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
    console.log('👑 Created admin user');

    // Create HR user
    const hrPassword = await bcrypt.hash('hr123', 12);
    const hrUser = await User.create({
      name: 'HR Manager',
      email: 'hr@demo.com',
      password: hrPassword,
      role: 'hr',
      company: 'TechCorp',
      isVerified: true,
      isActive: true,
      skills: ['Recruitment', 'HR Management', 'Talent Acquisition'],
      location: 'San Francisco, CA',
    });
    console.log('👔 Created HR user');

    // Create candidate users
    const candidate1Password = await bcrypt.hash('candidate123', 12);
    const candidate1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      password: candidate1Password,
      role: 'candidate',
      experience: '5 years',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      location: 'San Francisco, CA',
      isVerified: true,
      isActive: true,
      bio: 'Experienced full-stack developer with expertise in modern web technologies.',
    });

    const candidate2Password = await bcrypt.hash('candidate123', 12);
    const candidate2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      password: candidate2Password,
      role: 'candidate',
      experience: '4 years',
      skills: ['React', 'Vue.js', 'JavaScript', 'Python', 'Docker'],
      location: 'Seattle, WA',
      isVerified: true,
      isActive: true,
      bio: 'Passionate developer with strong frontend and backend skills.',
    });

    const candidate3Password = await bcrypt.hash('candidate123', 12);
    const candidate3 = await User.create({
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@email.com',
      password: candidate3Password,
      role: 'candidate',
      experience: '3 years',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Figma'],
      location: 'Denver, CO',
      isVerified: true,
      isActive: true,
      bio: 'Frontend developer with a keen eye for design and user experience.',
    });
    console.log('👥 Created candidate users');

    // Create sample vacancies
    const vacancy1 = await Vacancy.create({
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Remote',
      experience: '3-5 years',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      description: 'Join our innovative team to build cutting-edge web applications using modern technologies. We are looking for a passionate developer who loves creating exceptional user experiences.',
      requirements: [
        '3+ years React experience',
        'TypeScript proficiency',
        'REST/GraphQL APIs',
        'Agile methodology',
        'Strong problem-solving skills'
      ],
      responsibilities: [
        'Develop and maintain web applications',
        'Collaborate with design and backend teams',
        'Write clean, maintainable code',
        'Participate in code reviews',
        'Mentor junior developers'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Remote work options',
        'Professional development',
        'Flexible working hours'
      ],
      salary: {
        min: 120000,
        max: 180000,
        currency: 'USD',
        period: 'yearly'
      },
      openings: 2,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'open',
      postedBy: hrUser._id,
      tags: ['Frontend', 'React', 'TypeScript', 'Remote'],
      industry: 'Technology',
      department: 'Engineering',
      isRemote: true,
    });

    const vacancy2 = await Vacancy.create({
      title: 'UX/UI Designer',
      company: 'DesignHub',
      location: 'New York, NY',
      type: 'Hybrid',
      experience: '2-4 years',
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping'],
      description: 'Create intuitive and beautiful user experiences for our digital products. We need a creative designer who can translate user needs into elegant solutions.',
      requirements: [
        'Portfolio required',
        'Figma expertise',
        'User research experience',
        'Design systems knowledge',
        'Prototyping skills'
      ],
      responsibilities: [
        'Design user interfaces and experiences',
        'Conduct user research and testing',
        'Create design systems and guidelines',
        'Collaborate with product and engineering teams',
        'Present design solutions to stakeholders'
      ],
      benefits: [
        'Competitive salary',
        'Health and dental insurance',
        'Professional development budget',
        'Creative work environment',
        'Flexible schedule'
      ],
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD',
        period: 'yearly'
      },
      openings: 1,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      status: 'open',
      postedBy: hrUser._id,
      tags: ['Design', 'UX/UI', 'Figma', 'Creative'],
      industry: 'Design',
      department: 'Product Design',
      isRemote: false,
    });

    const vacancy3 = await Vacancy.create({
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      type: 'Onsite',
      experience: '4-6 years',
      skills: ['Python', 'Django', 'React', 'PostgreSQL'],
      description: 'Build scalable web applications from concept to deployment. Join our fast-growing startup and make a real impact on our product.',
      requirements: [
        'Full stack experience',
        'Python/Django',
        'Database design',
        'AWS/Cloud platforms',
        'Startup mindset'
      ],
      responsibilities: [
        'Develop full-stack web applications',
        'Design and implement database schemas',
        'Deploy and maintain applications',
        'Collaborate with cross-functional teams',
        'Contribute to technical decisions'
      ],
      benefits: [
        'Equity options',
        'Health insurance',
        'Flexible PTO',
        'Learning budget',
        'Team events'
      ],
      salary: {
        min: 100000,
        max: 150000,
        currency: 'USD',
        period: 'yearly'
      },
      openings: 1,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'open',
      postedBy: hrUser._id,
      tags: ['Full Stack', 'Python', 'Django', 'Startup'],
      industry: 'Technology',
      department: 'Engineering',
      isRemote: false,
    });
    console.log('💼 Created sample vacancies');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`- Admin User: admin@resumeai.com / admin123`);
  console.log(`- HR User: hr@demo.com / hr123`);
    console.log(`- Candidate Users: candidate123 (for all candidates)`);
    console.log(`- 3 Sample Job Vacancies`);
    console.log('\n🔗 You can now test the API endpoints!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedData();
