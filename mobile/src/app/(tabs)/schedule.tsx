import { router } from 'expo-router';
import { ApplicationRow, Button, Copy, DataState, Row, Screen, Section, dateLabel } from '../../components/ui';
import { useApplications } from '../../lib/queries';
import { getAllReminders, getGroupedReminders } from '../../domain/utils/applicationWorkflow';
import { getLastWorkflowTime } from '../../domain/utils/applicationActivity';
import type { Reminder } from '../../domain/types/workflow';
function ReminderRow({ reminder }: { reminder: Reminder }) {
  return <Row><Copy>{dateLabel(reminder.dueDate)} · {reminder.title}</Copy><Copy heading>{reminder.jobTitle}</Copy><Copy muted>{reminder.companyName}</Copy><Copy muted>{reminder.description}</Copy><Button secondary label="Open application" onPress={() => router.push({ pathname: '/applications/[id]', params: { id: reminder.applicationId } })} /></Row>;
}
export default function Schedule() {
  const query = useApplications();
  const applications = query.data ?? [];
  const groups = getGroupedReminders(applications, new Date(), 'hardDate');
  const suggestions = getAllReminders(applications).filter(item => item.category === 'suggestedAttention');
  const active = applications.filter(item => ['Interviewing', 'Assignment', 'Offer'].includes(item.status)).sort((a, b) => getLastWorkflowTime(b).localeCompare(getLastWorkflowTime(a))).slice(0, 4);
  return <Screen title="Schedule" description="Your recorded dates and upcoming commitments." refreshing={query.isRefetching} onRefresh={() => { void query.refetch(); }}><DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>
    {groups.map((group, index) => <Section key={group.key} title={`${index === 0 ? 'Overdue commitments' : index === 1 ? 'Today' : 'Upcoming commitments'} (${group.reminders.length})`}>{group.reminders.map(item => <ReminderRow key={item.id} reminder={item} />)}{!group.reminders.length ? <Copy muted>{index === 0 ? 'No overdue commitments.' : index === 1 ? 'Nothing due today.' : 'No upcoming dates.'}</Copy> : null}</Section>)}
    <Section title="Suggested attention" description="Suggestions based on recorded communication, separate from agreed dates. You decide what to do.">{suggestions.map(item => <ReminderRow key={item.id} reminder={item} />)}{!suggestions.length ? <Copy muted>No dated suggestions right now.</Copy> : null}</Section>
    <Section title="Active hiring steps">{active.map(application => <ApplicationRow key={application.id} application={application} />)}{!active.length ? <Copy muted>No interviews, assignments or offers active right now.</Copy> : null}</Section>
  </DataState></Screen>;
}
