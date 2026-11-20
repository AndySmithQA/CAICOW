import { checkStatus, validateCreate, validateUpdate, ValidationError } from "./validation.mjs";

export class NotFoundError extends Error {}

export function createRequestService(db, { now = () => new Date() } = {}) {
  function get(id) {
    const request = db.find("requests", id);
    if (!request) throw new NotFoundError(`No request ${id}.`);
    return request;
  }

  return {
    list({ status } = {}) {
      if (status) {
        const details = {};
        checkStatus(status, details);
        if (details.status) throw new ValidationError(details);
      }
      return db
        .all("requests")
        .filter((request) => !status || request.status === status)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    get,

    create(input) {
      const values = validateCreate(input, db.all("users"));
      return db.insert("requests", { ...values, status: "Open", createdAt: now().toISOString() });
    },

    update(id, input) {
      get(id);
      const changes = validateUpdate(input, db.all("users"));
      return db.update("requests", id, changes);
    },
  };
}
