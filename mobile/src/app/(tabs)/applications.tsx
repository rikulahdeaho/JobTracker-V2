import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { ApplicationRow, Button, Choice, Copy, DataState, Field } from '../../components/ui';
import { useApplications } from '../../lib/queries';
import { useTheme } from '../../lib/theme';
import { filterAndSortApplications, type ApplicationsViewState } from '../../domain/utils/applicationList';
import { applicationStatusLabel } from '../../domain/utils/applicationStatus';
import type { ApplicationStatus } from '../../domain/types/application';
export default function Applications() {
  const query = useApplications();
  const { colors } = useTheme();
  const [view, setView] = useState<ApplicationsViewState>({ searchTerm: '', status: 'all', filter: 'all', sort: 'updatedDesc' });
  const [filters, setFilters] = useState(false);
  const items = filterAndSortApplications(query.data ?? [], view);
  return <View style={{ flex: 1, backgroundColor: colors.background }}><FlatList data={query.isPending || query.error ? [] : items} keyExtractor={item => item.id} refreshing={query.isRefetching} onRefresh={() => { void query.refetch(); }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' }}
    ListHeaderComponent={<View style={{ gap: 16, paddingBottom: 16 }}><Copy title>Applications</Copy><Copy muted>Your saved roles, stages and next steps.</Copy><Button label="Add application" onPress={() => router.push('/applications/edit')} /><Field label="Search company or role" value={view.searchTerm} onChangeText={searchTerm => setView(current => ({ ...current, searchTerm }))} returnKeyType="search" />
      <Choice label="Show" value={view.filter} onChange={filter => setView(current => ({ ...current, filter }))} options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: 'needsAttention', label: 'Needs attention' }]} />
      <Button secondary label={filters ? 'Hide status and sorting' : 'Status and sorting'} onPress={() => setFilters(!filters)} />
      {filters ? <><Choice label="Status" value={view.status} onChange={status => setView(current => ({ ...current, status }))} options={[{ value: 'all', label: 'All statuses' }, ...(Object.entries(applicationStatusLabel) as [ApplicationStatus, string][]).map(([value, label]) => ({ value, label }))]} />
        <Choice label="Sort by" value={view.sort} onChange={sort => setView(current => ({ ...current, sort }))} options={[{ value: 'updatedDesc', label: 'Recently updated' }, { value: 'appliedDesc', label: 'Applied date' }, { value: 'deadlineAsc', label: 'Deadline' }]} /></> : null}
      <Copy muted>{items.length} of {query.data?.length ?? 0} applications{view.filter === 'active' ? ' · Includes drafts and To Apply; excludes closed processes.' : ''}</Copy>
    </View>}
    renderItem={({ item }) => <ApplicationRow application={item} />}
    ListEmptyComponent={<DataState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}><View style={{ gap: 16 }}><Copy muted>{query.data?.length ? 'No applications match your search or filters.' : 'No applications yet. Add a company and role to get started.'}</Copy>{query.data?.length ? <Button secondary label="Clear filters" onPress={() => setView({ searchTerm: '', status: 'all', filter: 'all', sort: 'updatedDesc' })} /> : null}</View></DataState>}
  /></View>;
}
