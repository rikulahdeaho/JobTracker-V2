import { Link } from "react-router-dom";
import type { JobApplication } from "../types/application";
import { getStatusLabel } from "../utils/applicationStatus";

type ApplicationListItemProps = {
  application: JobApplication;
};

export function ApplicationListItem({
  application,
}: ApplicationListItemProps) {
  return (
    <li className="application-card">
      <Link
        className="application-link"
        to={`/applications/${application.id}`}
      >
        <strong>{application.companyName}</strong> - {application.jobTitle}{" "}
        <span>({getStatusLabel(application.status)})</span>
      </Link>
    </li>
  );
}
