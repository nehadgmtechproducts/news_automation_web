/**
 * A deliberately tiny, SAFE renderer for the article bodies the pipeline produces.
 *
 * The bodies are plain text with three conventions: blank-line paragraphs, "- " bullets,
 * and numeric citation markers like [1] or [2][3]. We parse them into a typed tree and
 * render that tree with React — never with dangerouslySetInnerHTML — so model-written
 * text can never inject markup into a page.
 */

export type Inline =
  | { type: "text"; text: string }
  | { type: "cite"; index: number }
  | { type: "strong"; text: string };

export type Block =
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; items: Inline[][] };

const TOKEN = /\[(\d+)\]|\*\*([^*]+)\*\*|\[[A-Za-z][^\]]*\]/g;

/**
 * - [3]            -> citation to source 3
 * - **text**       -> bold
 * - [Timeline] etc -> an UNRESOLVED marker the model left behind (not a real citation).
 *                     Dropped rather than shown to readers as stray brackets.
 */
export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ type: "text", text: text.slice(last, start) });
    if (m[1] !== undefined) out.push({ type: "cite", index: Number(m[1]) });
    else if (m[2] !== undefined) out.push({ type: "strong", text: m[2] });
    last = start + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return tidy(out);
}

/** Collapse the double spaces left where a dropped marker used to be. */
function tidy(nodes: Inline[]): Inline[] {
  return nodes
    .map((n) => (n.type === "text" ? { ...n, text: n.text.replace(/ {2,}/g, " ") } : n))
    .filter((n) => !(n.type === "text" && n.text === ""));
}

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ").trim()) });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list.map((l) => parseInline(l)) });
    list = [];
  };

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flushParagraph();
      flushList();
    } else if (/^[-*] +/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[-*] +/, ""));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Plain text with all markers removed — for word counts and descriptions. */
export function plainText(body: string): string {
  return parseBody(body)
    .flatMap((b) => (b.type === "paragraph" ? [b.children] : b.items))
    .map((inl) => inl.map((n) => (n.type === "cite" ? "" : n.text)).join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
