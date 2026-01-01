import React, { useEffect, useMemo, useRef, useState } from "react";
import { createTwoFilesPatch, diffWordsWithSpace, diffLines } from "diff";
import { parse as d2hParse, html as d2hHtml } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const htmlToPlain = (html) => {
  if (!html) return "";
  // If it looks like plain text already, return as-is
  if (!/[<][a-z/!]/i.test(html)) return html;

  let s = html;
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|li|tr|h[1-6]|pre|code)>/gi, "\n");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<[^>]*>/g, "");
  s = decodeEntities(s);
  // normalize CRLF
  s = s.replace(/\r\n/g, "\n");
  // collapse >2 empty lines
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
};

const countHeadingsDelta = (aHtml, bHtml) => {
  const get = (h) => {
    const m = h?.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || [];
    return m.map((x) =>
      `h${(x.match(/<h([1-6])/i) || [,"?"])[1]}|${x.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()}`
    );
  };
  const A = get(aHtml);
  const B = get(bHtml);
  const aMap = new Map(), bMap = new Map();
  A.forEach((k) => aMap.set(k, (aMap.get(k) || 0) + 1));
  B.forEach((k) => bMap.set(k, (bMap.get(k) || 0) + 1));
  let added = 0, deleted = 0;
  const keys = new Set([...aMap.keys(), ...bMap.keys()]);
  keys.forEach((k) => {
    const a = aMap.get(k) || 0;
    const b = bMap.get(k) || 0;
    if (b > a) added += (b - a);
    else if (a > b) deleted += (a - b);
  });
  return { headingsAdded: added, headingsDeleted: deleted };
};

const measureText = (aText, bText) => {
  const wordDiff = diffWordsWithSpace(aText, bText);
  let charsAdded = 0, charsDeleted = 0, wordsAdded = 0, wordsDeleted = 0;
  wordDiff.forEach((part) => {
    if (part.added) {
      charsAdded += part.value.length;
      wordsAdded += (part.value.trim().match(/\S+/g) || []).length;
    } else if (part.removed) {
      charsDeleted += part.value.length;
      wordsDeleted += (part.value.trim().match(/\S+/g) || []).length;
    }
  });
  const lineDiff = diffLines(aText, bText);
  let linesAdded = 0, linesDeleted = 0, blocks = 0;
  lineDiff.forEach((h) => {
    if (h.added) { linesAdded += (h.count || h.value.split("\n").length - 1); blocks++; }
    else if (h.removed) { linesDeleted += (h.count || h.value.split("\n").length - 1); blocks++; }
  });
  return { charsAdded, charsDeleted, wordsAdded, wordsDeleted, linesAdded, linesDeleted, blocks };
};

const useDiff2Html = (leftLabel, rightLabel, leftText, rightText, opts) => {
  return useMemo(() => {
    const { outputFormat, hideUnchanged, wordStyle, trimWhitespace } = opts;
    const L = trimWhitespace ? leftText.split("\n").map((l) => l.trimEnd()).join("\n") : leftText;
    const R = trimWhitespace ? rightText.split("\n").map((l) => l.trimEnd()).join("\n") : rightText;

    const patch = createTwoFilesPatch(leftLabel, rightLabel, L, R, "", "", { context: hideUnchanged ? 0 : 3 });
    const diffJson = d2hParse(patch);
    const html = d2hHtml(diffJson, {
      drawFileList: false,
      outputFormat,     // "side-by-side" | "line-by-line"
      matching: "lines",
      diffStyle: wordStyle, // "word" | "char"
    });
    return html;
  }, [leftLabel, rightLabel, leftText, rightText, opts]);
};

export default function CompareModal({
  open,
  onClose,
  fromMeta, toMeta,          // {_id, versionNumber, updatedAt, updatedBy?.name}
  fromHtml, toHtml           // raw html of each version
}) {
  const [mode, setMode] = useState("diff");          // "diff" | "raw"
  const [outputFormat, setOutputFormat] = useState("side-by-side"); // or "line-by-line"
  const [hideUnchanged, setHideUnchanged] = useState(true);
  const [wordStyle, setWordStyle] = useState("word"); // "word" | "char"
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [wrap, setWrap] = useState(true);
  const [index, setIndex] = useState(0);

  // normalized text for differ
  const fromText = useMemo(() => htmlToPlain(fromHtml), [fromHtml]);
  const toText   = useMemo(() => htmlToPlain(toHtml),   [toHtml]);

  // metrics
  const textStats = useMemo(() => measureText(fromText, toText), [fromText, toText]);
  const headingStats = useMemo(() => countHeadingsDelta(fromHtml, toHtml), [fromHtml, toHtml]);

  // diff2html
  const diffHtml = useDiff2Html(
    `From v${fromMeta?.versionNumber || "-"}`,
    `To v${toMeta?.versionNumber || "-"}`,
    fromText,
    toText,
    { outputFormat, hideUnchanged, wordStyle, trimWhitespace }
  );

  const containerRef = useRef(null);
  const changesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;
    // collect change nodes every render
    const sel = containerRef.current.querySelectorAll(
      ".d2h-del, .d2h-ins, .d2h-change, .d2h-tag-changed, .d2h-replace"
    );
    changesRef.current = Array.from(sel);
    setIndex(0);
  }, [diffHtml, outputFormat, hideUnchanged, wordStyle]);

  const scrollTo = (i) => {
    if (!changesRef.current.length) return;
    const idx = ((i % changesRef.current.length) + changesRef.current.length) % changesRef.current.length;
    setIndex(idx);
    const el = changesRef.current[idx];
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 flex">
      <div className="bg-white w-full max-w-[1400px] mx-auto rounded-lg shadow-lg flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-2 flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold">From</span> v{fromMeta?.versionNumber} →
            <span className="font-semibold"> To</span> v{toMeta?.versionNumber}
            <span className="ml-2 text-gray-500">
              ({new Date(toMeta?.updatedAt).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMode("diff")} className={`px-2 py-1 text-xs rounded border ${mode==="diff"?"bg-gray-900 text-white":"bg-white"}`}>Diff</button>
            <button onClick={() => setMode("raw")}  className={`px-2 py-1 text-xs rounded border ${mode==="raw"?"bg-gray-900 text-white":"bg-white"}`}>Raw side-by-side</button>
            <button onClick={onClose} className="px-3 py-1 rounded border text-sm">Close</button>
          </div>
        </div>

        {/* Stats */}
        <div className="sticky top-[41px] z-10 bg-white border-b px-4 py-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full border bg-gray-50">Chars +{textStats.charsAdded}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Chars −{textStats.charsDeleted}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Words +{textStats.wordsAdded}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Words −{textStats.wordsDeleted}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Lines +{textStats.linesAdded}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Lines −{textStats.linesDeleted}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Change blocks {textStats.blocks}</span>
            {/* Only meaningful for HTML docs */}
            <span className="px-2 py-1 rounded-full border bg-gray-50">Headings +{headingStats.headingsAdded}</span>
            <span className="px-2 py-1 rounded-full border bg-gray-50">Headings −{headingStats.headingsDeleted}</span>
          </div>

          {mode === "diff" && (
            <div className="flex flex-wrap gap-3 items-center mt-2 text-xs">
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={hideUnchanged} onChange={e=>setHideUnchanged(e.target.checked)} /> Hide unchanged
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={wrap} onChange={e=>setWrap(e.target.checked)} /> Word wrap
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={trimWhitespace} onChange={e=>setTrimWhitespace(e.target.checked)} /> Trim line endings
              </label>
              <div className="inline-flex items-center gap-1">
                View:
                <select className="border rounded px-1 py-0.5" value={outputFormat} onChange={e=>setOutputFormat(e.target.value)}>
                  <option value="side-by-side">Side-by-side</option>
                  <option value="line-by-line">Line-by-line</option>
                </select>
              </div>
              <div className="inline-flex items-center gap-1">
                In-line detail:
                <select className="border rounded px-1 py-0.5" value={wordStyle} onChange={e=>setWordStyle(e.target.value)}>
                  <option value="word">Words</option>
                  <option value="char">Characters</option>
                </select>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={()=>scrollTo(index-1)} className="px-2 py-1 border rounded">Prev</button>
                <span className="text-gray-500">{changesRef.current.length ? index+1 : 0} / {changesRef.current.length || 0}</span>
                <button onClick={()=>scrollTo(index+1)} className="px-2 py-1 border rounded">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mode === "diff" ? (
            <div
              ref={containerRef}
              className={`h-full overflow-auto p-3 ${wrap ? "d2h-wrap" : ""}`}
              dangerouslySetInnerHTML={{ __html: diffHtml }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full p-3">
              <div className="border rounded p-3 overflow-y-auto">
                <h4 className="font-semibold mb-1">Left (From)</h4>
                <p className="text-xs text-gray-600 mb-2">
                  v{fromMeta?.versionNumber} • {new Date(fromMeta?.updatedAt).toLocaleString()} • {fromMeta?.updatedBy?.name || "-"}
                </p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: fromHtml }} />
              </div>
              <div className="border rounded p-3 overflow-y-auto">
                <h4 className="font-semibold mb-1">Right (To)</h4>
                <p className="text-xs text-gray-600 mb-2">
                  v{toMeta?.versionNumber} • {new Date(toMeta?.updatedAt).toLocaleString()} • {toMeta?.updatedBy?.name || "-"}
                </p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: toHtml }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* local style tweaks */}
      <style>{`
        /* enable wrapping when toggled */
        .d2h-wrap .d2h-code-side-line, 
        .d2h-wrap .d2h-code-line-ctn,
        .d2h-wrap .d2h-code-line {
          white-space: pre-wrap !important;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
