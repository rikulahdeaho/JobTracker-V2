import { Grid } from "@mui/material";
import type { JobApplication } from "../types/application";
import { ApplicationCard } from "./ApplicationCard";

type ApplicationListProps = {
  applications: JobApplication[];
};

export function ApplicationList({ applications }: ApplicationListProps) {
  return (
    <Grid container spacing={2.5}>
      {applications.map((application) => (
        <Grid key={application.id} size={{ xs: 12, md: 6, xl: 4 }}>
          <ApplicationCard application={application} />
        </Grid>
      ))}
    </Grid>
  );
}
