import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export function UnsavedChangesDialog({ open, onKeepEditing, onDiscard }: {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return <Dialog open={open} onClose={onKeepEditing} fullWidth maxWidth="xs" aria-labelledby="unsaved-changes-title">
    <DialogTitle id="unsaved-changes-title">Discard changes?</DialogTitle>
    <DialogContent>
      <DialogContentText>Your changes have not been saved.</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onDiscard}>Discard</Button>
      <Button variant="contained" onClick={onKeepEditing} autoFocus>Keep editing</Button>
    </DialogActions>
  </Dialog>;
}
