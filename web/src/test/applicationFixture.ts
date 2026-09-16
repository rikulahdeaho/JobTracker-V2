import type { JobApplication } from "../features/applications/types/application";

export function applicationFixture(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    companyName: "Example Company",
    jobTitle: "Backend Developer",
    status: "Applied",
    appliedDate: "2026-08-01",
    deadline: null,
    location: null,
    source: null,
    jobUrl: null,
    salaryRange: null,
    notes: null,
    jobDescription: null,
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-09-01T12:00:00Z",
    ...overrides,
  };
}
