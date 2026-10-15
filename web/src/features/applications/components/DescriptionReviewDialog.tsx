import { useState } from "react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import type { JobApplicationFormValues } from "../types/application";
import type { DescriptionSuggestion, ParseJobDescriptionResponse, SuggestedField } from "../types/jobDescription";

const fieldLabels: Record<SuggestedField, string> = {
  companyName: "Company",
  jobTitle: "Job title",
  location: "Location",
  deadline: "Application due date",
  contactEmail: "Contact email",
  contactPerson: "Contact person",
  source: "Source",
  salaryRange: "Salary range",
};

type Props = {
  result: ParseJobDescriptionResponse;
  values: JobApplicationFormValues;
  onApply: (selected: DescriptionSuggestion[]) => void;
  onClose: () => void;
};

export function DescriptionReviewDialog({ result, values, onApply, onClose }: Props) {
  const [selected, setSelected] = useState<Set<SuggestedField>>(
    () => new Set(result.suggestions.filter(item => !values[item.field].trim()).map(item => item.field)),
  );

  return <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="description-review-title">
    <DialogTitle id="description-review-title">Review description suggestions</DialogTitle>
    <DialogContent dividers>
      <Stack gap={2}>
        <Typography variant="body2" color="text.secondary">
          Select values to copy into this form. Review them before saving the application.
        </Typography>
        {result.suggestions.map(item => {
          const current = values[item.field];
          return <Box key={item.field} sx={{ minWidth: 0 }}>
            <FormControlLabel
              control={<Checkbox checked={selected.has(item.field)} onChange={(_, checked) => setSelected(previous => {
                const next = new Set(previous);
                if (checked) next.add(item.field); else next.delete(item.field);
                return next;
              })} />}
              label={`${fieldLabels[item.field]}: ${item.value}`}
              sx={{ alignItems: "flex-start", m: 0, "& .MuiFormControlLabel-label": { overflowWrap: "anywhere", pt: 1 } }}
            />
            {current.trim() && current !== item.value ? <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 5 }}>
              Current value: {current}. Select to replace it.
            </Typography> : null}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 5, overflowWrap: "anywhere" }}>
              From: {item.evidence}
            </Typography>
            {item.field === "deadline" && item.confidence === "medium" &&
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 5 }}>
                The year was inferred from the listing dates. Check it before applying.
              </Typography>}
          </Box>;
        })}
        {result.detected.length > 0 && <>
          <Divider />
          <Typography component="h3" variant="subtitle2">Detected in description</Typography>
          <Typography variant="body2" color="text.secondary">These are for review only and are not saved as separate fields.</Typography>
          {result.detected.map(item => <Box key={`${item.category}-${item.value}`} sx={{ minWidth: 0 }}>
            <Typography variant="body2">{item.value}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>From: {item.evidence}</Typography>
          </Box>)}
        </>}
      </Stack>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button type="button" onClick={onClose}>Cancel</Button>
      <Button type="button" variant="contained" disabled={selected.size === 0}
        onClick={() => onApply(result.suggestions.filter(item => selected.has(item.field)))}>Apply selected</Button>
    </DialogActions>
  </Dialog>;
}
