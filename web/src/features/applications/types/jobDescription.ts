export type SuggestedField = "companyName" | "jobTitle" | "location" | "deadline" | "contactEmail" | "contactPerson" | "source" | "salaryRange";

export type DescriptionSuggestion = {
  field: SuggestedField;
  value: string;
  evidence: string;
  confidence: "high" | "medium";
};

export type DescriptionDetection = {
  category: "technology" | "workArrangement" | "date";
  value: string;
  evidence: string;
};

export type ParseJobDescriptionResponse = {
  suggestions: DescriptionSuggestion[];
  detected: DescriptionDetection[];
};
