// Mock data for quickGyan educational platform

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  semester: number
}

export interface Semester {
  id: number
  name: string
  courses: Course[]
}

export interface Resource {
  id: string
  title: string
  type: "book" | "notes" | "paper"
  courseCode: string
  courseName: string
  semester: number
  fileSize: string
  uploadDate: string
  year?: number
}

export const semesters: Semester[] = [
  {
    id: 1,
    name: "Semester 1",
    courses: [
      { id: "bcs-011", code: "BCS-011", name: "Computer Basics and PC Software", credits: 4, semester: 1 },
      { id: "bcs-012", code: "BCS-012", name: "Basic Mathematics", credits: 4, semester: 1 },
      { id: "feg-02", code: "FEG-02", name: "Foundation Course in English-2", credits: 4, semester: 1 },
      { id: "eco-01", code: "ECO-01", name: "Business Organisation", credits: 4, semester: 1 },
    ],
  },
  {
    id: 2,
    name: "Semester 2",
    courses: [
      { id: "bcs-021", code: "BCS-021", name: "Computer Organisation and Assembly Language", credits: 4, semester: 2 },
      { id: "mcs-011", code: "MCS-011", name: "Problem Solving and Programming", credits: 3, semester: 2 },
      { id: "mcs-012", code: "MCS-012", name: "Computer Organisation and Assembly Language Programming", credits: 4, semester: 2 },
      { id: "mcs-015", code: "MCS-015", name: "Communication Skills", credits: 2, semester: 2 },
    ],
  },
  {
    id: 3,
    name: "Semester 3",
    courses: [
      { id: "mcs-021", code: "MCS-021", name: "Data and File Structures", credits: 4, semester: 3 },
      { id: "mcs-023", code: "MCS-023", name: "Introduction to Database Management Systems", credits: 3, semester: 3 },
      { id: "mcs-014", code: "MCS-014", name: "Systems Analysis and Design", credits: 3, semester: 3 },
      { id: "bcs-031", code: "BCS-031", name: "Programming in C++", credits: 3, semester: 3 },
    ],
  },
  {
    id: 4,
    name: "Semester 4",
    courses: [
      { id: "mcs-041", code: "MCS-041", name: "Operating Systems", credits: 4, semester: 4 },
      { id: "mcs-042", code: "MCS-042", name: "Data Communication and Computer Networks", credits: 3, semester: 4 },
      { id: "mcs-043", code: "MCS-043", name: "Discrete Mathematics", credits: 3, semester: 4 },
      { id: "mcsl-045", code: "MCSL-045", name: "Unix and DBMS Lab", credits: 2, semester: 4 },
    ],
  },
  {
    id: 5,
    name: "Semester 5",
    courses: [
      { id: "mcs-051", code: "MCS-051", name: "Advanced Internet Technologies", credits: 4, semester: 5 },
      { id: "mcs-052", code: "MCS-052", name: "Principles of Management and Information Systems", credits: 4, semester: 5 },
      { id: "mcs-053", code: "MCS-053", name: "Computer Graphics and Multimedia", credits: 4, semester: 5 },
      { id: "mcsl-054", code: "MCSL-054", name: "Laboratory Course", credits: 2, semester: 5 },
    ],
  },
  {
    id: 6,
    name: "Semester 6",
    courses: [
      { id: "bcsp-064", code: "BCSP-064", name: "Project", credits: 6, semester: 6 },
      { id: "bcs-062", code: "BCS-062", name: "E-Commerce", credits: 4, semester: 6 },
      { id: "bcs-055", code: "BCS-055", name: "Business Communication", credits: 4, semester: 6 },
    ],
  },
]

export const resources: Resource[] = [
  // Semester 1 Resources
  {
    id: "res-1",
    title: "Introduction to Computer Basics - Complete Guide",
    type: "book",
    courseCode: "BCS-011",
    courseName: "Computer Basics and PC Software",
    semester: 1,
    fileSize: "12.5 MB",
    uploadDate: "2024-08-15",
  },
  {
    id: "res-2",
    title: "BCS-011 June 2024 Question Paper",
    type: "paper",
    courseCode: "BCS-011",
    courseName: "Computer Basics and PC Software",
    semester: 1,
    fileSize: "1.2 MB",
    uploadDate: "2024-07-20",
    year: 2024,
  },
  {
    id: "res-3",
    title: "BCS-011 December 2023 Question Paper",
    type: "paper",
    courseCode: "BCS-011",
    courseName: "Computer Basics and PC Software",
    semester: 1,
    fileSize: "1.1 MB",
    uploadDate: "2024-01-15",
    year: 2023,
  },
  {
    id: "res-4",
    title: "Basic Mathematics - Study Material",
    type: "book",
    courseCode: "BCS-012",
    courseName: "Basic Mathematics",
    semester: 1,
    fileSize: "8.3 MB",
    uploadDate: "2024-08-10",
  },
  {
    id: "res-5",
    title: "BCS-012 Handwritten Notes",
    type: "notes",
    courseCode: "BCS-012",
    courseName: "Basic Mathematics",
    semester: 1,
    fileSize: "5.6 MB",
    uploadDate: "2024-09-01",
  },
  // Semester 2 Resources
  {
    id: "res-6",
    title: "Problem Solving and Programming - Complete Book",
    type: "book",
    courseCode: "MCS-011",
    courseName: "Problem Solving and Programming",
    semester: 2,
    fileSize: "15.2 MB",
    uploadDate: "2024-08-20",
  },
  {
    id: "res-7",
    title: "MCS-011 June 2024 Question Paper",
    type: "paper",
    courseCode: "MCS-011",
    courseName: "Problem Solving and Programming",
    semester: 2,
    fileSize: "980 KB",
    uploadDate: "2024-07-25",
    year: 2024,
  },
  {
    id: "res-8",
    title: "C Programming Quick Notes",
    type: "notes",
    courseCode: "MCS-011",
    courseName: "Problem Solving and Programming",
    semester: 2,
    fileSize: "3.4 MB",
    uploadDate: "2024-09-05",
  },
  // Semester 3 Resources
  {
    id: "res-9",
    title: "Data and File Structures - Study Guide",
    type: "book",
    courseCode: "MCS-021",
    courseName: "Data and File Structures",
    semester: 3,
    fileSize: "18.7 MB",
    uploadDate: "2024-08-25",
  },
  {
    id: "res-10",
    title: "MCS-021 December 2023 Question Paper",
    type: "paper",
    courseCode: "MCS-021",
    courseName: "Data and File Structures",
    semester: 3,
    fileSize: "1.3 MB",
    uploadDate: "2024-01-20",
    year: 2023,
  },
  {
    id: "res-11",
    title: "DBMS Comprehensive Notes",
    type: "notes",
    courseCode: "MCS-023",
    courseName: "Introduction to Database Management Systems",
    semester: 3,
    fileSize: "7.8 MB",
    uploadDate: "2024-09-10",
  },
  {
    id: "res-12",
    title: "C++ Programming Book",
    type: "book",
    courseCode: "BCS-031",
    courseName: "Programming in C++",
    semester: 3,
    fileSize: "14.2 MB",
    uploadDate: "2024-08-30",
  },
  // Semester 4 Resources
  {
    id: "res-13",
    title: "Operating Systems - Complete Reference",
    type: "book",
    courseCode: "MCS-041",
    courseName: "Operating Systems",
    semester: 4,
    fileSize: "22.1 MB",
    uploadDate: "2024-09-01",
  },
  {
    id: "res-14",
    title: "MCS-041 June 2024 Question Paper",
    type: "paper",
    courseCode: "MCS-041",
    courseName: "Operating Systems",
    semester: 4,
    fileSize: "1.5 MB",
    uploadDate: "2024-07-30",
    year: 2024,
  },
  {
    id: "res-15",
    title: "Computer Networks Study Notes",
    type: "notes",
    courseCode: "MCS-042",
    courseName: "Data Communication and Computer Networks",
    semester: 4,
    fileSize: "9.2 MB",
    uploadDate: "2024-09-15",
  },
]

export const allCourses = semesters.flatMap((sem) => sem.courses)
