"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COLOR_BUTTON_KEYS,
  COLOR_CLASSES,
  FORMAT_BUTTON_KEYS,
  INITIAL_LINE1,
} from "./constants";
import { applyFormatToSelection, elementToMotd } from "./motd-utils";

export default function MotdCreatorPage() {
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const [motdValue, setMotdValue] = useState("");
  const [copied, setCopied] = useState(false);

  const copyMotd = useCallback(() => {
    if (!motdValue) return;
    navigator.clipboard.writeText(motdValue).catch(() => {
      // Clipboard write failed (e.g. permissions, non-HTTPS)
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [motdValue]);

  const syncMotd = useCallback(() => {
    const part1 = elementToMotd(line1Ref.current);
    const part2 = elementToMotd(line2Ref.current);
    setMotdValue(part2 ? `${part1}\n${part2}` : part1);
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
    const opts = { childList: true, subtree: true, characterData: true } as const;
    obs.observe(l1, opts);
    obs.observe(l2, opts);
    return () => obs.disconnect();
  }, [syncMotd]);

  const applyFormat = useCallback(
    (formatKey: string) => {
      const sel = document.getSelection();
      const inLine1 = line1Ref.current?.contains(sel?.anchorNode ?? null);
      const inLine2 = line2Ref.current?.contains(sel?.anchorNode ?? null);
      const editor = inLine1
        ? line1Ref.current
        : inLine2
          ? line2Ref.current
          : line1Ref.current;
      applyFormatToSelection(editor, formatKey);
      editor?.focus();
      syncMotd();
    },
    [syncMotd]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, line: 1 | 2) => {
      if (line === 1 && e.key === "Enter") {
        e.preventDefault();
        line2Ref.current?.focus();
      }
      if (
        line === 2 &&
        e.key === "Backspace" &&
        (e.currentTarget as HTMLDivElement).innerText === ""
      ) {
        e.preventDefault();
        line1Ref.current?.focus();
      }
    },
    []
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-0.5 sm:py-1 md:py-1">
      <Card className="bg-transparent calculator-card border-none ring-0 shadow-none">
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
            <div className="flex flex-col justify-center items-center w-full mx-auto">
              <div
                className="editor-container relative mx-auto w-full font-minecraft overflow-x-hidden"
                style={
                  {
                    "--motd-row-w": "min(642px, calc(100vw - 2rem))",
                  } as React.CSSProperties
                }
              >
                {/* Server preview area */}
                <div
                  className="editor-inner relative min-h-[64px] w-(--motd-row-w) bg-repeat p-3 sm:pr-5 flex box-border mx-auto"
                  style={{
                    backgroundImage: "url('/minecraft-background.png')",
                    backgroundSize: "calc(var(--motd-row-w) * 80 / 642)",
                  }}
                >
                  <div className="server-icon relative mr-1.5">
                    <Image src="/unknown_server.jpg" alt="Server Icon" width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16" />
                  </div>
                  <div className="server-texts text-white text-[16px] sm:text-[19px] leading-3.5 flex-1 min-w-0">
                    <div className="server-name mt-1 whitespace-pre-wrap">Minecraft Server</div>
                    <div className="mt-1.5 text-[#7e7e7e] text-[16px] sm:text-[19px] leading-[20px] minecraft-colors [&_.motd-code]:hidden">
                      <div
                        ref={line1Ref}
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none empty:before:content-[''] empty:before:text-[#7e7e7e] min-h-[1.25em] wrap-break-word"
                        onKeyDown={(e) => handleKeyDown(e, 1)}
                        spellCheck={false}
                      />
                      <div
                        ref={line2Ref}
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none empty:before:content-[''] empty:before:text-[#7e7e7e] min-h-[1.25em] wrap-break-word"
                        onKeyDown={(e) => handleKeyDown(e, 2)}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="editor-bar-bottom w-(--motd-row-w) max-w-full bg-[#2C385C] flex justify-between items-center py-2 px-3 rounded-bl-[5px] rounded-br-[5px] relative mx-auto">
                  <div className="toolbar w-full">
                    <div className="toolbar-wrapper justify-center w-full flex flex-col sm:flex-row items-center gap-2">
                      <div className="toolbar-color-buttons flex items-center flex-wrap h-full minecraft-colors justify-center w-full sm:w-auto">
                        {COLOR_BUTTON_KEYS.map((key) => (
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
                      <div className="toolbar-format-buttons flex flex-wrap items-center h-full justify-center minecraft-colors w-full sm:w-auto">
                        {FORMAT_BUTTON_KEYS.map((key) => (
                          <button
                            key={key}
                            type="button"
                            className={`toolbar-button text-mc-white ${COLOR_CLASSES[key] || ""}`}
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

                {/* MOTD output */}
                <div className="mt-3 w-(--motd-row-w) max-w-full mx-auto">
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={motdValue.replace(/\n/g, "\\n")}
                      className="text-white min-w-0 flex-1 rounded-md px-3 py-2 font-mono text-sm bg-[#36446B] border-none outline-none focus:ring-0 focus:outline-none"
                      placeholder="motd= (generated from editor above)"
                    />
                    <button
                      type="button"
                      onClick={copyMotd}
                      className="shrink-0 rounded-md px-3 py-2 text-sm font-medium bg-[#36446B] text-white hover:bg-[#3f4d7a] transition-colors outline-none focus:ring-0 focus:outline-none font-sans"
                    >
                      <span className="inline-flex items-center gap-2">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <a
                href="https://gravelhost.com/minecraft-server-icon-converter"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm sm:text-base text-[#A4BDDE] hover:text-[#2B7FFF] transition-colors"
              >
                Need a server icon? Try our Server Icon Converter →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
