import { Job, Application } from '../types';

export const initialJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React/TypeScript)',
    department: 'Engineering',
    location: 'Remote (US & Canada)',
    type: 'Remote',
    description: 'We are seeking an experienced Frontend Developer to lead architectural initiatives on our SaaS dashboards. This role focuses on high-performance render pipelines, UI modularity, state managers, and fluid user interactions using React 19, TypeScript, and modern styling utilities.',
    requirements: [
      '5+ years professional experience building reactive user interfaces in web applications.',
      'Expert level knowledge of React Hooks, context API, and advanced optimization primitives.',
      'Highly proficient with TypeScript, modern bundlers (Vite/RSPack), and Tailwind CSS.',
      'Solid testing practices including Cypress, Jest, or Playwright unit & integration scopes.',
      'Excellent collaborative and mentor-focused team-working attitude.'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'State Management', 'Cypress', 'API Integration'],
    salary: '$135,000 - $165,000',
    applicantsCount: 3,
    isOpen: true,
    createdAt: '2026-05-15'
  },
  {
    id: 'job-2',
    title: 'SaaS Product Designer',
    department: 'Product & Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Join our collaborative product design unit to design intuitive, customer-facing workflows for developer and recruitment tools. You will lead wireframe generation, user research initiatives, and shape the core design tokens of our multi-platform UI kit.',
    requirements: [
      '3+ years working in SaaS product design, showing a stellar portfolio of complex interactive systems.',
      'Complete mastery of standard tooling inside Figma, including component libraries, auto layout, and mock prototype variables.',
      'Excellent grasp of dynamic viewport adjustments, responsive grid dynamics, and visual accessibility constraints.',
      'Familiarity with functional design handoffs and front-end layout concepts.'
    ],
    skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research'],
    salary: '$115,000 - $140,000',
    applicantsCount: 2,
    isOpen: true,
    createdAt: '2026-05-18'
  },
  {
    id: 'job-3',
    title: 'Staff Python Backend Engineer',
    department: 'Engineering',
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Architect scalable real-time algorithms for resume ingestion, indexing, and matching servers. You will lead the development of our service layer, tune heavy PostgreSQL databases, and manage caching structures for ultra-low-latency workflows.',
    requirements: [
      '6+ years creating resilient backend frameworks using Python (with FastAPI, Django, or Flask).',
      'Extensive background in query optimization and design with relational datastores (PostgreSQL).',
      'Hands-on experience with Redis asynchronous brokers, Celery, and streaming endpoints.',
      'Familiarity with cloud container deployments like Google Cloud Run, GKE, or Docker builds.'
    ],
    skills: ['Python', 'FastAPI', 'Postgres', 'Redis', 'Docker', 'gRPC', 'REST APIs'],
    salary: '$160,000 - $190,000',
    applicantsCount: 2,
    isOpen: true,
    createdAt: '2026-05-10'
  }
];

export const initialApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateName: 'Sarah Connor',
    candidateEmail: 'sarah.connor@cyberdyne.io',
    resumeFileName: 'sarah_connor_react_lead_cv.pdf',
    resumeText: 'Sarah Connor. Senior Web Developer with 6 years experience building modern websites. High mastery of React, TypeScript, custom State Management, Tailwind CSS, Vite, and API Integration. Integrated complex Cypress automated end-to-end testing suites for client-facing software lines.',
    matchPercentage: 94,
    matchCategory: 'high',
    matchAnalysis: {
      matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'State Management', 'Cypress', 'API Integration'],
      missingSkills: [],
      summary: 'Remarkable applicant. Perfect alignment with all functional skills. Possesses all listed criteria under engineering constraints, showing extensive hands-on proficiency with Tailwind and React.'
    },
    appliedDate: '2026-05-16',
    status: 'Interviewing'
  },
  {
    id: 'app-2',
    jobId: 'job-1',
    candidateName: 'Miles Dyson',
    candidateEmail: 'miles.dyson@cyberdyne.io',
    resumeFileName: 'miles_dyson_systems_analyst.pdf',
    resumeText: 'Miles Dyson. Backend systems developer. Specialized in database designs, hardware integrations, and neural processing units. Beginner-to-intermediate experience writing frontend UI layouts using standard React, TypeScript, and Tailwind CSS. Quick learner interested in upgrading legacy dashboards.',
    matchPercentage: 62,
    matchCategory: 'moderate',
    matchAnalysis: {
      matchedSkills: ['React', 'TypeScript', 'Tailwind CSS'],
      missingSkills: ['Vite', 'State Management', 'Cypress', 'API Integration'],
      summary: 'Solid foundational software elements. Strong engineering analytical logic, but shows some missing key frontend-specific tooling like Cypress and dedicated Vite modular setups.'
    },
    appliedDate: '2026-05-19',
    status: 'Reviewing'
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    candidateName: 'Arthur Pendragon',
    candidateEmail: 'arthur.king@camelot-solutions.com',
    resumeFileName: 'arthur_pendragon_ux_designer.pdf',
    resumeText: 'Arthur Pendragon. SaaS UX and Product Designer. Active in crafting design systems, component libraries, and visual tokens. Expert with Figma layout models, high-fidelity Prototyping, Wireframing, and carrying out extensive User Research phases with key clients.',
    matchPercentage: 92,
    matchCategory: 'high',
    matchAnalysis: {
      matchedSkills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research'],
      missingSkills: [],
      summary: 'Excellent alignment with modern SaaS criteria. Strongly validated skills in Figma, extensive systems engineering mindset, and heavy familiarity with front-end transitions.'
    },
    appliedDate: '2026-05-20',
    status: 'Interviewing'
  },
  {
    id: 'app-4',
    jobId: 'job-3',
    candidateName: 'Peter Parker',
    candidateEmail: 'peter.parker@dailybugle.com',
    resumeFileName: 'peter_parker_intern_ny.pdf',
    resumeText: 'Peter Parker. Freelance photographer and student creator. Minor Python scripting background used to sort files and run quick automated scripts. Enthusiastic learner with strong spatial awareness and collaborative adaptability.',
    matchPercentage: 38,
    matchCategory: 'low',
    matchAnalysis: {
      matchedSkills: ['Python'],
      missingSkills: ['FastAPI', 'Postgres', 'Redis', 'Docker', 'gRPC', 'REST APIs'],
      summary: 'Candidate does not meet the technical seniority requirements. While they possess basic Python skills, there is a lack of FastAPI, docker, or database clustering structures.'
    },
    appliedDate: '2026-05-21',
    status: 'New'
  },
  {
    id: 'app-5',
    jobId: 'job-2',
    candidateName: 'Clara Oswald',
    candidateEmail: 'clara.oswald@tardis.org',
    resumeFileName: 'clara_oswald_creative_cv.pdf',
    resumeText: 'Clara Oswald. Digital visual specialist and creative lead. Fluent in Figma design software, high-contrast typography styling, UI Design principles, and wireframes. Collaborative strategist focusing on human interactions.',
    matchPercentage: 74,
    matchCategory: 'moderate',
    matchAnalysis: {
      matchedSkills: ['Figma', 'UI Design', 'Wireframing'],
      missingSkills: ['Prototyping', 'Design Systems', 'User Research'],
      summary: 'Demonstrates deep creative layout sensibilities. Strong Figma expertise, but missing design systems structure or rigorous scientific user research processes.'
    },
    appliedDate: '2026-05-22',
    status: 'New'
  }
];
