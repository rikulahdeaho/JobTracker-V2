import { Link } from "react-router-dom";
import type { JobApplication } from "../types/application";
import { getStatusLabel } from "../utils/applicationStatus";
import { getNextAction } from "../utils/nextAction";

type ApplicationListItemProps = {
  application: JobApplication;
};

export function ApplicationListItem({
  application,
}: ApplicationListItemProps) {
  const nextAction = getNextAction(application);

  return (
    <li className="application-card">
      <Link
        className="application-link"
        to={`/applications/${application.id}`}
      >
        <div className="application-row">
          <div>
            <strong>{application.companyName}</strong> - {application.jobTitle}{" "}
            <span>({getStatusLabel(application.status)})</span>
          </div>
          <span className="next-action-chip">{nextAction.label}</span>
        </div>
        {application.deadline && (
          <p className="application-meta">
            Deadline: {application.deadline.slice(0, 10)}
          </p>
        )}
      </Link>
    </li>
  );
}
