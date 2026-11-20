export const STATUSES = ["Open", "Pending approval", "Resolved"];
export const PRIORITIES = ["Low", "Medium", "High"];
export const DEFAULT_PRIORITY = "Medium";

const CREATE_FIELDS = ["title", "owner", "priority"];
const UPDATE_FIELDS = ["title", "owner", "priority"];

export class ValidationError extends Error {
  constructor(details) {
    super("The request is not valid.");
    this.details = details;
  }
}

export function checkFields(input, allowed, details) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    details.body = "Send a JSON object.";
    return;
  }
  for (const field of Object.keys(input)) {
    if (field === "status") details.status = "Status changes through the transition routes, not this one.";
    else if (!allowed.includes(field)) details[field] = `${field} is not a field you can set.`;
  }
}

function checkTitle(title, details) {
  if (typeof title !== "string" || title.trim().length < 3) details.title = "Title must be at least 3 characters.";
  else if (title.trim().length > 120) details.title = "Title must be 120 characters or fewer.";
}

function checkOwner(owner, users, details) {
  if (owner === null || owner === "") return;
  if (!users.some((user) => user.id === owner && user.role === "staff")) details.owner = "Owner must be a member of staff.";
}

export function checkStatus(status, details) {
  if (!STATUSES.includes(status)) details.status = `Status must be one of ${STATUSES.join(", ")}.`;
}

export function checkPriority(priority, details) {
  if (!PRIORITIES.includes(priority)) details.priority = `Priority must be one of ${PRIORITIES.join(", ")}.`;
}

export function validateFilters({ status, priority, owner, q }) {
  const details = {};
  if (status) checkStatus(status, details);
  if (priority) checkPriority(priority, details);
  if (Object.keys(details).length) throw new ValidationError(details);
  return { status, priority, owner, q: q?.trim().toLowerCase() };
}

export function validateCreate(input, users) {
  const details = {};
  checkFields(input, CREATE_FIELDS, details);
  if (!details.body) {
    checkTitle(input.title, details);
    if ("owner" in input) checkOwner(input.owner, users, details);
    if ("priority" in input) checkPriority(input.priority, details);
  }
  if (Object.keys(details).length) throw new ValidationError(details);
  return { title: input.title.trim(), owner: input.owner || null, priority: input.priority ?? DEFAULT_PRIORITY };
}

export function validateUpdate(input, users) {
  const details = {};
  checkFields(input, UPDATE_FIELDS, details);
  if (!details.body) {
    if (!Object.keys(input).length) details.body = "Send at least one field to change.";
    if ("title" in input) checkTitle(input.title, details);
    if ("owner" in input) checkOwner(input.owner, users, details);
    if ("priority" in input) checkPriority(input.priority, details);
  }
  if (Object.keys(details).length) throw new ValidationError(details);
  const changes = {};
  if ("title" in input) changes.title = input.title.trim();
  if ("owner" in input) changes.owner = input.owner || null;
  if ("priority" in input) changes.priority = input.priority;
  return changes;
}
