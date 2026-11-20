---
applyTo: "src/api/requests/**, src/ui/dashboard/**"
---

# Priority field

Priority is an enum: Low, Medium, High. Reject any other value in the request service before persistence.

Existing rows with no priority read as Medium. The dashboard filter accepts the same three values, plus All.

The badge uses the current design-system tones: Low neutral, Medium attention, High urgent.
