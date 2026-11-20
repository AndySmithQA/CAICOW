export const STATUSES = ["Open", "In progress", "Resolved"];

const CREATE_FIELDS = ["title", "owner"];
const UPDATE_FIELDS = ["title", "owner", "status"];

export class ValidationError extends Error {
  constructor(details) {
    super("The request is not valid.");
    this.details = details;
  }
}

function checkFields(input, allowed, details) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    details.body = "Send a JSON object.";
    return;
  }
  for (const field of Object.keys(input)) {
    if (!allowed.includes(field)) details[field] = `${field} is not a field you can set.`;
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

export function validateCreate(input, users) {
  const details = {};
  checkFields(input, CREATE_FIELDS, details);
  if (!details.body) {
    checkTitle(input.title, details);
    if ("owner" in input) checkOwner(input.owner, users, details);
  }
  if (Object.keys(details).length) throw new ValidationError(details);
  return { title: input.title.trim(), owner: input.owner || null };
}

export function validateUpdate(input, users) {
  const details = {};
  checkFields(input, UPDATE_FIELDS, details);
  if (!details.body) {
    if (!Object.keys(input).length) details.body = "Send at least one field to change.";
    if ("title" in input) checkTitle(input.title, details);
    if ("owner" in input) checkOwner(input.owner, users, details);
    if ("status" in input) checkStatus(input.status, details);
  }
  if (Object.keys(details).length) throw new ValidationError(details);
  const changes = {};
  if ("title" in input) changes.title = input.title.trim();
  if ("owner" in input) changes.owner = input.owner || null;
  if ("status" in input) changes.status = input.status;
  return changes;
}
