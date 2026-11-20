export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function userIdFrom(req) {
  const header = req.headers["x-user"];
  if (header) return header;
  const cookie = (req.headers.cookie ?? "").split(";").map((part) => part.trim().split("="));
  return cookie.find(([name]) => name === "sf_user")?.[1];
}

export function authenticate(db, req) {
  const id = userIdFrom(req);
  if (!id) throw new AuthError(401, "Sign in to use ServiceFlow.");
  const user = db.find("users", id);
  if (!user) throw new AuthError(401, `Unknown user ${id}.`);
  return user;
}

export function requireStaff(user) {
  if (user.role !== "staff") throw new AuthError(403, "Only service staff can change a request.");
}
