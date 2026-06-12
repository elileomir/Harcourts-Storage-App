/**
 * PM Copilot — minimal, safe markdown → HTML and assistant-content segmentation.
 *
 * Ported from the battle-tested standalone client (harcourts-docusign/frontend/chat.html).
 * We escape first, then build a small allow-list of tags, so the HTML is safe to inject.
 * Interactive widgets (```form / ```checklist / <AskUserQuestion>) are split out as
 * structured segments and rendered as real React — never as raw HTML.
 */

import type {
  ChoiceOption,
  ChoiceQuestion,
  ContentSegment,
  FormFieldSpec,
  FormSpec,
} from "@/lib/copilot/types";

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

function inlineMd(s: string): string {
  return s
    // images first, so ![alt](url) isn't caught by the link rule below
    .replace(
      /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
      '<img src="$2" alt="$1" loading="lazy" />',
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*_])[*_]([^*_]+)[*_](?!\w)/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(
      /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>',
    )
    .replace(
      /<code>(https?:\/\/[^<\s]+)<\/code>/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

/** Render a block of markdown to a safe HTML string. */
export function mdToHtml(src: string): string {
  const lines = escapeHtml(src).split("\n");
  let out = "";
  let i = 0;
  let list: "ul" | "ol" | null = null;
  const closeList = () => {
    if (list) {
      out += `</${list}>`;
      list = null;
    }
  };

  while (i < lines.length) {
    const ln = lines[i];

    // fenced code block
    if (/^```/.test(ln)) {
      closeList();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out += `<pre><code>${buf.join("\n")}</code></pre>`;
      continue;
    }

    // table
    if (ln.includes("|") && lines[i + 1] && /^\s*\|?[\s:|-]*-[\s:|-]*$/.test(lines[i + 1])) {
      closeList();
      const cells = (r: string) =>
        r
          .replace(/^\s*\|/, "")
          .replace(/\|\s*$/, "")
          .split("|")
          .map((x) => x.trim());
      const head = cells(ln);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(cells(lines[i]));
        i++;
      }
      out +=
        "<table><thead><tr>" +
        head.map((x) => `<th>${inlineMd(x)}</th>`).join("") +
        "</tr></thead><tbody>" +
        rows.map((r) => "<tr>" + r.map((x) => `<td>${inlineMd(x)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>";
      continue;
    }

    let m: RegExpMatchArray | null;
    if ((m = ln.match(/^(#{1,4})\s+(.*)$/))) {
      closeList();
      const lv = Math.min(4, m[1].length + 1);
      out += `<h${lv}>${inlineMd(m[2])}</h${lv}>`;
      i++;
      continue;
    }
    if ((m = ln.match(/^\s*[-*]\s+(.*)$/))) {
      if (list !== "ul") {
        closeList();
        out += "<ul>";
        list = "ul";
      }
      out += `<li>${inlineMd(m[1])}</li>`;
      i++;
      continue;
    }
    if ((m = ln.match(/^\s*\d+\.\s+(.*)$/))) {
      if (list !== "ol") {
        closeList();
        out += "<ol>";
        list = "ol";
      }
      out += `<li>${inlineMd(m[1])}</li>`;
      i++;
      continue;
    }
    if (ln.trim() === "") {
      closeList();
      i++;
      continue;
    }
    closeList();
    const para = [ln];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4}\s|```|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out += `<p>${para.map(inlineMd).join("<br>")}</p>`;
  }
  closeList();
  return out;
}

function parseForm(mode: "form" | "checklist", body: string): FormSpec | null {
  try {
    const raw = JSON.parse(body) as { title?: string; intro?: string; submitLabel?: string; fields?: FormFieldSpec[] };
    return {
      mode,
      title: raw.title,
      intro: raw.intro,
      submitLabel: raw.submitLabel,
      fields: Array.isArray(raw.fields) ? raw.fields : [],
    };
  } catch {
    return null;
  }
}

function parseAsk(inner: string): ChoiceQuestion[] {
  const questions: ChoiceQuestion[] = [];
  const re =
    /<question>([\s\S]*?)<\/question>\s*(?:<header>([\s\S]*?)<\/header>\s*)?<options>([\s\S]*?)<\/options>/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(inner))) {
    let options: ChoiceOption[] = [];
    try {
      const parsed = JSON.parse(mm[3].trim()) as Array<string | ChoiceOption>;
      options = parsed.map((o) =>
        typeof o === "string" ? { label: o } : { label: o.label, description: o.description },
      );
    } catch {
      options = mm[3]
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ label: s }));
    }
    questions.push({
      question: (mm[1] || "").trim(),
      header: (mm[2] || "").trim(),
      options,
    });
  }
  return questions;
}

const BLOCK_RE =
  /```(form|checklist)[ \t]*\r?\n([\s\S]*?)\r?\n```|<AskUserQuestion>([\s\S]*?)<\/AskUserQuestion>/g;

/**
 * Split assistant text into ordered segments of prose (markdown HTML) and
 * interactive widgets. Unclosed trailing widget blocks (still streaming) are
 * replaced with a quiet placeholder so raw markup never flashes.
 */
export function parseAssistantContent(text: string): ContentSegment[] {
  const src = text || "";
  const segments: ContentSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  BLOCK_RE.lastIndex = 0;

  // Emit prose, but if a chunk ENDS with a still-streaming (unclosed) widget block,
  // split that off as a `pending` segment so we never flash raw markup and we show
  // an animated "preparing" pill. Only the final gap can carry an unclosed block;
  // earlier gaps won't, since BLOCK_RE already consumed every closed block.
  const pushMarkdown = (chunk: string) => {
    const formM = chunk.match(/```(form|checklist)[ \t]*\r?\n[\s\S]*$/);
    const askM = chunk.match(/<AskUserQuestion>[\s\S]*$/);
    let cut = -1;
    let widget: "form" | "checklist" | "ask" | null = null;
    if (formM?.index != null) {
      cut = formM.index;
      widget = formM[1] as "form" | "checklist";
    }
    if (askM?.index != null && (cut === -1 || askM.index < cut)) {
      cut = askM.index;
      widget = "ask";
    }
    const prose = cut >= 0 ? chunk.slice(0, cut) : chunk;
    if (prose.trim()) segments.push({ type: "markdown", html: mdToHtml(prose) });
    if (widget) {
      const partial = cut >= 0 ? chunk.slice(cut) : undefined;
      segments.push({ type: "pending", widget, partial });
    }
  };

  // Extract every CLOSED form/checklist/ask block first; prose lives in the gaps.
  while ((m = BLOCK_RE.exec(src))) {
    pushMarkdown(src.slice(last, m.index));
    last = BLOCK_RE.lastIndex;

    if (m[1]) {
      const spec = parseForm(m[1] as "form" | "checklist", m[2]);
      if (spec) segments.push({ type: "form", spec });
      else pushMarkdown(m[0]); // unparseable → show as text
    } else if (m[3] != null) {
      const questions = parseAsk(m[3]);
      if (questions.length) segments.push({ type: "ask", questions });
      else pushMarkdown(m[0]);
    }
  }
  pushMarkdown(src.slice(last));

  return segments;
}

/**
 * Best-effort preview of a form that's still streaming: pull the title and any
 * field labels that have arrived so far from the partial (incomplete) JSON. Uses
 * regex, not JSON.parse, so it tolerates the half-written object mid-stream.
 */
export function previewFormFromPartial(partial: string | undefined): {
  title?: string;
  labels: string[];
} {
  if (!partial) return { labels: [] };
  const titleMatch = partial.match(/"title"\s*:\s*"([^"]+)"/);
  const labels: string[] = [];
  const re = /"label"\s*:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(partial))) labels.push(m[1]);
  return { title: titleMatch?.[1], labels };
}

/**
 * Strip the `[Attached PDF: name at path]` envelope the client adds, so saved
 * user messages render as the human typed them (with a paperclip/image hint).
 */
export function cleanUserText(t: string): string {
  const m = (t || "").match(
    /^\[Attached (PDF|image|document):\s*([^\]]*?)\s+at\s+[^\]]*\]\s*\n?([\s\S]*)$/i,
  );
  if (!m) return t;
  const body = m[3] ? m[3] + "\n" : "";
  const icon = /^image$/i.test(m[1]) ? "🖼 " : "📎 ";
  return body + icon + m[2];
}
