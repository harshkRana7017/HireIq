export type UserRole = 'admin' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requirements: string[];
  skills: string[];
  salary: string;
  applicantsCount: number;
  isOpen: boolean;
  createdAt: string;
}

export interface MatchAnalysis {
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  resumeFileName: string;
  resumeText: string;
  matchPercentage: number;
  matchCategory: 'low' | 'moderate' | 'high';
  matchAnalysis: MatchAnalysis;
  appliedDate: string;
  status: 'New' | 'Reviewing' | 'Interviewing' | 'Accepted' | 'Declined';
  interviewDate?: string;
  interviewTimeSlot?: string;
  meetLink?: string;
}

export interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  averageMatchRate: number;
  highMatchCount: number;
}
