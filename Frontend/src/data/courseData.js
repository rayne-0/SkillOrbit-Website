// Shared course data used across CourseHome, LecturePage, and CourseNotes.

export const COURSE_DATA = {
  1: {
    id: 1,
    icon: '💻',
    title: 'The Complete Python Bootcamp: Zero to Expert',
    instructor: 'Dr. Sarah Chen',
    totalLectures: 24,
    totalDuration: '42h 15m',
    completedLectures: 9,
    color: '#0056D2',
    modules: [
      {
        id: 'm1',
        title: 'Getting Started with Python',
        duration: '1h 20m',
        lessons: [
          { id: 'l1', title: 'Welcome & Course Overview', type: 'video', duration: '5:22', done: true },
          { id: 'l2', title: 'Installing Python & VS Code', type: 'video', duration: '8:11', done: true },
          { id: 'l3', title: 'Your First Python Program', type: 'video', duration: '12:05', done: true },
          { id: 'l4', title: 'Understanding Variables & Types', type: 'video', duration: '15:40', done: true },
          { id: 'l5', title: 'Module 1 Quiz', type: 'quiz', duration: '10 questions', done: true },
        ],
      },
      {
        id: 'm2',
        title: 'Python Fundamentals',
        duration: '4h 45m',
        lessons: [
          { id: 'l6', title: 'Data Types & Type Casting', type: 'video', duration: '18:30', done: true },
          { id: 'l7', title: 'Strings & String Methods', type: 'video', duration: '22:15', done: true },
          { id: 'l8', title: 'Lists, Tuples & Sets', type: 'video', duration: '28:00', done: true },
          { id: 'l9', title: 'Dictionaries in Depth', type: 'video', duration: '20:45', done: true },
          { id: 'l10', title: 'Control Flow: if / elif / else', type: 'video', duration: '16:10', done: false, current: true },
          { id: 'l11', title: 'Loops: for & while', type: 'video', duration: '24:00', done: false },
          { id: 'l12', title: 'Functions & Scope', type: 'video', duration: '30:20', done: false },
          { id: 'l13', title: 'Error Handling & Exceptions', type: 'video', duration: '19:05', done: false },
          { id: 'l14', title: 'Practice Assignment 1', type: 'assignment', duration: 'Est. 2h', done: false },
        ],
      },
      {
        id: 'm3',
        title: 'Object-Oriented Python',
        duration: '5h 10m',
        lessons: [
          { id: 'l15', title: 'Classes & Objects', type: 'video', duration: '26:00', done: false },
          { id: 'l16', title: 'Inheritance & Polymorphism', type: 'video', duration: '32:00', done: false },
          { id: 'l17', title: 'Magic / Dunder Methods', type: 'video', duration: '22:00', done: false },
          { id: 'l18', title: 'Decorators Deep Dive', type: 'video', duration: '35:00', done: false },
          { id: 'l19', title: 'Module 3 Quiz', type: 'quiz', duration: '15 questions', done: false },
        ],
      },
      {
        id: 'm4',
        title: 'Advanced Topics',
        duration: '6h 30m',
        lessons: [
          { id: 'l20', title: 'Generators & Iterators', type: 'video', duration: '28:00', done: false },
          { id: 'l21', title: 'Async Programming with asyncio', type: 'video', duration: '40:00', done: false },
          { id: 'l22', title: 'File Handling & I/O', type: 'video', duration: '18:00', done: false },
          { id: 'l23', title: 'Working with APIs & Requests', type: 'video', duration: '35:00', done: false },
          { id: 'l24', title: 'Final Capstone Project', type: 'assignment', duration: 'Est. 4h', done: false },
        ],
      },
    ],
  },
};

export const LESSON_CONTENT = {
  l1: {
    title: 'Welcome & Course Overview',
    overview: 'In this opening lesson, Dr. Sarah Chen walks you through what to expect from the entire course. You\'ll learn about the learning philosophy, the projects you\'ll build, and how to get the most out of your study sessions.',
    points: ['Understand the course structure and learning path', 'Download all required tools and resources', 'Join the course community forum', 'Set your learning schedule for best results'],
    resources: [
      { name: 'Course Roadmap PDF', type: 'pdf', size: '1.2 MB' },
      { name: 'Python Cheat Sheet v1', type: 'pdf', size: '420 KB' },
      { name: 'VS Code Settings File', type: 'file', size: '8 KB' },
    ],
    qa: [
      { q: 'Do I need any prior programming experience?', meta: 'Asked by 1,204 students', a: 'No prior experience needed at all! This course starts from absolute scratch and builds up progressively.' },
      { q: 'What Python version does this course use?', meta: 'Asked by 892 students', a: 'We use Python 3.12, the latest stable version. All code is compatible with Python 3.9+.' },
    ],
  },
  l10: {
    title: 'Control Flow: if / elif / else',
    overview: 'Control flow is the backbone of any program. In this lesson you\'ll master conditional logic in Python using if, elif, and else statements, with real-world use cases.',
    points: ['Write clean if-elif-else chains', 'Understand truthy and falsy values', 'Use ternary expressions for concise conditions', 'Nest conditionals properly without spaghetti code'],
    resources: [
      { name: 'Lesson Slides — Control Flow', type: 'pdf', size: '2.1 MB' },
      { name: 'Exercise Files.zip', type: 'zip', size: '14 KB' },
    ],
    qa: [
      { q: 'What\'s the difference between == and is?', meta: 'Asked by 543 students', a: '== checks value equality while is checks identity (same object in memory). Use == for value comparisons.' },
    ],
  },
};

export function getAllLessons(courseId) {
  const course = COURSE_DATA[courseId];
  if (!course) return [];
  return course.modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title, moduleId: m.id })));
}

export function getLessonById(courseId, lessonId) {
  return getAllLessons(courseId).find(l => l.id === lessonId);
}

export function getNextLesson(courseId, lessonId) {
  const all = getAllLessons(courseId);
  const idx = all.findIndex(l => l.id === lessonId);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

export function getPrevLesson(courseId, lessonId) {
  const all = getAllLessons(courseId);
  const idx = all.findIndex(l => l.id === lessonId);
  return idx > 0 ? all[idx - 1] : null;
}
