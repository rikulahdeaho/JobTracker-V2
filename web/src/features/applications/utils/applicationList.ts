import type { ApplicationStatus, JobApplication } from "../types/application";
import { getApplicationNextAction } from "./applicationNextAction";

export type ApplicationListFilter = "all" | "needsFollowUp";

export type ApplicationSortOption = "updatedDesc" | "appliedDesc" | "deadlineAsc";

export type ApplicationsViewState = {
  searchTerm: string;
  status: "all" | ApplicationStatus;
  filter: ApplicationListFilter;
  sort: ApplicationSortOption;
};

export function filterAndSortApplications(
  applications: JobApplication[],
  viewState: ApplicationsViewState,
): JobApplication[] {
  return [...applications]
    .filter((application) => matchesSearch(application, viewState.searchTerm))
    .filter((application) => matchesStatus(application, viewState.status))
    .filter((application) => matchesListFilter(application, viewState.filter))
    .sort((left, right) => compareApplications(left, right, viewState.sort));
}

export function getApplicationSortLabel(sort: ApplicationSortOption): string {
  switch (sort) {
    case "updatedDesc":
      return "Recently updated";
    case "appliedDesc":
      return "Applied date";
    case "deadlineAsc":
      return "Deadline";
  }
}

function matchesSearch(application: JobApplication, searchTerm: string): boolean {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (normalizedSearch.length === 0) {
    return true;
  }

  return [application.companyName, application.jobTitle].some((value) =>
    value.toLowerCase().includes(normalizedSearch),
  );
}

function matchesStatus(
  application: JobApplication,
  status: "all" | ApplicationStatus,
): boolean {
  return status === "all" || application.status === status;
}

function matchesListFilter(
  application: JobApplication,
  filter: ApplicationListFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  return getApplicationNextAction(application).isNeedsFollowUp;
}

function compareApplications(
  left: JobApplication,
  right: JobApplication,
  sort: ApplicationSortOption,
): number {
  switch (sort) {
    case "updatedDesc":
      return compareDateValues(right.updatedAt, left.updatedAt) || compareByTitle(left, right);
    case "appliedDesc":
      return compareDateValues(right.appliedDate, left.appliedDate) || compareByTitle(left, right);
    case "deadlineAsc":
      return compareOptionalDateValues(left.deadline, right.deadline) || compareByTitle(left, right);
  }
}

function compareDateValues(left: string | null, right: string | null): number {
  return new Date(left ?? 0).getTime() - new Date(right ?? 0).getTime();
}

function compareOptionalDateValues(left: string | null, right: string | null): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left.localeCompare(right);
}

function compareByTitle(left: JobApplication, right: JobApplication): number {
  return left.companyName.localeCompare(right.companyName) || left.jobTitle.localeCompare(right.jobTitle);
}
