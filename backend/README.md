# Resume Shortlisting System - Backend

A comprehensive backend API for an AI-powered resume shortlisting system built with Node.js, Express, MongoDB Atlas, and Supabase.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: HR, Candidate, and Admin user roles
- **Job Vacancy Management**: Create, update, and manage job postings
- **Application Processing**: Handle job applications with AI scoring
- **AI Integration**: OpenAI-powered resume analysis and candidate matching
- **File Upload**: Resume and document management
- **Email Notifications**: Automated email system for various events
- **Real-time Updates**: Supabase integration for live data
- **Caching**: Redis-based caching for improved performance
- **Analytics**: Comprehensive reporting and insights

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Cache**: Redis
- **Authentication**: JWT + Supabase Auth
- **AI Services**: OpenAI GPT-4
- **File Storage**: Cloudinary + Supabase Storage
- **Email**: Nodemailer
- **Validation**: Joi + Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Supabase account
- OpenAI API key
- Redis server (optional)
- SMTP email service

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Fill in your configuration values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume_shortlisting

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | User registration | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | Private |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/refresh` | Refresh token | Public |
| POST | `/auth/forgot-password` | Forgot password | Public |
| POST | `/auth/reset-password` | Reset password | Public |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/profile` | Get user profile | Private |
| PUT | `/users/profile` | Update profile | Private |
| GET | `/users/:id` | Get user by ID | Private |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Vacancy Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/vacancies` | Get all vacancies | Public |
| GET | `/vacancies/:id` | Get vacancy by ID | Public |
| POST | `/vacancies` | Create vacancy | HR/Admin |
| PUT | `/vacancies/:id` | Update vacancy | HR/Admin |
| DELETE | `/vacancies/:id` | Delete vacancy | HR/Admin |
| GET | `/vacancies/active` | Get active vacancies | Public |
| GET | `/vacancies/urgent` | Get urgent vacancies | Public |

### AI Services

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/ai/analyze-resume` | Analyze resume | Private |
| POST | `/ai/analyze-jd` | Analyze job description | HR/Admin |
| POST | `/ai/compare-candidates` | Compare candidates | HR/Admin |

### Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/applications` | Get all applications | HR/Admin |
| GET | `/applications/vacancy/:id` | Get applications by vacancy | HR/Admin |

## 🗄️ Database Models

### User Model
- Basic info (name, email, password)
- Role-based access (hr, candidate, admin)
- Profile details (skills, experience, location)
- Preferences and settings

### Vacancy Model
- Job details (title, description, requirements)
- Company information
- Application tracking
- AI analysis results

### Application Model
- Candidate application data
- AI scoring and analysis
- Interview scheduling
- Status tracking

### AI Analysis Model
- Analysis results and scores
- Processing metadata
- Error logging
- Performance metrics

## 🔐 Authentication & Authorization

### JWT Tokens
- Access token: 7 days validity
- Refresh token: 30 days validity
- Automatic token refresh

### Role-Based Access Control
- **HR**: Manage vacancies, view applications, analyze candidates
- **Candidate**: Apply for jobs, view profile, track applications
- **Admin**: Full system access, user management

### Security Features
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🤖 AI Integration

### Resume Analysis
- Skills matching
- Experience scoring
- Cultural fit assessment
- Communication evaluation
- Detailed recommendations

### Job Description Analysis
- Skills extraction
- Experience requirements
- Cultural indicators
- Salary range analysis

### Candidate Comparison
- Multi-candidate ranking
- Strengths/weaknesses analysis
- Interview priority
- Risk assessment

## 📧 Email System

### Templates
- Email verification
- Password reset
- Application confirmation
- Status updates
- Interview scheduling

### Features
- HTML email templates
- Bulk email sending
- Delivery tracking
- Error handling

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-production-mongodb-uri
   ```

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start src/server.js --name "resume-backend"
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring & Logging

- Request logging with Morgan
- Error tracking and logging
- Performance monitoring
- Health check endpoints
- Graceful shutdown handling

## 🔧 Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent error handling
- Comprehensive documentation

### Database Migrations
- Mongoose schemas with validation
- Index optimization
- Data integrity constraints

### API Design
- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Error handling middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔮 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Mobile app API
- [ ] Integration with job boards
- [ ] Advanced AI models
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Performance optimization
