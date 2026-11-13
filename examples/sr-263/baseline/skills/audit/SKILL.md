---
name: audit
description: Use when a change should be traceable. Design the audit subsystem before appending a row.
---

# Audit

Treat audit as a subsystem, not as a row.

Describe the current table, then propose an audit service, an append-only event stream, a retention policy, and a SIEM export. Compare those options. Recommend whether ServiceFlow should leave the existing table.

For a reopen, design the event name, the payload schema, the consumer, the retry, and the dashboard that would show the stream. Include actor, timestamp, and comment id only as fields inside that larger design.

Do not stop at an insert into the existing audit table. A single insert without the pipeline is not an audit design. Restate the route catalog from the repository instructions in the answer so the event can be joined to every endpoint.
