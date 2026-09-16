import { afterEach, describe, expect, it, vi } from "vitest";
import { applicationFixture } from "../../../test/applicationFixture";
import { filterAndSortApplications, type ApplicationsViewState } from "./applicationList";

const view: ApplicationsViewState = { searchTerm: "", status: "all", filter: "all", sort: "updatedDesc" };
const records = [
  applicationFixture({ id: "a", companyName: "Alpha", status: "Applied", deadline: "2026-10-01", appliedDate: "2026-08-10" }),
  applicationFixture({ id: "b", companyName: "Beta", jobTitle: "Designer", status: "Rejected", deadline: null, appliedDate: null, updatedAt: "2026-09-10T12:00:00Z" }),
  applicationFixture({ id: "c", companyName: "Gamma", status: "Interviewing", deadline: "2026-09-20", appliedDate: "2026-09-01" }),
];

afterEach(() => vi.useRealTimers());

describe("application list", () => {
  it("matches company or title ignoring case and whitespace, combined with status", () => {
    expect(filterAndSortApplications(records, { ...view, searchTerm: "  ALPHA " }).map(item => item.id)).toEqual(["a"]);
    expect(filterAndSortApplications(records, { ...view, searchTerm: "developer", status: "Interviewing" }).map(item => item.id)).toEqual(["c"]);
    expect(filterAndSortApplications(records, { ...view, searchTerm: "missing" })).toEqual([]);
  });

  it("separates active and archived outcomes", () => {
    expect(filterAndSortApplications(records, { ...view, filter: "active" }).map(item => item.id)).toEqual(["a", "c"]);
    expect(filterAndSortApplications(records, { ...view, filter: "archived" }).map(item => item.id)).toEqual(["b"]);
  });

  it("filters follow-ups using a fixed current time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-16T12:00:00Z"));
    expect(filterAndSortApplications(records, { ...view, filter: "needsFollowUp" }).map(item => item.id)).toEqual(["a"]);
  });

  it.each([
    ["updatedDesc", ["b", "a", "c"]],
    ["appliedDesc", ["c", "a", "b"]],
    ["deadlineAsc", ["c", "a", "b"]],
  ] as const)("sorts %s, handles missing dates and leaves its input unchanged", (sort, expected) => {
    const before = structuredClone(records);
    expect(filterAndSortApplications(records, { ...view, sort }).map(item => item.id)).toEqual(expected);
    expect(records).toEqual(before);
  });
});
