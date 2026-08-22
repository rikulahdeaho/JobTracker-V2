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
  ToApply: "info",
  Applied: "primary",
  Interviewing: "secondary",
  Assignment: "warning",
  Offer: "success",
  Rejected: "error",
  Ghosted: "default",
  Withdrawn: "default",
};

export const applicationStatusHexColor: Record<ApplicationStatus, string> = {
  Draft: "#64748B",
  ToApply: "#0891B2",
  Applied: "#2563EB",
  Interviewing: "#7C3AED",
  Assignment: "#D97706",
  Offer: "#16A34A",
  Rejected: "#DC2626",
  Ghosted: "#64748B",
  Withdrawn: "#64748B",
};
