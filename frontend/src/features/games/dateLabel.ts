const gameDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export function formatGameDateLabel(date: Date) {
  return gameDateFormatter.format(date);
}
