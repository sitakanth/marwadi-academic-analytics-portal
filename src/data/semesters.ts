import type { Semester, Subject } from '../types';

export const TOTAL_PROGRAM_CREDITS = 165;

export const SEMESTERS: Semester[] = [
  {
    id: 1,
    name: 'Semester 1',
    totalCredits: 19,
    subjects: [
      { code: '01AI0101', name: 'Differential Calculus', credits: 5, isNonCredit: false },
      { code: '01CE1101', name: 'Computer Programming', credits: 5, isNonCredit: false },
      { code: '01CE1102', name: 'Computer Workshop', credits: 1, isNonCredit: false },
      { code: '01GS1101', name: 'Engineering Physics', credits: 4, isNonCredit: false },
      { code: '01ME1103', name: 'Engineering Drawing', credits: 4, isNonCredit: false },
      { code: '01CR0105', name: 'Verbal Ability - 1', credits: 0, isNonCredit: true },
      { code: '01CR1103', name: 'Value Education', credits: 0, isNonCredit: true },
      { code: '01GS0103', name: 'Indian Constitution', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 2,
    name: 'Semester 2',
    totalCredits: 21,
    subjects: [
      { code: '01AI0102', name: 'Applied Linear Algebra', credits: 5, isNonCredit: false },
      { code: '01AI0103', name: 'Object Oriented Design and Programming', credits: 5, isNonCredit: false },
      { code: '01EC0102', name: 'Digital Electronics', credits: 4, isNonCredit: false },
      { code: '01EE1101', name: 'Basics of Electrical and Electronics Engineering', credits: 5, isNonCredit: false },
      { code: '01SL0104', name: 'Professional Communication', credits: 2, isNonCredit: false },
      { code: '01CR0104', name: 'Professional Ethics', credits: 0, isNonCredit: true },
      { code: '01CR0106', name: 'Verbal Ability - 2', credits: 0, isNonCredit: true },
      { code: '01EN1101', name: 'Basics of Environmental Studies', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 3,
    name: 'Semester 3',
    totalCredits: 20,
    subjects: [
      { code: '01AI0302', name: 'Programming with Python', credits: 4, isNonCredit: false },
      { code: '01AI0303', name: 'Database Management Systems', credits: 4, isNonCredit: false },
      { code: '01AI0304', name: 'Data Structure', credits: 4, isNonCredit: false },
      { code: '01AI0305', name: 'Introduction to Prompt Engineering', credits: 4, isNonCredit: false },
      { code: '01AI1301', name: 'Probability and Statistics', credits: 4, isNonCredit: false },
      { code: '01CE1304', name: 'Design Thinking and Problem Solving Skills', credits: 0, isNonCredit: true },
      { code: '01CR0303', name: 'Quantitative and Logical Ability - 1', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 4,
    name: 'Semester 4',
    totalCredits: 21,
    subjects: [
      { code: '01AI0401', name: 'Java Programming', credits: 4, isNonCredit: false },
      { code: '01AI0402', name: 'Discrete Mathematical Structures', credits: 4, isNonCredit: false },
      { code: '01AI0403', name: 'Operating System and Virtualization', credits: 4, isNonCredit: false },
      { code: '01AI0404', name: 'Computer Network', credits: 4, isNonCredit: false },
      { code: '01AI0405', name: 'Machine Learning Essentials', credits: 4, isNonCredit: false },
      { code: '01AI0406', name: 'Creativity, Problem Solving and Innovation', credits: 1, isNonCredit: false },
      { code: '01CR0402', name: 'Quantitative and Logical Ability - 2', credits: 0, isNonCredit: true },
    ],
  },
  {
    id: 5,
    name: 'Semester 5',
    totalCredits: 23,
    subjects: [
      { code: '01AI0506', name: 'Design and Analysis of Algorithms', credits: 5, isNonCredit: false },
      { code: '01AI0510', name: 'Software Engineering', credits: 4, isNonCredit: false },
      { code: '01AI0511', name: 'Artificial Intelligence', credits: 4, isNonCredit: false },
      { code: '01AI0505', name: 'Theory of Automata and Formal Language', credits: 3, isNonCredit: false },
      { code: '01AI0503', name: 'Cloud Computing Services', credits: 2, isNonCredit: false },
      { code: '01CE0511', name: 'Seminar', credits: 1, isNonCredit: false },
    ],
    electiveGroups: [
      {
        id: 'sem5-de1',
        title: 'Department Elective 1 — choose one subject only',
        maxSelection: 1,
        options: [
          { code: '01AI0509', name: 'Cyber Security', credits: 4, isNonCredit: false, electiveGroupId: 'sem5-de1' },
          { code: '01AI0504', name: 'Digital Image Processing', credits: 4, isNonCredit: false, electiveGroupId: 'sem5-de1' },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Semester 6',
    totalCredits: 28,
    subjects: [
      { code: '01AI0601', name: 'Human Computer Interface', credits: 4, isNonCredit: false },
      { code: '01AI0609', name: 'Agentic AI & LLM', credits: 4, isNonCredit: false },
      { code: '01AI0602', name: 'Web Intelligence and Mining', credits: 4, isNonCredit: false },
      { code: '01AI06XX', name: 'Advanced Machine Learning', credits: 4, isNonCredit: false },
      { code: '01AI0607', name: 'Numerical Methods with Python', credits: 4, isNonCredit: false },
      { code: '01CR0602', name: 'Quantitative Aptitude and Verbal Ability', credits: 4, isNonCredit: false },
    ],
    electiveGroups: [
      {
        id: 'sem6-de2',
        title: 'Department Elective 2 — choose one subject only',
        maxSelection: 1,
        options: [
          { code: '01AI0611', name: 'High Performance Computing', credits: 4, isNonCredit: false, electiveGroupId: 'sem6-de2' },
          { code: '01AI0610', name: 'Introduction to Cyber Physical System', credits: 4, isNonCredit: false, electiveGroupId: 'sem6-de2' },
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Semester 7',
    totalCredits: 24,
    subjects: [
      { code: '01AI0701', name: 'Deep Learning', credits: 4, isNonCredit: false },
      { code: '01AI0706', name: 'Compiler Design', credits: 4, isNonCredit: false },
      { code: '01AI0702', name: 'Natural Language Processing', credits: 4, isNonCredit: false },
      { code: '01AI1709', name: 'Major Project - 1', credits: 4, isNonCredit: false, isProject: true },
    ],
    electiveGroups: [
      {
        id: 'sem7-de3',
        title: 'Department Elective 3 — choose one subject only',
        maxSelection: 1,
        options: [
          { code: '01AI1708', name: 'Android Programming', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de3' },
          { code: '01AI007XX', name: 'Mobile Computing', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de3' },
          { code: '01AI0711', name: 'DevOps Engineering', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de3' },
        ],
      },
      {
        id: 'sem7-de4',
        title: 'Department Elective 4 — choose one subject only',
        maxSelection: 1,
        options: [
          { code: '01AI0707', name: 'Internet of Things', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de4' },
          { code: '01AI1703', name: 'Computer Vision', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de4' },
          { code: '01AI0704', name: 'Virtual and Augmented Reality', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de4' },
          { code: '01AI0710', name: 'Robotics & Automation', credits: 4, isNonCredit: false, electiveGroupId: 'sem7-de4' },
        ],
      },
    ],
  },
  {
    id: 8,
    name: 'Semester 8',
    totalCredits: 9,
    subjects: [
      { code: '01AI0801', name: 'Major Project - 2 / Internship', credits: 9, isNonCredit: false, isProject: true },
    ],
  },
];

export function getSemesterById(id: number): Semester | undefined {
  return SEMESTERS.find(s => s.id === id);
}

export function getCreditSubjects(semester: Semester): Subject[] {
  return semester.subjects.filter(s => !s.isNonCredit);
}

export function getNonCreditSubjects(semester: Semester): Subject[] {
  return semester.subjects.filter(s => s.isNonCredit);
}

export function getTotalProgramCredits(): number {
  return TOTAL_PROGRAM_CREDITS;
}

/**
 * Returns the full list of active subjects for a semester, including selected electives.
 * selectedElectives: Record<string, string> maps electiveGroupId → selected subject code
 */
export function getActiveSubjects(
  semester: Semester,
  selectedElectives: Record<string, string> = {}
): Subject[] {
  const base = [...semester.subjects];

  if (semester.electiveGroups) {
    for (const group of semester.electiveGroups) {
      const selectedCode = selectedElectives[group.id];
      if (selectedCode) {
        const chosen = group.options.find(o => o.code === selectedCode);
        if (chosen) base.push(chosen);
      }
    }
  }

  return base;
}

/**
 * Returns only credit subjects including selected electives.
 */
export function getActiveCreditSubjects(
  semester: Semester,
  selectedElectives: Record<string, string> = {}
): Subject[] {
  return getActiveSubjects(semester, selectedElectives).filter(s => !s.isNonCredit);
}

/**
 * Get the elective group label for a given elective group ID.
 */
export function getElectiveLabel(groupId: string): string {
  const labels: Record<string, string> = {
    'sem5-de1': 'Department Elective 1',
    'sem6-de2': 'Department Elective 2',
    'sem7-de3': 'Department Elective 3',
    'sem7-de4': 'Department Elective 4',
  };
  return labels[groupId] ?? 'Elective';
}
