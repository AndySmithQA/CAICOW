export function createAuditLog(db, { now = () => new Date() } = {}) {
  return {
    append({ requestId, action, actor, subjectId }) {
      return db.insert("audit", { requestId, action, actor: actor.id, timestamp: now().toISOString(), subjectId });
    },

    listFor(requestId) {
      return db
        .all("audit")
        .filter((row) => row.requestId === requestId)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
  };
}
