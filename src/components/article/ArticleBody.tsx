import { parseBody, type Inline } from "@/core/markdown";

function renderInline(nodes: Inline[]) {
  return nodes.map((n, i) => {
    if (n.type === "cite") {
      return (
        <sup key={i}>
          <a href={`#source-${n.index}`} aria-label={`Source ${n.index}`}>[{n.index}]</a>
        </sup>
      );
    }
    if (n.type === "strong") return <strong key={i}>{n.text}</strong>;
    return n.text;
  });
}

/** Server component: turns the parsed block tree into elements. No raw HTML anywhere. */
export function ArticleBody({ body }: { body: string }) {
  return (
    <>
      {parseBody(body).map((block, i) =>
        block.type === "paragraph" ? (
          <p key={i}>{renderInline(block.children)}</p>
        ) : (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}
