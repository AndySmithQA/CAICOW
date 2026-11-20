import { AuthError } from "../../auth.mjs";
import { DEFAULT_PRIORITY, validateCreate, validateFilters, validateUpdate } from "./validation.mjs";

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

const withDefaults = (request) => ({ ...request, priority: request.priority ?? DEFAULT_PRIORITY });

export function createRequestService(db, { comments, audit, now = () => new Date() }) {
  function get(id) {
    const request = db.find("requests", id);
    if (!request) throw new NotFoundError(`No request ${id}.`);
    return withDefaults(request);
  }

  function transition(request, status, actor) {
    const history = [...request.history, { status, at: now().toISOString(), by: actor.id }];
    return withDefaults(db.update("requests", request.id, { status, history }));
  }

  return {
    list(filters = {}) {
      const { status, priority, owner, q } = validateFilters(filters);
      return db
        .all("requests")
        .map(withDefaults)
        .filter((request) => !status || request.status === status)
        .filter((request) => !priority || request.priority === priority)
        .filter((request) => !owner || request.owner === owner)
        .filter((request) => !q || request.title.toLowerCase().includes(q))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    get,

    detail(id, viewer) {
      const request = get(id);
      return { ...request, comments: comments.listFor(id, viewer) };
    },

    create(input, reporter) {
      const values = validateCreate(input, db.all("users"));
      const createdAt = now().toISOString();
      return db.insert("requests", {
        ...values,
        reporter: reporter.id,
        status: "Open",
        createdAt,
        history: [{ status: "Open", at: createdAt, by: reporter.id }],
      });
    },

    update(id, input) {
      get(id);
      const changes = validateUpdate(input, db.all("users"));
      return withDefaults(db.update("requests", id, changes));
    },

    resolve(id, actor) {
      const request = get(id);
      if (request.owner !== actor.id) throw new AuthError(403, "Only the assignee can resolve this request.");
      if (request.status !== "Open") throw new ConflictError(`Only an Open request can be resolved. ${id} is ${request.status}.`);
      const resolved = transition(request, "Resolved", actor);
      audit.append({ requestId: id, action: "resolve", actor, subjectId: id });
      return resolved;
    },

    approve(id, actor) {
      const request = get(id);
      if (request.status !== "Pending approval") {
        throw new ConflictError(`Only a request that is Pending approval can be approved. ${id} is ${request.status}.`);
      }
      const approved = transition(request, "Open", actor);
      audit.append({ requestId: id, action: "approve", actor, subjectId: id });
      return approved;
    },
  };
}
