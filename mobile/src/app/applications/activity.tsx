import { useLocalSearchParams } from 'expo-router';
import { ActivityForm } from '../../components/ActivityForm';
import { DataState, Screen } from '../../components/ui';
import { useApplication } from '../../lib/queries';
export default function RecordActivity() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const query = useApplication(id);
  if (query.data) return <ActivityForm key={query.data.id} application={query.data} />;
  return <Screen title="Record activity"><DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }} /></Screen>;
}
