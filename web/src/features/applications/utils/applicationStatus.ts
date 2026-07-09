import type { ApplicationStatus } from "../types/application";

export function getStatusLabel(status: number | string) {
  const statuses: Record<number, string> = {
    0: "Draft",
    1: "To Apply",
    2: "Applied",
    3: "Interviewing",
    4: "Assignment",
    5: "Offer",
    6: "Rejected",
    7: "Ghosted",
    8: "Withdrawn",
  };

  if (typeof status === "number") {
    return statuses[status] ?? "Unknown";
  }

  return status;
}

export function getStatusValue(status: number | string): ApplicationStatus {
  const statuses: Record<number, ApplicationStatus> = {
    0: "Draft",
    1: "ToApply",
    2: "Applied",
    3: "Interviewing",
    4: "Assignment",
    5: "Offer",
    6: "Rejected",
    7: "Ghosted",
    8: "Withdrawn",
  };

  if (typeof status === "number") {
    return statuses[status] ?? "Draft";
  }

  return status as ApplicationStatus;
}

export function getStatusCode(status: number | string) {
  const statuses: Record<ApplicationStatus, number> = {
    Draft: 0,
    ToApply: 1,
    Applied: 2,
    Interviewing: 3,
    Assignment: 4,
    Offer: 5,
    Rejected: 6,
    Ghosted: 7,
    Withdrawn: 8,
  };

  if (typeof status === "number") {
    return status;
  }

  return statuses[status as ApplicationStatus] ?? 0;
}
