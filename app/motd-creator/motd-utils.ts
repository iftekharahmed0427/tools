import type { FormatState } from "./types";
import {
  COLOR_CLASSES,
  COLOR_KEYS,
  DEFAULT_STATE,
  FORMAT_KEYS,
  MOTD_CODE_PREFIX,
} from "./constants";

export function applyCode(state: FormatState, key: string): void {
  if (key === "r") {
    Object.assign(state, DEFAULT_STATE);
    return;
  }
  if (COLOR_KEYS.has(key)) {
    state.color = key;
    return;
  }
  const fmt = FORMAT_KEYS[key];
  if (fmt) (state[fmt] as boolean) = true;
}

export function stateToCodes(s: FormatState): string {
  const codes = ["r"];
  if (s.color !== null) codes.push(s.color);
  if (s.bold) codes.push("l");
  if (s.strikethrough) codes.push("m");
  if (s.underline) codes.push("n");
  if (s.italic) codes.push("o");
  if (s.obfuscated) codes.push("k");
  return codes.map((c) => MOTD_CODE_PREFIX + c).join("");
}

export function elementToMotd(el: HTMLElement | null): string {
  if (!el) return "";
  let out = "";
  const state: FormatState = { ...DEFAULT_STATE };
  const stack: FormatState[] = [];

  function visit(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      out += (node.textContent || "").replace(/§/g, "§§");
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const span = node as HTMLElement;

    if (span.tagName === "SPAN" && span.classList.contains("motd-code")) {
      const raw = span.textContent || "";
      const code = raw.startsWith(MOTD_CODE_PREFIX) ? raw.slice(1) : raw;
      if (code.length) {
        out += MOTD_CODE_PREFIX + code;
        applyCode(state, code);
      }
      return;
    }

    if (span.tagName === "SPAN" && span.classList.contains("motd-fmt")) {
      stack.push({ ...state });
      span.childNodes.forEach(visit);
      const parent = stack.pop()!;
      out += stateToCodes(parent);
      Object.assign(state, parent);
      return;
    }

    span.childNodes.forEach(visit);
  }

  el.childNodes.forEach(visit);
  return out;
}

export function applyFormatToSelection(
  editorRoot: HTMLDivElement | null,
  formatKey: string
): void {
  const sel = document.getSelection();
  if (!sel || !editorRoot || !editorRoot.contains(sel.anchorNode)) return;

  const range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  if (!range || !editorRoot.contains(range.commonAncestorContainer)) return;

  const code = MOTD_CODE_PREFIX + formatKey;
  const displayClass =
    formatKey === "r" ? "" : (COLOR_CLASSES[formatKey] ?? "");

  const wrapper = document.createElement("span");
  if (formatKey === "r") {
    wrapper.className =
      "motd-fmt motd-reset text-[#7e7e7e] font-normal not-italic no-underline";
  } else {
    wrapper.className =
      "motd-fmt" + (displayClass ? " " + displayClass : "");
  }

  const codeSpan = document.createElement("span");
  codeSpan.className = "motd-code";
  codeSpan.textContent = code;
  wrapper.appendChild(codeSpan);

  if (range.collapsed) {
    range.insertNode(wrapper);
    range.setStart(wrapper, 1);
    range.collapse(true);
  } else {
    if (formatKey === "r") {
      const text = range.toString();
      range.deleteContents();
      wrapper.appendChild(document.createTextNode(text));
    } else {
      const frag = range.extractContents();
      wrapper.appendChild(frag);
    }
    range.insertNode(wrapper);
    range.setStartAfter(wrapper);
    range.collapse(true);
  }

  sel.removeAllRanges();
  sel.addRange(range);
}
