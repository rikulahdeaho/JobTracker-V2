import type { JobApplication } from "../types/application";
import type { ApplicationEvent, ApplicationEventType } from "../types/workflow";

export function getLastContact(application: JobApplication, referenceDate = new Date()): ApplicationEvent | undefined {
  return application.events
    .filter(event => ["ApplicationSent", "FollowUpSent", "ContactReceived"].includes(event.type)
      && Date.parse(event.occurredAt) <= referenceDate.getTime())
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))[0];
}

// A previous assignment/interview/offer must not reappear after leaving and
// re-entering a stage. CreatedAt here is the event's recording order, not a record edit.
export function getStageEvent(application: JobApplication, types: ApplicationEventType[]): ApplicationEvent | undefined {
  const entry = application.events
    .filter(event => event.type === "StatusChanged" && event.toStatus === application.status)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  return application.events
    .filter(event => types.includes(event.type) && (!entry || Date.parse(event.createdAt) >= Date.parse(entry.createdAt)))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
      || Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

export function getLastWorkflowTime(application: JobApplication): string {
  return application.events.map(event => event.occurredAt).sort().at(-1) ?? application.createdAt;
}
