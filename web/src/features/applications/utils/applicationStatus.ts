import type { ChipProps } from "@mui/material";
import type { ApplicationStatus } from "../types/application";

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  Draft: "Draft",
  ToApply: "To Apply",
  Applied: "Applied",
  Interviewing: "Interviewing",
  Assignment: "Assignment",
  Offer: "Offer",
  Rejected: "Rejected",
  Ghosted: "Ghosted",
  Withdrawn: "Withdrawn",
};

export const applicationStatusColor: Record<ApplicationStatus, ChipProps["color"]> = {
  Draft: "default",
  ToApply: "default",
  Applied: "default",
  Interviewing: "default",
  Assignment: "default",
  Offer: "success",
  Rejected: "default",
  Ghosted: "default",
  Withdrawn: "default",
};

export const applicationStatusHexColor: Record<ApplicationStatus, string> = {
  Draft: "#586672",
  ToApply: "#586672",
  Applied: "#586672",
  Interviewing: "#586672",
  Assignment: "#586672",
  Offer: "#16A34A",
  Rejected: "#586672",
  Ghosted: "#586672",
  Withdrawn: "#586672",
};
