import { router } from 'expo-router';
import { View } from 'react-native';
import { ApplicationRow, Button, Copy, DataState, Panel, Row, Screen, Section, dateLabel } from '../../components/ui';
import { useApplications } from '../../lib/queries';
import { getApplicationNextAction, getApplicationsNeedingAttention, getStatusReviewApplications } from '../../domain/utils/applicationNextAction';
import { getAllReminders } from '../../domain/utils/applicationWorkflow';
export default function Dashboard() {
  const query = useApplications();
  const applications = query.data ?? [];
  const priorities = applications.map(application => ({ application, action: getApplicationNextAction(application) })).filter(item => item.action.title !== 'No action').sort((a, b) => Number(b.action.needsStatusReview) - Number(a.action.needsStatusReview) || Number(b.action.needsAttention) - Number(a.action.needsAttention) || a.application.companyName.localeCompare(b.application.companyName));
  const priority = priorities[0];
  const dates = getAllReminders(applications).filter(item => item.category === 'hardDate').slice(0, 2);
  const stats = [
    ['Total applications', applications.length],
    ['Active hiring processes', applications.filter(item => ['Applied', 'Interviewing', 'Assignment', 'Offer'].includes(item.status)).length],
    ['Interviews', applications.filter(item => item.status === 'Interviewing').length],
    ['Offers', applications.filter(item => item.status === 'Offer').length],
    ['Needs attention', getApplicationsNeedingAttention(applications).length],
    ['Status review', getStatusReviewApplications(applications).length],
  ] as const;
  return <Screen title="Your job search" description="Your applications and what to do next." refreshing={query.isRefetching} onRefresh={() => { void query.refetch(); }}>
    <DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>
      <Panel><Copy heading>Next Action</Copy>{priority ? <><Copy heading>{priority.application.jobTitle}</Copy><Copy muted>{priority.application.companyName}</Copy><Copy heading>{priority.action.title}</Copy><Copy muted>{priority.action.description}</Copy><Button label="Open application" onPress={() => router.push({ pathname: '/applications/[id]', params: { id: priority.application.id } })} /></> : <><Copy muted>{applications.length ? 'No next actions for your current applications.' : 'Add your first application to start tracking your search.'}</Copy><Button label="Add application" onPress={() => router.push('/applications/edit')} /></>}</Panel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>{stats.map(([label, value]) => <View key={label} style={{ width: '44%', gap: 4 }}><Copy muted>{label}</Copy><Copy heading>{value}</Copy></View>)}</View>
      <Section title="Schedule summary">{dates.length ? dates.map(item => <Row key={item.id}><Copy>{dateLabel(item.dueDate)} · {item.title}</Copy><Copy muted>{item.jobTitle} · {item.companyName}</Copy></Row>) : <Copy muted>No dates scheduled. Recorded deadlines and interviews will appear here.</Copy>}<Button secondary label="View schedule" onPress={() => router.navigate('/schedule')} /></Section>
      <Section title="Next actions">{priorities.slice(1, 4).map(item => <ApplicationRow key={item.application.id} application={item.application} />)}{priorities.length < 2 ? <Copy muted>No additional next actions are queued.</Copy> : null}<Button secondary label="Manage applications" onPress={() => router.navigate('/applications')} /></Section>
    </DataState>
  </Screen>;
}
