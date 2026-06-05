type TimePeriod = "morning" | "afternoon" | "evening" | "night";

const GREETINGS: Record<TimePeriod, readonly string[]> = {
  morning: [
    "Morning, {name}. What do you want to dig out of your stash?",
    "Fresh start, {name}. Ask me anything you've saved.",
    "Good morning, {name}. Let's find what you're looking for.",
  ],
  afternoon: [
    "What are you trying to recall, {name}?",
    "Back at it, {name}. Your saved links and notes are a question away.",
    "Afternoon, {name}. Need to track down something you stashed?",
  ],
  evening: [
    "Good evening, {name}. What do you want to revisit tonight?",
    "Winding down, {name}? Let's surface something you saved.",
    "Evening, {name}. Ask your second brain anything.",
  ],
  night: [
    "Late one, {name}? Your stash is here whenever you need it.",
    "Still here, {name}. What are you trying to remember?",
    "Burning the midnight oil, {name}? Ask me what you saved.",
  ],
};

function getTimePeriod(date: Date): TimePeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

/** Stable index for the current calendar day (same greeting all day, changes tomorrow). */
function getDayIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function getFirstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? "there";
}

/**
 * Deterministic greeting for a time window: same text on every refresh
 * until the period or day changes.
 */
export function getChatGreeting(
  displayName: string,
  date: Date = new Date()
): string {
  const period = getTimePeriod(date);
  const options = GREETINGS[period];
  const index = getDayIndex(date) % options.length;
  const name = getFirstName(displayName);
  return options[index].replace("{name}", name);
}

/**
 * The greeting split into lines for display: the hook sentence on the first line and
 * the call-to-action on the second, so it breaks at the sentence boundary instead of
 * wrapping mid-phrase. Single-sentence greetings stay as one line.
 */
export function getChatGreetingLines(
  displayName: string,
  date: Date = new Date()
): string[] {
  const text = getChatGreeting(displayName, date);
  const match = text.match(/^(.*?[?.])\s+(.+)$/);
  return match ? [match[1], match[2]] : [text];
}
