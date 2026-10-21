import { auditEvents } from '@/db/schema';
import { db } from '@/lib/db';

export interface AuditEventInput {
  organizationId: string;
  actorUserId: string;
  eventType: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
}

export const auditEventValues = (event: AuditEventInput) => ({
  organizationId: event.organizationId,
  actorUserId: event.actorUserId,
  eventType: event.eventType,
  resourceType: event.resourceType,
  resourceId: event.resourceId ?? null,
  details: event.details ?? {},
});

export async function recordAuditEvent(event: AuditEventInput) {
  await db.insert(auditEvents).values(auditEventValues(event));
}
