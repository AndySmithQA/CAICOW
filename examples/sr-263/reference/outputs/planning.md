# Plan

Add `POST /requests/{id}/reopen`. Caller is the reporter or the assignee. Only Resolved reopens. Reason of at least 15 characters goes through the comment API with audience requester. Status becomes Open. Priority stays. One audit row: actor, timestamp, comment id. Extend the current tests and keep the resolve and comment tests.
