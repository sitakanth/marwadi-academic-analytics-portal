import type { Semester } from '../types';

export const SEMESTERS: Semester[] = [
  {
    id: 1,
    name: 'Semester 1',
    totalCredits: 19,
    subjects: [
      { name: 'Differential Calculus', credits: 5, isNonCredit: false },
      { name: 'Computer Programming', credits: 5, isNonCredit: false },
      { name: 'Computer Workshop', credits: 1, isNonCredit: false },
      { name: 'Engineering Physics', credits: 4, isNonCredit: false },
      { name: 'Engineering Drawing', credits: 4, isNonCredit: false },
      { name: 'Verbal Ability - 1', credits: 0, isNonCredit: true },
      { name: 'Value Education', credits: 0, isNonCredit: true },
      { name: 'Indian Constitution', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 2,
    name: 'Semester 2',
    totalCredits: 21,
    subjects: [
      { name: 'Applied Linear Algebra', credits: 5, isNonCredit: false },
      { name: 'Object Oriented Design and Programming', credits: 5, isNonCredit: false },
      { name: 'Digital Electronics', credits: 4, isNonCredit: false },
      { name: 'Basics of Electrical and Electronics Engineering', credits: 5, isNonCredit: false },
      { name: 'Professional Communication', credits: 2, isNonCredit: false },
      { name: 'Professional Ethics', credits: 0, isNonCredit: true },
      { name: 'Verbal Ability - 2', credits: 0, isNonCredit: true },
      { name: 'Environmental Studies', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 3,
    name: 'Semester 3',
    totalCredits: 20,
    subjects: [
      { name: 'Programming with Python', credits: 4, isNonCredit: false },
      { name: 'Database Management Systems', credits: 4, isNonCredit: false },
      { name: 'Data Structure', credits: 4, isNonCredit: false },
      { name: 'Introduction to Prompt Engineering', credits: 4, isNonCredit: false },
      { name: 'Probability and Statistics', credits: 4, isNonCredit: false },
      { name: 'Design Thinking and Problem Solving Skills', credits: 0, isNonCredit: true },
      { name: 'Quantitative and Logical Ability - 1', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 4,
    name: 'Semester 4',
    totalCredits: 21,
    subjects: [
      { name: 'Java Programming', credits: 4, isNonCredit: false },
      { name: 'Discrete Mathematical Structures', credits: 4, isNonCredit: false },
      { name: 'Operating System and Virtualization', credits: 4, isNonCredit: false },
      { name: 'Computer Network', credits: 4, isNonCredit: false },
      { name: 'Machine Learning Essentials', credits: 4, isNonCredit: false },
      { name: 'Creativity Problem Solving and Innovation', credits: 1, isNonCredit: false },
      { name: 'Quantitative and Logical Ability - 2', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 5,
    name: 'Semester 5',
    totalCredits: 27,
    subjects: [
      { name: 'Design and Analysis of Algorithms', credits: 5, isNonCredit: false },
      { name: 'Software Engineering', credits: 4, isNonCredit: false },
      { name: 'Artificial Intelligence', credits: 4, isNonCredit: false },
      { name: 'Cyber Security', credits: 4, isNonCredit: false },
      { name: 'Digital Image Processing', credits: 4, isNonCredit: false },
      { name: 'Theory of Automata and Formal Language', credits: 3, isNonCredit: false },
      { name: 'Cloud Computing Services', credits: 2, isNonCredit: false },
      { name: 'Seminar', credits: 1, isNonCredit: false },
    ],
  },
];

export function getSemesterById(id: number): Semester | undefined {
  return SEMESTERS.find(s => s.id === id);
}

export function getCreditSubjects(semester: Semester) {
  return semester.subjects.filter(s => !s.isNonCredit);
}

export function getNonCreditSubjects(semester: Semester) {
  return semester.subjects.filter(s => s.isNonCredit);
}

export function getTotalProgramCredits(): number {
  return SEMESTERS.reduce((sum, sem) => sum + sem.totalCredits, 0);
}
