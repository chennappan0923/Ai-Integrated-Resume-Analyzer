export interface ScoreTrendItem {
  resumeName: string;
  atsScore: number;
  resumeScore: number;
  date: string;
}

export interface SkillCountItem {
  skill: string;
  count: number;
}

export interface DashboardSummary {
  totalResumes: number;
  averageAtsScore: number;
  bestResumeScore: number;
  totalAnalyses: number;
  scoreTrends: ScoreTrendItem[];
  missingSkills: SkillCountItem[];
}
