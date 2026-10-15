import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import type { ApplicationMethod, ApplicationStatus, FollowUpMode, JobApplication, JobApplicationFormValues } from '../domain/types/application';
import { emptyApplicationFormValues, toApplicationFormValues, toApplicationRequest } from '../domain/utils/applicationForm';
import { applicationMethodLabels, followUpModeLabels, isValidContactEmail } from '../domain/utils/applicationContact';
import { applicationStatusLabel } from '../domain/utils/applicationStatus';
import { cleanJobDescriptionFormatting } from '../domain/utils/jobDescriptionFormatting';
import { useChangeApplication } from '../lib/queries';
import { Button, Choice, Copy, Disclosure, ErrorNotice, Field, Screen, Section } from './ui';
import { DateField } from './DateField';
import { useFormExit } from './useFormExit';

export function ApplicationForm({ application }: { application?: JobApplication }) {
  const [baseline] = useState(() => application ? toApplicationFormValues(application) : { ...emptyApplicationFormValues });
  const [values, setValues] = useState<JobApplicationFormValues>(baseline);
  const [validation, setValidation] = useState<string>();
  const [beforeCleanup, setBeforeCleanup] = useState<string>();
  const change = useChangeApplication();
  const submitting = useRef(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  const allowExit = useFormExit(dirty, change.isPending);
  const set = <K extends keyof JobApplicationFormValues>(field: K, value: JobApplicationFormValues[K]) => setValues(current => ({ ...current, [field]: value }));
  const text = (field: keyof JobApplicationFormValues, label: string, multiline = false) => <Field label={label} value={values[field]} onChangeText={value => set(field, value)} editable={!change.isPending} multiline={multiline} style={multiline ? { minHeight: 140 } : undefined} autoCapitalize={field === 'contactEmail' || field === 'jobUrl' ? 'none' : 'sentences'} keyboardType={field === 'contactEmail' ? 'email-address' : field === 'jobUrl' ? 'url' : 'default'} maxLength={field === 'contactPerson' ? 200 : field === 'contactEmail' ? 254 : undefined} />;
  const save = async () => {
    if (submitting.current) return;
    if (!values.companyName.trim() || !values.jobTitle.trim()) { setValidation('Company name and job title are required.'); return; }
    if (values.contactEmail.trim() && !isValidContactEmail(values.contactEmail.trim())) { setValidation('Enter a valid contact email address.'); return; }
    for (const value of [values.appliedDate, values.deadline]) {
      if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value)) { setValidation('Enter valid dates using YYYY-MM-DD.'); return; }
    }
    setValidation(undefined); submitting.current = true;
    try {
      const record = await change.mutateAsync(application ? { kind: 'update', id: application.id, data: toApplicationRequest(values) } : { kind: 'create', data: toApplicationRequest(values) });
      allowExit();
      if (application) router.back();
      else if (record) router.replace({ pathname: '/applications/[id]', params: { id: record.id } });
    } catch { /* Inputs remain available for retry. */ } finally { submitting.current = false; }
  };
  return <Screen title={application ? 'Edit application' : 'Add application'} description="Company and job title are the only required fields.">
    <Section title="Application">{text('companyName', 'Company name *')}{text('jobTitle', 'Job title *')}
      <Choice label="Status" value={values.status} disabled={change.isPending} onChange={value => set('status', value)} options={(Object.entries(applicationStatusLabel) as [ApplicationStatus, string][]).map(([value, label]) => ({ value, label }))} />
      <Copy muted>Choose the saved stage yourself. Recording hiring activity can also update it.</Copy>
      <Choice label="Application method" value={values.applicationMethod} disabled={change.isPending} onChange={value => set('applicationMethod', value)} options={(Object.entries(applicationMethodLabels) as [ApplicationMethod, string][]).map(([value, label]) => ({ value, label }))} />
      <DateField label="Application due date" value={values.deadline} onChange={value => set('deadline', value)} disabled={change.isPending} />
      <DateField label="Applied date" value={values.appliedDate} onChange={value => set('appliedDate', value)} disabled={change.isPending} />
    </Section>
    <Disclosure title="contact and follow-up">{text('contactPerson', 'Contact person')}{text('contactEmail', 'Contact email')}
      <Choice label="Follow-up preference" value={values.followUpMode} disabled={change.isPending} onChange={value => set('followUpMode', value)} options={(Object.entries(followUpModeLabels) as [FollowUpMode, string][]).map(([value, label]) => ({ value, label }))} />
      <Copy muted>Follow-up suggestions require a valid contact email. Status reviews still apply if follow-up is unavailable.</Copy>
    </Disclosure>
    <Disclosure title="reference details">{text('jobUrl', 'Job URL')}{text('location', 'Location')}{text('source', 'Source')}{text('salaryRange', 'Salary range')}</Disclosure>
    <Section title="Personal notes">{text('notes', 'Notes', true)}</Section>
    <Disclosure title="job description"><Field label="Job description" multiline style={{ minHeight: 240 }} value={values.jobDescription} editable={!change.isPending} onChangeText={value => { set('jobDescription', value); setBeforeCleanup(undefined); }} />
      <Button secondary disabled={change.isPending} label="Clean formatting" onPress={() => { setBeforeCleanup(values.jobDescription); set('jobDescription', cleanJobDescriptionFormatting(values.jobDescription)); }} />
      {beforeCleanup !== undefined ? <Button secondary disabled={change.isPending} label="Undo formatting cleanup" onPress={() => { set('jobDescription', beforeCleanup); setBeforeCleanup(undefined); }} /> : null}<Copy muted>Cleanup only changes spacing and line breaks. Wording stays the same.</Copy>
    </Disclosure>
    <View style={{ gap: 12 }}>{validation ? <ErrorNotice error={new Error(validation)} /> : null}{change.error ? <ErrorNotice error={change.error} /> : null}<Button label={change.isPending ? 'Saving…' : 'Save application'} disabled={change.isPending} onPress={() => { void save(); }} /><Button secondary label="Cancel" disabled={change.isPending} onPress={() => router.back()} /></View>
  </Screen>;
}
