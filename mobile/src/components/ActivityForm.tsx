import { useRef, useState } from 'react';
import { router } from 'expo-router';
import type { JobApplication } from '../domain/types/application';
import type { CreateApplicationEventRequest } from '../domain/types/workflow';
import { useChangeApplication } from '../lib/queries';
import { Button, Choice, Copy, ErrorNotice, Field, Screen } from './ui';
import { DateField, localDate } from './DateField';
import { useFormExit } from './useFormExit';
export const eventLabels: Record<CreateApplicationEventRequest['type'], string> = {
  ApplicationSent: 'Application sent', FollowUpSent: 'Follow-up sent', ContactReceived: 'Recruiter reply received', InterviewScheduled: 'Interview scheduled', AssignmentReceived: 'Assignment received', AssignmentSubmitted: 'Assignment submitted', OfferReceived: 'Offer received',
};
function localNow() { const now = new Date(); return `${localDate(now)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; }
export function ActivityForm({ application }: { application: JobApplication }) {
  const [type, setType] = useState<CreateApplicationEventRequest['type']>(application.status === 'Applied' ? 'FollowUpSent' : application.status === 'Interviewing' ? 'InterviewScheduled' : application.status === 'Assignment' ? 'AssignmentReceived' : application.status === 'Offer' ? 'OfferReceived' : application.events.some(event => event.type === 'ApplicationSent') ? 'ContactReceived' : 'ApplicationSent');
  const [occurredAt, setOccurredAt] = useState(localNow);
  const [dueAt, setDueAt] = useState('');
  const [note, setNote] = useState('');
  const [baseline] = useState(() => JSON.stringify({ type, occurredAt, dueAt, note }));
  const [validation, setValidation] = useState<string>();
  const change = useChangeApplication();
  const submitting = useRef(false);
  const allowExit = useFormExit(JSON.stringify({ type, occurredAt, dueAt, note }) !== baseline, change.isPending);
  const hasDue = ['InterviewScheduled', 'AssignmentReceived', 'OfferReceived'].includes(type);
  const save = async () => {
    if (submitting.current) return;
    const occurred = Date.parse(occurredAt);
    const due = Date.parse(dueAt);
    if (!occurredAt || Number.isNaN(occurred) || occurred > Date.now()) { setValidation('Record a valid activity time in the past or present.'); return; }
    if (type === 'InterviewScheduled' && !dueAt) { setValidation('Choose the interview date and time.'); return; }
    if (hasDue && dueAt && (Number.isNaN(due) || due < occurred)) { setValidation('The scheduled date must be on or after the activity time.'); return; }
    setValidation(undefined); submitting.current = true;
    try {
      await change.mutateAsync({ kind: 'event', id: application.id, data: { type, occurredAt: new Date(occurred).toISOString(), dueAt: hasDue && dueAt ? new Date(due).toISOString() : null, note: note.trim() || null } });
      allowExit(); router.back();
    } catch { /* Keep the activity draft if saving fails. */ } finally { submitting.current = false; }
  };
  return <Screen title="Record activity" description={`${application.jobTitle} · ${application.companyName}`}>
    <Choice label="Activity" value={type} disabled={change.isPending} onChange={value => { setType(value); setDueAt(''); }} options={(Object.entries(eventLabels) as [CreateApplicationEventRequest['type'], string][]).map(([value, label]) => ({ value, label, disabled: value === 'ApplicationSent' && application.events.some(event => event.type === 'ApplicationSent') || value === 'FollowUpSent' && application.status !== 'Applied' || value === 'AssignmentSubmitted' && application.status !== 'Assignment' }))} />
    <DateField label="Activity occurred at" value={occurredAt} onChange={setOccurredAt} time disabled={change.isPending} />
    <Copy muted>When you sent the message or received or scheduled this step. Times use your local timezone.</Copy>
    {hasDue ? <DateField label={type === 'InterviewScheduled' ? 'Interview date and time *' : 'Response / assignment deadline'} value={dueAt} onChange={setDueAt} time disabled={change.isPending} /> : null}
    <Field label="Activity note" value={note} onChangeText={setNote} editable={!change.isPending} multiline maxLength={4000} style={{ minHeight: 120 }} />
    <Copy muted>Sending an application, scheduling an interview, receiving an assignment or receiving an offer also updates its status.</Copy>
    {validation ? <ErrorNotice error={new Error(validation)} /> : null}{change.error ? <ErrorNotice error={change.error} /> : null}
    <Button label={change.isPending ? 'Saving…' : 'Save activity'} disabled={change.isPending} onPress={() => { void save(); }} /><Button secondary label="Cancel" disabled={change.isPending} onPress={() => router.back()} />
  </Screen>;
}
