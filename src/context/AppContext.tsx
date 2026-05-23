import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, Application, User, UserRole, DashboardStats } from '../types';
import { initialJobs, initialApplications } from '../data/mockData';
import { calculateMatchPercentage } from '../utils/matching';

interface AppContextType {
  currentUser: User | null;
  jobs: Job[];
  applications: Application[];
  stats: DashboardStats;
  login: (name: string, email: string, role: UserRole) => void;
  logout: () => void;
  addJob: (jobData: Omit<Job, 'id' | 'applicantsCount' | 'isOpen' | 'createdAt'>) => void;
  analyzing: boolean;
  addApplication: (
    jobId: string,
    candidateName: string,
    candidateEmail: string,
    resumeFileName: string,
    resumeText: string
  ) => Application;
  updateApplicationStatus: (appId: string, status: Application['status']) => void;
  deleteJob: (jobId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analyzing, setAnalyzing] = useState(false);
  // Initialize from LocalStorage or fallback to mocks
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('recruit_user');

    return saved ? JSON.parse(saved) : null;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('recruit_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('recruit_applications');
    return saved ? JSON.parse(saved) : initialApplications;
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalApplications: 0,
    averageMatchRate: 0,
    highMatchCount: 0,
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('recruit_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('recruit_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('recruit_applications', JSON.stringify(applications));
  }, [applications]);

  // Recalculate stats whenever jobs or applications change
  useEffect(() => {
    const totalJobs = jobs.length;
    const totalApplications = applications.length;


    const totalMatchRate = applications.reduce((sum, app) => sum + app.matchPercentage, 0);
    const averageMatchRate = totalApplications > 0 ? Math.round(totalMatchRate / totalApplications) : 0;

    const highMatchCount = applications.filter(app => app.matchCategory === 'high').length;

    setStats({
      totalJobs,
      totalApplications,
      averageMatchRate,
      highMatchCount,
    });
  }, [jobs, applications]);

  const login = (name: string, email: string, role: UserRole) => {
    const mockUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
    };
    setCurrentUser(mockUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'applicantsCount' | 'isOpen' | 'createdAt'>) => {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      isOpen: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const addApplication = async (
    jobId: string,
    candidateName: string,
    candidateEmail: string,
    resumeFileName: string,
    resumeText: string
  ): Promise<Application> => {
    setAnalyzing(true);
    try {
      const matchedJob = jobs.find(j => j.id === jobId) || jobs[0];

      // Calculate match percentage dynamically
      const { percentage, category, analysis } = await calculateMatchPercentage(resumeText, matchedJob);

      const newApp: Application = {
        id: `app-${Date.now()}`,
        jobId,
        candidateName,
        candidateEmail,
        resumeFileName,
        resumeText,
        matchPercentage: percentage,
        matchCategory: category,
        matchAnalysis: analysis,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'New'
      };

      setApplications(prev => [newApp, ...prev]);

      // Increment applicantsCount for that job
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? { ...job, applicantsCount: job.applicantsCount + 1 } : job
        )
      );

      return newApp
    }
    finally {
      setAnalyzing(false)
    }
  };

  const updateApplicationStatus = (appId: string, status: Application['status']) => {
    setApplications(prev =>
      prev.map(app => (app.id === appId ? { ...app, status } : app))
    );
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    setApplications(prev => prev.filter(app => app.jobId !== jobId));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        jobs,
        applications,
        stats,
        login,
        logout,
        addJob,
        analyzing,
        addApplication,
        updateApplicationStatus,
        deleteJob,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
