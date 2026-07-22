import { z } from "zod";

export const applicationFormSchema = z.object({
  companyName: z.string().trim().min(1, "Company is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  jobUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  location: z.string().trim().nullable().optional(),
  source: z.string().trim().nullable().optional(),
  status: z.enum([
    "Draft",
    "ToApply",
    "Applied",
    "Interviewing",
    "Assignment",
    "Offer",
    "Rejected",
    "Ghosted",
    "Withdrawn",
  ]),
  appliedDate: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  salaryRange: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  jobDescription: z.string().trim().nullable().optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
