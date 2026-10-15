const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
// Load the actual mobile TypeScript utilities, not a reimplementation of the rules.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }), filename);
};
const next = require('../src/domain/utils/applicationNextAction.ts');
const workflow = require('../src/domain/utils/applicationWorkflow.ts');
const list = require('../src/domain/utils/applicationList.ts');
const form = require('../src/domain/utils/applicationForm.ts');
const { resolveApiAddress } = require('../src/lib/apiAddress.ts');
test('native LAN replaces localhost with the development host, preserving browser and production', () => {
  assert.equal(resolveApiAddress('http://localhost:5080', true, '192.168.1.20:8082'), 'http://192.168.1.20:5080');
  assert.equal(resolveApiAddress('http://127.0.0.1:5080/', true, '10.0.2.2:8082'), 'http://10.0.2.2:5080');
  assert.equal(resolveApiAddress('https://api.example.com', true, '192.168.1.20:8082'), 'https://api.example.com');
  assert.equal(resolveApiAddress('http://localhost:5080', false, '192.168.1.20:8082'), 'http://localhost:5080');
  assert.equal(resolveApiAddress('http://localhost:5080', true, 'example.exp.direct:8082'), 'http://localhost:5080');
});
const now = new Date('2026-10-05T12:00:00Z');
const event = (type, occurredAt, dueAt = null) => ({ id: type + occurredAt, type, occurredAt, createdAt: occurredAt, dueAt, applicationId: 'one', note: null, fromStatus: null, toStatus: null });
const application = (days, extra = {}) => ({ id: 'one', companyName: 'Example', jobTitle: 'Engineer', status: 'Applied', contactEmail: null, followUpMode: 'Unknown', applicationMethod: 'CompanyPortal', deadline: null, appliedDate: null, createdAt: now.toISOString(), updatedAt: now.toISOString(), events: [event('ApplicationSent', new Date(now - days * 86400000).toISOString())], ...extra });
test('portal without contact waits through day 29 and suggests review at 30 without changing status', () => {
  for (const days of [0, 14, 29]) assert.equal(next.getApplicationNextAction(application(days), now).title, 'Wait for response');
  const record = application(30);
  assert.equal(next.getApplicationNextAction(record, now).title, 'Review status');
  assert.equal(record.status, 'Applied');
});
test('contactable follow-up begins exactly at day 14; opting out disables it', () => {
  assert.equal(next.getApplicationNextAction(application(13, { contactEmail: 'r@example.com' }), now).needsAttention, false);
  assert.equal(next.getApplicationNextAction(application(14, { contactEmail: 'r@example.com' }), now).title, 'Follow up');
  for (const followUpMode of ['NotAvailable', 'NotNeeded']) assert.equal(next.getApplicationNextAction(application(14, { contactEmail: 'r@example.com', followUpMode }), now).title, 'Wait for response');
});
test('reply resets response timing; notes and updatedAt cannot', () => {
  const record = application(40);
  assert.equal(next.getApplicationNextAction(record, now).title, 'Review status');
  record.events.push(event('ContactReceived', now.toISOString()));
  assert.equal(next.getApplicationNextAction(record, now).title, 'Wait for response');
});
test('missing response activity is actionable; closed processes have no reminders', () => {
  assert.equal(next.getApplicationNextAction(application(0, { events: [] }), now).needsAttention, true);
  for (const status of ['Rejected', 'Ghosted', 'Withdrawn']) {
    assert.equal(next.getApplicationNextAction(application(40, { status }), now).title, 'No action');
    assert.deepEqual(workflow.getApplicationReminders(application(40, { status }), now), []);
  }
});
test('scheduled interviews are commitments; stale responses are suggestions', () => {
  const record = application(0, { status: 'Interviewing', events: [event('InterviewScheduled', now.toISOString(), '2026-10-06T12:00:00Z')] });
  assert.equal(workflow.getApplicationReminders(record, now)[0].category, 'hardDate');
  assert.equal(workflow.getApplicationReminders(application(30), now)[0].category, 'suggestedAttention');
  record.events[0].dueAt = '2026-10-04T12:00:00Z';
  assert.equal(next.getApplicationNextAction(record, now).title, 'Wait for interview feedback');
  assert.deepEqual(workflow.getApplicationReminders(record, now), []);
});
test('submitted assignment waits for feedback and loses its deadline reminder', () => {
  const record = application(0, { status: 'Assignment', events: [event('AssignmentSubmitted', now.toISOString())] });
  assert.equal(next.getApplicationNextAction(record, now).title, 'Wait for assignment feedback');
  assert.deepEqual(workflow.getApplicationReminders(record, now), []);
});
test('search, archive filter and request mapping preserve user choices', () => {
  const records = [application(0), application(1, { id: 'two', status: 'Ghosted' })];
  assert.equal(list.filterAndSortApplications(records, { searchTerm: 'engineer', filter: 'archived', status: 'all', sort: 'updatedDesc' })[0].id, 'two');
  const request = form.toApplicationRequest({ ...form.emptyApplicationFormValues, companyName: ' Example ', jobTitle: ' Engineer ', status: 'Ghosted' });
  assert.equal(request.status, 'Ghosted'); assert.equal(request.companyName, 'Example'); assert.equal(request.contactEmail, null);
});
test('mobile rules match the web source after removing the MUI presentation type', () => {
  for (const file of ['applicationActivity.ts', 'applicationContact.ts', 'applicationForm.ts', 'applicationList.ts', 'applicationNextAction.ts', 'applicationStatus.ts', 'applicationWorkflow.ts', 'jobDescriptionFormatting.ts']) {
    const web = fs.readFileSync(path.join(__dirname, '../../web/src/features/applications/utils', file), 'utf8').replace('import type { ChipProps } from "@mui/material";', 'import type { ChipColor } from "../types/presentation";').replaceAll('ChipProps["color"]', 'ChipColor');
    assert.equal(fs.readFileSync(path.join(__dirname, '../src/domain/utils', file), 'utf8'), web, `${file} drifted from web`);
  }
});
