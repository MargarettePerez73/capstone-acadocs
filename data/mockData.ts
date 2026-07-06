export interface Teacher {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
}

export interface Submission {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  gradeLevel: string;
  type: 'DLL' | 'Lesson Plan' | 'Monthly Test' | 'Assessment';
  week: string;
  submittedAt: string | null;
  status: 'submitted' | 'pending' | 'missing';
  plagiarismScore?: number;
  plagiarismStatus?: 'clean' | 'flagged' | 'checking';
}

export interface MpsRecord {
  id: string;
  subject: string;
  gradeLevel: string;
  quarter: string;
  totalItems: number;
  totalScore: number;
  mps: number;
  learners: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  createdAt: string;
  priority: 'high' | 'normal';
}

export interface Link {
  id: string;
  label: string;
  url: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const TEACHERS: Teacher[] = [
  { id: 't1', name: 'Mr. Juan Dela Cruz', subject: 'Mathematics', gradeLevel: 'Grade 7' },
  { id: 't2', name: 'Ms. Carla Bautista', subject: 'Science', gradeLevel: 'Grade 8' },
  { id: 't3', name: 'Mr. Rico Santos', subject: 'English', gradeLevel: 'Grade 9' },
  { id: 't4', name: 'Ms. Grace Flores', subject: 'Filipino', gradeLevel: 'Grade 10' },
  { id: 't5', name: 'Mr. Noel Rivera', subject: 'Araling Panlipunan', gradeLevel: 'Grade 7' },
  { id: 't6', name: 'Ms. Donna Villanueva', subject: 'MAPEH', gradeLevel: 'Grade 8' },
];

export const SUBMISSIONS: Submission[] = [
  {
    id: 's1', teacherId: 't1', teacherName: 'Mr. Juan Dela Cruz',
    subject: 'Mathematics', gradeLevel: 'Grade 7', type: 'DLL',
    week: 'Week 1', submittedAt: '2025-01-06 08:30', status: 'submitted',
    plagiarismScore: 4, plagiarismStatus: 'clean',
  },
  {
    id: 's2', teacherId: 't2', teacherName: 'Ms. Carla Bautista',
    subject: 'Science', gradeLevel: 'Grade 8', type: 'DLL',
    week: 'Week 1', submittedAt: '2025-01-06 09:15', status: 'submitted',
    plagiarismScore: 32, plagiarismStatus: 'flagged',
  },
  {
    id: 's3', teacherId: 't3', teacherName: 'Mr. Rico Santos',
    subject: 'English', gradeLevel: 'Grade 9', type: 'Lesson Plan',
    week: 'Week 1', submittedAt: null, status: 'missing',
  },
  {
    id: 's4', teacherId: 't4', teacherName: 'Ms. Grace Flores',
    subject: 'Filipino', gradeLevel: 'Grade 10', type: 'DLL',
    week: 'Week 1', submittedAt: null, status: 'pending',
  },
  {
    id: 's5', teacherId: 't5', teacherName: 'Mr. Noel Rivera',
    subject: 'Araling Panlipunan', gradeLevel: 'Grade 7', type: 'DLL',
    week: 'Week 1', submittedAt: '2025-01-07 10:00', status: 'submitted',
    plagiarismScore: 8, plagiarismStatus: 'clean',
  },
  {
    id: 's6', teacherId: 't6', teacherName: 'Ms. Donna Villanueva',
    subject: 'MAPEH', gradeLevel: 'Grade 8', type: 'Monthly Test',
    week: 'Week 1', submittedAt: '2025-01-07 11:30', status: 'submitted',
    plagiarismScore: 15, plagiarismStatus: 'clean',
  },
];

export const MPS_RECORDS: MpsRecord[] = [
  { id: 'm1', subject: 'Mathematics', gradeLevel: 'Grade 7', quarter: 'Q1', totalItems: 50, totalScore: 1820, mps: 72.8, learners: 50 },
  { id: 'm2', subject: 'Science', gradeLevel: 'Grade 8', quarter: 'Q1', totalItems: 50, totalScore: 1950, mps: 78.0, learners: 50 },
  { id: 'm3', subject: 'English', gradeLevel: 'Grade 9', quarter: 'Q1', totalItems: 50, totalScore: 1680, mps: 67.2, learners: 50 },
  { id: 'm4', subject: 'Filipino', gradeLevel: 'Grade 10', quarter: 'Q1', totalItems: 50, totalScore: 2050, mps: 82.0, learners: 50 },
  { id: 'm5', subject: 'Araling Panlipunan', gradeLevel: 'Grade 7', quarter: 'Q1', totalItems: 50, totalScore: 1750, mps: 70.0, learners: 50 },
  { id: 'm6', subject: 'MAPEH', gradeLevel: 'Grade 8', quarter: 'Q1', totalItems: 50, totalScore: 1900, mps: 76.0, learners: 50 },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'DLL Submission Deadline — Week 2',
    body: 'All teachers are reminded to submit their Daily Lesson Logs for Week 2 no later than Friday, January 10, 2025 at 5:00 PM.',
    createdBy: 'Dr. Rosa Bautista',
    createdAt: '2025-01-06',
    priority: 'high',
  },
  {
    id: 'a2',
    title: 'Faculty Meeting — January 15',
    body: 'There will be a general faculty meeting on January 15, 2025 at 3:00 PM in the Principal\'s Office. Attendance is mandatory.',
    createdBy: 'Dr. Rosa Bautista',
    createdAt: '2025-01-05',
    priority: 'normal',
  },
  {
    id: 'a3',
    title: 'Q1 MPS Data Submission',
    body: 'Please encode your Q1 Mean Percentage Score data in the system by January 12, 2025.',
    createdBy: 'Ms. Ana Reyes',
    createdAt: '2025-01-04',
    priority: 'normal',
  },
];

export const LINKS: Link[] = [
  { id: 'l1', label: 'DepEd Portal', url: 'https://deped.gov.ph', category: 'Government' },
  { id: 'l2', label: 'LIS — Learner Information System', url: 'https://lis.deped.gov.ph', category: 'Government' },
  { id: 'l3', label: 'EBEIS', url: 'https://ebeis.deped.gov.ph', category: 'Government' },
  { id: 'l4', label: 'School Calendar SY 2024-2025', url: '#', category: 'School' },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'c1', senderId: 't1', senderName: 'Mr. Juan Dela Cruz',
    receiverId: '1', receiverName: 'Dr. Rosa Bautista',
    message: 'Good morning, Ma\'am. I have a question about the DLL format.',
    timestamp: '2025-01-06 08:00', read: true,
  },
  {
    id: 'c2', senderId: '1', senderName: 'Dr. Rosa Bautista',
    receiverId: 't1', receiverName: 'Mr. Juan Dela Cruz',
    message: 'Good morning! Please use the updated template from DepEd Order 42 s. 2016.',
    timestamp: '2025-01-06 08:05', read: true,
  },
  {
    id: 'c3', senderId: 't2', senderName: 'Ms. Carla Bautista',
    receiverId: '1', receiverName: 'Dr. Rosa Bautista',
    message: 'Ma\'am, may I request an extension for my Week 1 submission?',
    timestamp: '2025-01-06 09:00', read: false,
  },
];

export const KPI_DATA = {
  totalTeachers: 42,
  totalLearners: 1248,
  enrollmentRate: 94.2,
  survivalRate: 97.1,
  overallMps: 74.3,
  submissionCompliance: 81.5,
  pendingSubmissions: 12,
  flaggedDocuments: 3,
};
