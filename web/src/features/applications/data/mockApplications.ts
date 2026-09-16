import type { JobApplication } from "../types/application";

const today = new Date();

export const mockApplications: JobApplication[] = [
  {
    id: "reaktor-senior-frontend-engineer",
    companyName: "Reaktor",
    jobTitle: "Senior Frontend Engineer",
    status: "Interviewing",
    appliedDate: daysAgoDate(12),
    deadline: daysFromNowDate(3),
    location: "Helsinki, Finland",
    source: "Company site",
    jobUrl: "https://www.reaktor.com/careers/senior-frontend-engineer",
    salaryRange: "EUR 5,500 - 6,500 / month",
    notes: "Recruiter chat went well. Technical interview is coming up, so prep product case examples and accessibility decisions.",
    jobDescription:
      "Build product interfaces for international clients, collaborate across design and engineering, and lead frontend quality improvements.",
    createdAt: daysAgoIso(16, 9),
    events: [],
    updatedAt: daysAgoIso(2, 13),
  },
  {
    id: "wolt-product-designer-engineer",
    companyName: "Wolt",
    jobTitle: "Product Engineer",
    status: "Applied",
    appliedDate: daysAgoDate(15),
    deadline: daysFromNowDate(10),
    location: "Helsinki, Finland",
    source: "LinkedIn",
    jobUrl: "https://careers.wolt.com/en/jobs/product-engineer",
    salaryRange: "EUR 5,200 - 6,200 / month",
    notes: "Application submitted with portfolio link and project write-up. No response yet, so this is ready for a polite follow-up.",
    jobDescription:
      "Own end-to-end product features, work closely with product and design, and ship polished user experiences in a fast-moving team.",
    createdAt: daysAgoIso(17, 10),
    events: [],
    updatedAt: daysAgoIso(15, 18),
  },
  {
    id: "nitor-ui-engineer",
    companyName: "Nitor",
    jobTitle: "UI Engineer",
    status: "ToApply",
    appliedDate: null,
    deadline: todayDate(),
    location: "Espoo, Finland",
    source: "Referral",
    jobUrl: "https://www.nitor.com/careers/ui-engineer",
    salaryRange: "EUR 4,800 - 5,800 / month",
    notes: "Referral contact recommended tailoring the intro around design systems and accessibility work. Deadline is today.",
    jobDescription:
      "Create accessible web applications, contribute to client design systems, and support modern frontend delivery across consulting projects.",
    createdAt: daysAgoIso(4, 8),
    events: [],
    updatedAt: daysAgoIso(1, 12),
  },
  {
    id: "solita-fullstack-consultant",
    companyName: "Solita",
    jobTitle: "Full Stack Consultant",
    status: "Assignment",
    appliedDate: daysAgoDate(10),
    deadline: daysFromNowDate(1),
    location: "Tampere, Finland",
    source: "Company site",
    jobUrl: "https://www.solita.fi/en/careers/full-stack-consultant",
    salaryRange: "EUR 5,000 - 6,000 / month",
    notes: "Take-home assignment is due tomorrow. Scope the final polish, review edge cases, and send questions early if anything is unclear.",
    jobDescription:
      "Consult on digital products, deliver full stack solutions, and communicate clearly with client teams across discovery and implementation.",
    createdAt: daysAgoIso(13, 14),
    events: [],
    updatedAt: daysAgoIso(3, 16),
  },
  {
    id: "vincit-software-developer",
    companyName: "Vincit",
    jobTitle: "Software Developer",
    status: "Draft",
    appliedDate: null,
    deadline: daysFromNowDate(7),
    location: "Remote, Finland",
    source: "Oikotie",
    jobUrl: "https://www.vincit.com/careers/software-developer",
    salaryRange: "EUR 4,700 - 5,700 / month",
    notes: "Need to finish the cover letter and align examples with consultancy experience before submitting.",
    jobDescription:
      "Work on customer-facing software products, collaborate across disciplines, and help teams build maintainable digital services.",
    createdAt: daysAgoIso(1, 9),
    events: [],
    updatedAt: daysAgoIso(1, 9),
  },
  {
    id: "futurice-senior-react-developer",
    companyName: "Futurice",
    jobTitle: "Senior React Developer",
    status: "Ghosted",
    appliedDate: daysAgoDate(45),
    deadline: null,
    location: "Helsinki, Finland",
    source: "Company site",
    jobUrl: "https://www.futurice.com/careers/senior-react-developer",
    salaryRange: "EUR 5,300 - 6,300 / month",
    notes: "No response after follow-up. Keep as historical context, but no active action is needed.",
    jobDescription:
      "Develop high-quality digital products with React, mentor teammates, and contribute to modern engineering practices.",
    createdAt: daysAgoIso(50, 11),
    events: [],
    updatedAt: daysAgoIso(31, 8),
  },
  {
    id: "smartly-senior-product-engineer",
    companyName: "Smartly.io",
    jobTitle: "Senior Product Engineer",
    status: "Offer",
    appliedDate: daysAgoDate(20),
    deadline: daysFromNowDate(4),
    location: "Helsinki, Finland",
    source: "Recruiter outreach",
    jobUrl: "https://www.smartly.io/open-positions/senior-product-engineer",
    salaryRange: "EUR 6,000 - 7,000 / month",
    notes: "Offer received yesterday. Compare compensation, role scope, and growth path before responding.",
    jobDescription:
      "Build performant product experiences for marketing teams, work across product areas, and partner closely with design and data teams.",
    createdAt: daysAgoIso(24, 15),
    events: [],
    updatedAt: daysAgoIso(1, 17),
  },
];

function todayDate(): string {
  return formatDate(today);
}

function daysAgoDate(days: number): string {
  return formatDate(addDays(today, -days));
}

function daysFromNowDate(days: number): string {
  return formatDate(addDays(today, days));
}

function daysAgoIso(days: number, hour: number): string {
  const date = addDays(today, -days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function addDays(value: Date, days: number): Date {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}
