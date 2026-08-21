import type { JobApplication } from "../types/application";

export function formatApplicationDate(value: string | null, emptyLabel: string): string {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getUpcomingApplications(applications: JobApplication[]): JobApplication[] {
  const today = getStartOfDay(new Date());

  return [...applications]
    .filter((application) => application.deadline)
    .filter((application) => getStartOfDay(new Date(application.deadline!)) >= today)
    .sort((left, right) => left.deadline!.localeCompare(right.deadline!));
}

export function getRecentApplications(applications: JobApplication[], limit = 4): JobApplication[] {
  return [...applications]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit);
}

function getStartOfDay(value: Date): number {
  const normalizedDate = new Date(value);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate.getTime();
}
