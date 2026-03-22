import { AgentKey } from "@/types/agent";

/**
 * Masks an API key for display, showing only the first and last 4 characters.
 */
export const maskKey = (key: string | undefined) => {
  if (!key) return "••••••••";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}${"•".repeat(key.length - 8)}${key.slice(-4)}`;
};

/**
 * Formats a date string into a user-friendly format.
 */
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Checks if an agent key has expired.
 */
export const isExpired = (agent: AgentKey) => {
  if (!agent.expirationDate) return false;
  return new Date(agent.expirationDate) < new Date();
};

/**
 * Copies text to the clipboard with a fallback for non-secure contexts.
 */
export const handleCopyText = async (text: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
};
