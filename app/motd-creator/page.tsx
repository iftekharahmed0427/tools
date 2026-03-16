"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_LINE1 = "A Minecraft Server";

const COLOR_CLASSES: Record<string, string> = {
  "0": "text-mc-black",
  "1": "text-mc-dark-blue",
  "2": "text-mc-dark-green",
  "3": "text-mc-dark-aqua",
  "4": "text-mc-dark-red",
  "5": "text-mc-dark-purple",
  "6": "text-mc-gold",
  "7": "text-mc-gray",
  "8": "text-mc-dark-gray",
  "9": "text-mc-blue",
  a: "text-mc-green",
  b: "text-mc-aqua",
  c: "text-mc-red",
  d: "text-mc-light-purple",
  e: "text-mc-yellow",
  f: "text-mc-white",
  l: "font-bold",
  m: "line-through",
  n: "underline",
  o: "italic",
  r: "",
  k: "mc-obfuscated",
};

const MOTD_CODE_PREFIX = "§";

const COLOR_KEYS = new Set("0123456789abcdef");
const FORMAT_KEYS: Record<string, keyof FormatState> = {
  l: "bold",
  m: "strikethrough",
  n: "underline",
  o: "italic",
  k: "obfuscated",
};

interface FormatState {
  color: string | null;
  bold: boolean;
  strikethrough: boolean;
  underline: boolean;
  italic: boolean;
  obfuscated: boolean;
}

const DEFAULT_STATE: FormatState = {
  color: null,
  bold: false,
  strikethrough: false,
  underline: false,
  italic: false,
  obfuscated: false,
};

function applyCode(state: FormatState, key: string): void {
  if (key === "r") {
    state.color = DEFAULT_STATE.color;
    state.bold = false;
    state.strikethrough = false;
    state.underline = false;
    state.italic = false;
    state.obfuscated = false;
    return;
  }
  if (COLOR_KEYS.has(key)) {
    state.color = key;
    return;
  }
  const fmt = FORMAT_KEYS[key];
  if (fmt) (state[fmt] as boolean) = true;
}

function stateToCodes(s: FormatState): string {
  let codes = MOTD_CODE_PREFIX + "r";
  if (s.color !== null) codes += MOTD_CODE_PREFIX + s.color;
  if (s.bold) codes += MOTD_CODE_PREFIX + "l";
  if (s.strikethrough) codes += MOTD_CODE_PREFIX + "m";
  if (s.underline) codes += MOTD_CODE_PREFIX + "n";
  if (s.italic) codes += MOTD_CODE_PREFIX + "o";
  if (s.obfuscated) codes += MOTD_CODE_PREFIX + "k";
  return codes;
}

function elementToMotd(el: HTMLElement | null): string {
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
      state.color = parent.color;
      state.bold = parent.bold;
      state.strikethrough = parent.strikethrough;
      state.underline = parent.underline;
      state.italic = parent.italic;
      state.obfuscated = parent.obfuscated;
      return;
    }
    span.childNodes.forEach(visit);
  }

  el.childNodes.forEach(visit);
  return out;
}

function applyFormatToSelection(editorRoot: HTMLDivElement | null, formatKey: string): void {
  const sel = document.getSelection();
  if (!sel || !editorRoot || !editorRoot.contains(sel.anchorNode)) return;

  const range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  if (!range || !editorRoot.contains(range.commonAncestorContainer)) return;

  const code = MOTD_CODE_PREFIX + formatKey;
  const displayClass = COLOR_CLASSES[formatKey] ?? "";

  const wrapper = document.createElement("span");
  wrapper.className = "motd-fmt" + (displayClass ? " " + displayClass : "");

  const codeSpan = document.createElement("span");
  codeSpan.className = "motd-code";
  codeSpan.textContent = code;
  wrapper.appendChild(codeSpan);

  if (range.collapsed) {
    range.insertNode(wrapper);
    range.setStart(wrapper, 1);
    range.collapse(true);
  } else {
    const frag = range.extractContents();
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
    range.setStartAfter(wrapper);
    range.collapse(true);
  }

  sel.removeAllRanges();
  sel.addRange(range);
}

export default function MotdCreatorPage() {
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const [motdValue, setMotdValue] = useState("");

  const syncMotd = useCallback(() => {
    const part1 = elementToMotd(line1Ref.current);
    const part2 = elementToMotd(line2Ref.current);
    setMotdValue(`${part1}\n${part2}`);
  }, []);

  useEffect(() => {
    if (line1Ref.current) line1Ref.current.textContent = INITIAL_LINE1;
    if (line2Ref.current) line2Ref.current.textContent = "";
    queueMicrotask(syncMotd);
  }, [syncMotd]);

  useEffect(() => {
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    if (!l1 || !l2) return;
    const obs = new MutationObserver(syncMotd);
    obs.observe(l1, { childList: true, subtree: true, characterData: true });
    obs.observe(l2, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [syncMotd]);

  const applyFormat = (formatKey: string) => {
    const inLine1 = line1Ref.current?.contains(document.getSelection()?.anchorNode ?? null);
    const editor = inLine1 ? line1Ref.current : line2Ref.current;
    applyFormatToSelection(editor, formatKey);
    editor?.focus();
    syncMotd();
  };

  const handleKeyDown = (e: React.KeyboardEvent, line: 1 | 2) => {
    if (line === 1 && e.key === "Enter") {
      e.preventDefault();
      line2Ref.current?.focus();
    }
    if (line === 2 && e.key === "Backspace" && (e.currentTarget as HTMLDivElement).innerText === "") {
      e.preventDefault();
      line1Ref.current?.focus();
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-16">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222] calculator-card">
        <CardContent className="py-4 px-4 sm:px-6 md:px-12">
          <div className="space-y-6 md:space-y-12">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE] text-center">
                <p><span className="text-[#2B7FFF]">Gravel Host</span> MOTD Editor</p>
              </CardTitle>
              <CardDescription className="text-[#A4BDDE] text-base md:text-lg text-center">
                Edit and preview your server MOTD.
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col justify-center items-center max-w-[610px] mx-auto">
              <div className="editor-container relative mx-auto w-full font-minecraft">
                <div className="editor-inner relative min-h-[64px] w-[610px] bg-repeat bg-size-[80px] pt-3 pr-5 pb-3 pl-3 flex box-content" style={{ backgroundImage: "url('/minecraft-background.png')" }}>
                  <div className="server-icon relative mr-1.5">
                    <Image src="/unknown_server.jpg" alt="Server Icon" width={64} height={64} />
                  </div>
                  <div className="server-texts text-white text-[19px] leading-3.5">
                    <div className="server-name mt-1 whitespace-pre-wrap">Minecraft Server</div>
                    <div className="editor mt-1.5 leading-[18px]">
                        <div className="motd-editor h-full flex flex-col text-white">
                        <div className="output" />
                        <div className="editor-wrapper text-[#7e7e7e] text-[19px] leading-[20px] minecraft-colors [&_.motd-code]:hidden">
                          <div
                            ref={line1Ref}
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none empty:before:content-[''] empty:before:text-[#7e7e7e] min-h-[1.25em]"
                            onInput={syncMotd}
                            onKeyDown={(e) => handleKeyDown(e, 1)}
                            spellCheck={false}
                          />
                          <div
                            ref={line2Ref}
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none empty:before:content-[''] empty:before:text-[#7e7e7e] min-h-[1.25em]"
                            onInput={syncMotd}
                            onKeyDown={(e) => handleKeyDown(e, 2)}
                            spellCheck={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="editor-bar-bottom min-w-[642px] bg-[#2C385C] flex justify-between items-center pt-2 pb-2 pl-3 pr-3 rounded-bl-[5px] rounded-br-[5px] relative">
                  <div className="toolbar w-full">
                    <div className="toolbar-wrapper justify-center w-full flex items-center">
                      <div className="toolbar-color-buttons flex items-center flex-wrap h-full minecraft-colors">
                        {(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"] as const).map((key) => (
                          <button
                            key={key}
                            type="button"
                            className={`toolbar-button ${COLOR_CLASSES[key]}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormat(key)}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                      <div className="toolbar-format-buttons flex flex-wrap items-center h-full justify-center minecraft-colors">
                        {(["l", "m", "n", "o", "r", "k"] as const).map((key) => (
                          <button
                            key={key}
                            type="button"
                            className={`toolbar-button text-mc-white ${key === "l" ? "font-bold" : key === "m" ? "line-through" : key === "n" ? "underline" : key === "o" ? "italic" : ""}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormat(key)}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  readOnly
                  value={motdValue.replace(/\n/g, "\\n")}
                  className="mt-3 min-w-0 w-full max-w-[642px] mx-auto bg-muted/50 border border-muted rounded-md px-3 py-2 text-muted-foreground font-mono text-sm"
                  placeholder="motd= (generated from editor above)" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
