import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, View } from 'react-native';
import { Button, Copy, DataState, Disclosure, ErrorNotice, ExternalLink, Panel, Row, Screen, Section, Status, dateLabel } from '../../components/ui';
import { useApplication, useChangeApplication } from '../../lib/queries';
import { getApplicationNextAction } from '../../domain/utils/applicationNextAction';
import { getApplicationReminders, getApplicationTimelineEvents } from '../../domain/utils/applicationWorkflow';
import { applicationMethodLabels, followUpModeLabels } from '../../domain/utils/applicationContact';
export default function ApplicationDetails() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const query = useApplication(id);
  const change = useChangeApplication();
  const application = query.data;
  const remove = () => { void change.mutateAsync({ kind: 'delete', id }).then(() => router.replace('/applications')).catch(() => {}); };
  const confirmDelete = () => {
    if (Platform.OS === 'web') { if (window.confirm('Delete this application and its activity history? This cannot be undone.')) remove(); }
    else Alert.alert('Delete application?', 'This application and its activity history will be deleted. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: remove }]);
  };
  return <Screen title={application?.jobTitle ?? 'Application'} description={application?.companyName} refreshing={query.isRefetching} onRefresh={() => { void query.refetch(); }}><DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>
    {application ? <><Status application={application} /><View style={{ gap: 12 }}><Button label="Record activity" onPress={() => router.push({ pathname: '/applications/activity', params: { id } })} /><Button secondary label="Edit application" onPress={() => router.push({ pathname: '/applications/edit', params: { id } })} /></View>
      <Panel><Copy heading>Next Action</Copy><Copy heading>{getApplicationNextAction(application).title}</Copy><Copy muted>{getApplicationNextAction(application).description}</Copy><Copy muted>Suggestions do not change your saved status.</Copy></Panel>
      <Section title="Timeline">{getApplicationTimelineEvents(application).map(event => <Row key={event.id}><Copy muted>{new Date(event.occurredAt).toLocaleString()}</Copy><Copy heading>{event.title}</Copy>{event.description ? <Copy>{event.description}</Copy> : null}</Row>)}{!application.events.length ? <Copy muted>No activity recorded yet.</Copy> : null}</Section>
      <Section title="Schedule">{getApplicationReminders(application).map(item => <Row key={item.id}><Copy>{dateLabel(item.dueDate)} · {item.title}</Copy><Copy muted>{item.category === 'hardDate' ? 'Recorded commitment' : 'Suggested attention'}</Copy><Copy muted>{item.description}</Copy></Row>)}{!getApplicationReminders(application).length ? <Copy muted>No dated commitments or suggestions.</Copy> : null}</Section>
      <Section title="Dates and contact"><Copy>Applied: {dateLabel(application.appliedDate)}</Copy><Copy>Application due date: {dateLabel(application.deadline)}</Copy><Copy>Method: {applicationMethodLabels[application.applicationMethod ?? 'Unknown']}</Copy><Copy>Follow-up: {followUpModeLabels[application.followUpMode ?? 'Unknown']}</Copy>{application.contactPerson ? <Copy>{application.contactPerson}</Copy> : null}{application.contactEmail ? <ExternalLink label={application.contactEmail} url={`mailto:${application.contactEmail}`} /> : null}</Section>
      <Section title="Reference">{application.location ? <Copy>Location: {application.location}</Copy> : null}{application.source ? <Copy>Source: {application.source}</Copy> : null}{application.salaryRange ? <Copy>Salary range: {application.salaryRange}</Copy> : null}{application.jobUrl ? <ExternalLink label="Open job advertisement" url={application.jobUrl} /> : null}<Copy muted>Created {dateLabel(application.createdAt)} · Updated {dateLabel(application.updatedAt)}</Copy></Section>
      <Section title="Notes"><Copy>{application.notes || 'No personal notes saved.'}</Copy></Section>
      <Disclosure title="job description"><Copy>{application.jobDescription || 'No job description saved.'}</Copy></Disclosure>
      {change.error ? <ErrorNotice error={change.error} /> : null}<Button secondary danger disabled={change.isPending} label={change.isPending ? 'Deleting…' : 'Delete application'} onPress={confirmDelete} />
    </> : null}
  </DataState></Screen>;
}
