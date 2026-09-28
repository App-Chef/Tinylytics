// Turns a raw referrer URL (or a utm_source / ref value) into a short,
// readable source name. Only the source name is stored, never the full URL.

const KNOWN_HOSTS: Record<string, string> = {
  "bing.com": "Bing",
  "duckduckgo.com": "DuckDuckGo",
  "search.yahoo.com": "Yahoo",
  "yahoo.com": "Yahoo",
  "ecosia.org": "Ecosia",
  "search.brave.com": "Brave Search",
  "baidu.com": "Baidu",
  "kagi.com": "Kagi",
  "startpage.com": "Startpage",
  "qwant.com": "Qwant",
  "github.com": "GitHub",
  "gitlab.com": "GitLab",
  "t.co": "X",
  "x.com": "X",
  "twitter.com": "X",
  "reddit.com": "Reddit",
  "old.reddit.com": "Reddit",
  "out.reddit.com": "Reddit",
  "news.ycombinator.com": "Hacker News",
  "linkedin.com": "LinkedIn",
  "lnkd.in": "LinkedIn",
  "facebook.com": "Facebook",
  "fb.com": "Facebook",
  "instagram.com": "Instagram",
  "threads.net": "Threads",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "bsky.app": "Bluesky",
  "producthunt.com": "Product Hunt",
  "dev.to": "DEV",
  "medium.com": "Medium",
  "indiehackers.com": "Indie Hackers",
  "lobste.rs": "Lobsters",
  "stackoverflow.com": "Stack Overflow",
  "chatgpt.com": "ChatGPT",
  "chat.openai.com": "ChatGPT",
  "perplexity.ai": "Perplexity",
  "claude.ai": "Claude",
  "gemini.google.com": "Gemini",
  "discord.com": "Discord",
  "t.me": "Telegram",
  "pinterest.com": "Pinterest",
  "tiktok.com": "TikTok",
  "substack.com": "Substack",
};

const SOURCE_ALIASES: Record<string, string> = {
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  github: "GitHub",
  twitter: "X",
  x: "X",
  reddit: "Reddit",
  hn: "Hacker News",
  hackernews: "Hacker News",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  bluesky: "Bluesky",
  producthunt: "Product Hunt",
  devto: "DEV",
  newsletter: "Newsletter",
  email: "Email",
  chatgpt: "ChatGPT",
  "chatgpt.com": "ChatGPT",
  perplexity: "Perplexity",
};

const MAX_LENGTH = 100;

function stripPrefixes(host: string): string {
  return host.replace(/^(www|m|l|lm|mobile|amp)\./, "");
}

/** Is `host` the site's own domain or one of its subdomains? */
export function isSameSite(host: string, domain: string | null | undefined): boolean {
  if (!domain) return false;
  return host === domain || host.endsWith("." + domain);
}

export function hostLabel(hostname: string): string {
  const host = stripPrefixes(hostname.toLowerCase().replace(/\.$/, ""));
  if (/^google\.[a-z.]{2,6}$/.test(host) || host === "google.com") return "Google";
  if (/^yandex\.[a-z.]{2,6}$/.test(host)) return "Yandex";
  if (host.endsWith(".substack.com")) return "Substack";
  if (host.endsWith(".facebook.com")) return "Facebook";
  if (host.endsWith(".reddit.com")) return "Reddit";
  return KNOWN_HOSTS[host] ?? host;
}

/**
 * @param referrer  document.referrer as sent by the tracker (origin + path)
 * @param source    utm_source or ref query parameter from the landing URL
 * @param siteHost  hostname of the page being tracked, to drop internal referrers
 */
export function normalizeReferrer(referrer: unknown, source: unknown, siteHost?: string | null): string {
  if (typeof referrer === "string" && referrer) {
    try {
      const url = new URL(referrer);
      if (url.protocol === "http:" || url.protocol === "https:") {
        const host = url.hostname.toLowerCase();
        const own = siteHost ? stripPrefixes(siteHost.toLowerCase()) : null;
        if (!own || !isSameSite(stripPrefixes(host), own)) {
          return hostLabel(host).slice(0, MAX_LENGTH);
        }
      }
    } catch {
      // Not a URL; fall through to the campaign source.
    }
  }

  if (typeof source === "string") {
    const clean = source
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N} ._-]/gu, "")
      .slice(0, 64);
    if (clean) return SOURCE_ALIASES[clean] ?? clean;
  }

  return "";
}
