import { ApplicationRow, Copy, DataState, Row, Screen, Section } from '../../components/ui';
import { useApplications } from '../../lib/queries';
import { getApplicationsNeedingAttention } from '../../domain/utils/applicationNextAction';
import { applicationStatusLabel } from '../../domain/utils/applicationStatus';
export default function Insights() {
  const query = useApplications();
  const items = query.data ?? [];
  const active = items.filter(item => ['Applied', 'Interviewing', 'Assignment', 'Offer'].includes(item.status)).length;
  const later = items.filter(item => ['Interviewing', 'Assignment', 'Offer'].includes(item.status)).length;
  const closed = items.filter(item => ['Rejected', 'Ghosted', 'Withdrawn'].includes(item.status)).length;
  const attention = getApplicationsNeedingAttention(items);
  return <Screen title="Insights" description="Your current hiring stages and saved application context." refreshing={query.isRefetching} onRefresh={() => { void query.refetch(); }}><DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>
    <Section title="Current hiring stages"><Copy>{active ? `${later} of ${active} active hiring processes are in Interviewing, Assignment or Offer.` : 'No active hiring processes.'}</Copy>{active ? <Copy muted>{Math.round(later / active * 100)}% of active hiring processes · current stages, not a historical response rate.</Copy> : null}<Copy muted>{closed} closed · Rejected, Ghosted or Withdrawn.</Copy></Section>
    <Section title="Status breakdown">{Object.entries(applicationStatusLabel).map(([status, label]) => { const count = items.filter(item => item.status === status).length; return count ? <Row key={status}><Copy>{label} · {count} of {items.length}</Copy></Row> : null; })}{!items.length ? <Copy muted>No applications saved yet.</Copy> : null}</Section>
    <Section title="Suggested next steps"><Copy>{attention.length} applications with a suggested action</Copy>{attention.map(application => <ApplicationRow key={application.id} application={application} />)}{!attention.length ? <Copy muted>No actions suggested right now. Waiting for a response is a valid next step.</Copy> : null}</Section>
    <Section title="Saved context">{([['Job URL saved', 'jobUrl'], ['Notes saved', 'notes'], ['Application due date saved', 'deadline']] as const).map(([label, field]) => <Row key={field}><Copy>{label} · {items.filter(item => item[field]).length} of {items.length}</Copy></Row>)}<Copy muted>Save what is useful to you. These fields are optional.</Copy></Section>
  </DataState></Screen>;
}
