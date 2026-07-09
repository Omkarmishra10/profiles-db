// Shared utilities used by both index.js and profile.js

const DATA_URL = "data/users.json";

/** Fetches the sanitized user dataset once and caches it in memory for the page's lifetime. */
function loadUsers() {
  if (window.__usersPromise) return window.__usersPromise;
  window.__usersPromise = fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load data: ${res.status}`);
      return res.json();
    });
  return window.__usersPromise;
}

/** Escapes a string for safe insertion into innerHTML. All user-generated fields must pass through this. */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Converts a 2-letter ISO country code into a flag emoji. Falls back to a globe if unavailable. */
function flagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = [...countryCode.toUpperCase()].map(
    (c) => 0x1f1e6 + (c.charCodeAt(0) - 65)
  );
  if (codePoints.some((cp) => cp < 0x1f1e6 || cp > 0x1f1ff)) return "🌐";
  return String.fromCodePoint(...codePoints);
}

/** Renders an ISO date string as a relative "time ago" phrase. */
function timeAgo(iso) {
  if (!iso) return "Unknown";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear}y ago`;
}

/** Formats an ISO date string as a readable date, e.g. "Jan 5, 2026". */
function formatDate(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Deterministic color derived from a name, used for initials-avatar fallbacks. */
function colorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

/** Builds a data-URI SVG avatar with the member's initials, used when a photo fails to load. */
function initialsAvatarUri(name) {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";
  const bg = colorFromString(name || "?");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="80" fill="white"
      text-anchor="middle" dominant-baseline="central">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Wires an <img> element to fall back to an initials avatar on load failure. */
function setAvatarWithFallback(img, photoUrl, name) {
  img.alt = name ? `${name}'s profile photo` : "Profile photo";
  img.loading = "lazy";
  img.onerror = () => {
    img.onerror = null;
    img.src = initialsAvatarUri(name);
  };
  img.src = photoUrl || initialsAvatarUri(name);
}

/** Reads the ?id= query parameter from the current URL. */
function getQueryId() {
  return new URLSearchParams(window.location.search).get("id");
}
