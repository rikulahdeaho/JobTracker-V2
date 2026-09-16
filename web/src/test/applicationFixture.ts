import type { ApplicationEvent } from "../features/applications/types/workflow";
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
    events: [eventFixture()],
    updatedAt: "2026-09-01T12:00:00Z",
    ...overrides,
  };
}

export function eventFixture(overrides: Partial<ApplicationEvent> = {}): ApplicationEvent {
  return {
    id: "event-1", applicationId: "11111111-1111-1111-1111-111111111111",
    type: "ApplicationSent", occurredAt: "2026-09-01T12:00:00Z", createdAt: "2026-09-01T12:00:00Z",
    dueAt: null, note: null, fromStatus: null, toStatus: null, ...overrides,
  };
}
