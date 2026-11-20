import { checkFields, ValidationError } from "./validation.mjs";

export const AUDIENCES = ["staff", "requester"];
export const DEFAULT_AUDIENCE = "staff";

export function createCommentService(db, { now = () => new Date() } = {}) {
  return {
    add(requestId, input, author) {
      const details = {};
      checkFields(input, ["body", "audience"], details);
      if (!details.body) {
        if (typeof input.body !== "string" || !input.body.trim()) details.body = "A comment needs a body.";
        else if (input.body.trim().length > 2000) details.body = "A comment must be 2000 characters or fewer.";
        if ("audience" in input && !AUDIENCES.includes(input.audience)) {
          details.audience = `Audience must be one of ${AUDIENCES.join(", ")}.`;
        }
      }
      if (Object.keys(details).length) throw new ValidationError(details);
      return db.insert("comments", {
        requestId,
        author: author.id,
        body: input.body.trim(),
        audience: input.audience ?? DEFAULT_AUDIENCE,
        createdAt: now().toISOString(),
      });
    },

    listFor(requestId, viewer) {
      return db
        .all("comments")
        .filter((comment) => comment.requestId === requestId)
        .filter((comment) => viewer.role === "staff" || comment.audience === "requester")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
}
