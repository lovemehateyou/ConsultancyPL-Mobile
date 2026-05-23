export type TaskItem = {
  id: string;
  title: string;
  role: string;
  description: string;
  assets: { name: string; url: string }[];
  completed: boolean;
};

export type ArticleItem = {
  id: string;
  title: string;
  category: string;
  content: string;
  isPublic: boolean;
  downloadUrl?: string;
};

export type ConsultantItem = {
  id: string;
  name: string;
  role: string;
  username: string;
  email: string;
  bio: string;
  city: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }[];
};

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Business Registration Follow-up',
    role: 'Law Consultant',
    description:
      'Prepare and submit all missing registration requirements, then confirm certificate collection timeline with the assigned legal consultant.',
    assets: [{ name: 'Registration-Checklist.pdf', url: 'https://example.com/assets/registration-checklist.pdf' }],
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Quarterly Cashflow Review',
    role: 'Finance Consultant',
    description:
      'Review inflow and outflow records, validate monthly net changes, and identify top expense categories for cost reduction.',
    assets: [{ name: 'Cashflow-Template.xlsx', url: 'https://example.com/assets/cashflow-template.xlsx' }],
    completed: true,
  },
  {
    id: 'task-3',
    title: 'Landing Page Improvement Plan',
    role: 'Frontend Developer',
    description:
      'Audit the current website landing page and propose a prioritized redesign plan to improve mobile conversion and loading speed.',
    assets: [],
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Inventory API Integration',
    role: 'Backend Developer',
    description:
      'Connect inventory records to backend endpoints and verify synchronization between product stock movements and reporting dashboards.',
    assets: [{ name: 'API-Endpoints.docx', url: 'https://example.com/assets/api-endpoints.docx' }],
    completed: true,
  },
  {
    id: 'task-5',
    title: 'Sales Playbook Draft',
    role: 'Business Consultant',
    description:
      'Draft a first version of the sales call script, objection handling guide, and follow-up sequence for the sales team.',
    assets: [{ name: 'Sales-Playbook-Outline.pdf', url: 'https://example.com/assets/sales-playbook-outline.pdf' }],
    completed: false,
  },
];

export const ARTICLES: ArticleItem[] = [
  {
    id: 'article-1',
    title: 'Most popular design systems to learn from in 2026',
    category: 'Design Systems',
    content:
      'A strong design system helps your startup move faster. In this guide, we compare leading systems, how they scale, and how small teams can adopt them incrementally.',
    isPublic: true,
    downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'article-2',
    title: 'Understanding accessibility makes your product better',
    category: 'Accessibility',
    content:
      'Accessibility improves usability for everyone. This article explains practical improvements in forms, contrast, navigation order, and content structure.',
    isPublic: false,
  },
  {
    id: 'article-3',
    title: '15 tools that help you build your website',
    category: 'Tech',
    content:
      'From hosting and analytics to design handoff and SEO checks, these 15 tools cover the most important workflows for small business websites.',
    isPublic: true,
    downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

export const CONSULTANTS: ConsultantItem[] = [
  {
    id: 'consultant-1',
    name: 'Olivia Rhye',
    role: 'Financial Consultant',
    username: '@olivia',
    email: 'olivia@untitledui.com',
    bio: 'Product designer passionate about helping founders solve complex business challenges through practical digital systems.',
    city: 'San Francisco, CA',
    availability: [
      { day: 'Monday', startTime: '2:30 AM', endTime: '4:00 AM', available: false },
      { day: 'Tuesday', startTime: '2:30 AM', endTime: '4:00 AM', available: true },
    ],
  },
  {
    id: 'consultant-2',
    name: 'Phoenix Baker',
    role: 'Finance Consultant',
    username: '@phoenix',
    email: 'phoenix@untitledui.com',
    bio: 'Supports SMEs with budgeting, forecasting, and unit economics optimization for growth-stage businesses.',
    city: 'Addis Ababa, ET',
    availability: [
      { day: 'Monday', startTime: '9:00 AM', endTime: '11:00 AM', available: true },
      { day: 'Wednesday', startTime: '3:00 PM', endTime: '5:00 PM', available: true },
    ],
  },
  {
    id: 'consultant-3',
    name: 'Lana Steiner',
    role: 'Business Consultant',
    username: '@lana',
    email: 'lana@untitledui.com',
    bio: 'Helps founders improve operations, team systems, and execution rhythm across departments.',
    city: 'Nairobi, KE',
    availability: [
      { day: 'Tuesday', startTime: '1:00 PM', endTime: '4:00 PM', available: true },
      { day: 'Friday', startTime: '10:00 AM', endTime: '12:00 PM', available: false },
    ],
  },
  {
    id: 'consultant-4',
    name: 'Demi Wilkinson',
    role: 'Law Consultant',
    username: '@demi',
    email: 'demi@untitledui.com',
    bio: 'Focuses on contracts, compliance, and business legal setup for early-stage enterprises.',
    city: 'Addis Ababa, ET',
    availability: [{ day: 'Thursday', startTime: '2:00 PM', endTime: '4:30 PM', available: true }],
  },
  {
    id: 'consultant-5',
    name: 'Candice Wu',
    role: 'Business Consultant',
    username: '@candice',
    email: 'candice@untitledui.com',
    bio: 'Provides market entry and customer research support for service-based businesses.',
    city: 'Kigali, RW',
    availability: [{ day: 'Wednesday', startTime: '11:00 AM', endTime: '1:00 PM', available: true }],
  },
];

export const HISTORY_ITEMS = [
  { id: 'h1', name: 'Olivia Rhye', username: '@olivia', date: '03/15/2025', status: 'Upcoming', stage: 'Approved' },
  { id: 'h2', name: 'Phoenix Baker', username: '@phoenix', date: '03/15/2025', status: 'Upcoming', stage: 'Approved' },
  { id: 'h3', name: 'Lana Steiner', username: '@lana', date: '03/15/2025', status: 'Upcoming', stage: 'Approved' },
  { id: 'h4', name: 'Demi Wilkinson', username: '@demi', date: '03/15/2025', status: 'Passed', stage: 'Approved' },
  { id: 'h5', name: 'Candice Wu', username: '@candice', date: '03/15/2025', status: 'Passed', stage: 'Approved' },
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'New Task Assigned', text: 'You have been assigned a new task: Business Plan Review.', time: '2 hours ago', isNew: true },
  {
    id: 'n2',
    title: 'Appointment Reminder',
    text: 'Your consultation with Dr. Smith is scheduled for tomorrow at 10:00 AM.',
    time: '5 hours ago',
    isNew: true,
  },
  { id: 'n3', title: 'Document Uploaded', text: 'A new document has been uploaded to your library: Q4 Financial Report.', time: '1 day ago', isNew: false },
  {
    id: 'n4',
    title: 'Task Completed',
    text: 'Your task \"Market Analysis\" has been marked as completed.',
    time: '2 days ago',
    isNew: false,
  },
  {
    id: 'n5',
    title: 'Payment Pending',
    text: 'You have a pending payment for your last consultation session.',
    time: '3 days ago',
    isNew: true,
  },
];
