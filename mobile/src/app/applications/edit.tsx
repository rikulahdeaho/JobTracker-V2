import { useLocalSearchParams } from 'expo-router';
import { ApplicationForm } from '../../components/ApplicationForm';
import { DataState, Screen } from '../../components/ui';
import { useApplication } from '../../lib/queries';
export default function EditApplication() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const query = useApplication(id ?? '');
  if (!id) return <ApplicationForm />;
  if (query.data) return <ApplicationForm key={query.data.id} application={query.data} />;
  return <Screen title="Edit application"><DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }} /></Screen>;
}
