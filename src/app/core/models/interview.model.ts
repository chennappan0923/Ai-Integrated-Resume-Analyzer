export interface InterviewQuestion {
  id: number;
  question: string;
  category: 'Technical' | 'Behavioral' | 'HR' | 'Scenario';
  createdDate: string;
}
