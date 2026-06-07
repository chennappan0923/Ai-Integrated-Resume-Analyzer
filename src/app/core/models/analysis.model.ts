export interface ResumeAnalysis {
  id: number;
  resumeId: number;
  resumeName: string;
  resumeScore: number;
  atsScore: number;
  careerLevel: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  suggestions: string[];
  recommendedRoles: string[];
  createdDate: string;
}

export interface AnalysisHistoryItem {
  id: number;
  resumeId: number;
  resumeName: string;
  resumeScore: number;
  atsScore: number;
  careerLevel: string;
  createdDate: string;
}
