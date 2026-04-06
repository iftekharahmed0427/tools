"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Undo2, X } from "lucide-react";

// ── Data ────────────────────────────────────────────────────────────────────

const PATTERNS = [
  "bs", "bl", "gru", "bts", "br", "drs", "dls", "bo", "cbo", "bt", "ts", "tl",
  "tr", "tts", "cre", "sc", "ms", "bri", "flo", "glb", "gra", "tt", "mr", "cs",
  "ls", "rs", "ss", "rud", "lud", "ld", "rd", "hh", "hhb", "vh", "vhr", "mc",
  "cr", "sku", "pig", "moj",
];

const COLORS = [
  { name: "white",      code: "0",  hex: "FFFFFF", filter: "brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(1%) hue-rotate(186deg) brightness(104%) contrast(101%)" },
  { name: "orange",     code: "1",  hex: "F9801D", filter: "brightness(0) saturate(100%) invert(59%) sepia(61%) saturate(2896%) hue-rotate(348deg) brightness(101%) contrast(95%)" },
  { name: "magenta",    code: "2",  hex: "C74EBD", filter: "brightness(0) saturate(100%) invert(49%) sepia(22%) saturate(3334%) hue-rotate(275deg) brightness(82%) contrast(86%)" },
  { name: "light_blue", code: "3",  hex: "3AB3DA", filter: "brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(3501%) hue-rotate(159deg) brightness(91%) contrast(86%)" },
  { name: "yellow",     code: "4",  hex: "FED83D", filter: "brightness(0) saturate(100%) invert(100%) sepia(45%) saturate(3901%) hue-rotate(324deg) brightness(103%) contrast(99%)" },
  { name: "lime",       code: "5",  hex: "80C71F", filter: "brightness(0) saturate(100%) invert(67%) sepia(91%) saturate(403%) hue-rotate(37deg) brightness(89%) contrast(94%)" },
  { name: "pink",       code: "6",  hex: "F38BAA", filter: "brightness(0) saturate(100%) invert(84%) sepia(19%) saturate(3821%) hue-rotate(292deg) brightness(99%) contrast(92%)" },
  { name: "gray",       code: "7",  hex: "474F52", filter: "brightness(0) saturate(100%) invert(29%) sepia(9%) saturate(427%) hue-rotate(151deg) brightness(94%) contrast(90%)" },
  { name: "light_gray", code: "8",  hex: "9D9D97", filter: "brightness(0) saturate(100%) invert(66%) sepia(0%) saturate(0%) hue-rotate(107deg) brightness(92%) contrast(98%)" },
  { name: "cyan",       code: "9",  hex: "169C9C", filter: "brightness(0) saturate(100%) invert(47%) sepia(98%) saturate(363%) hue-rotate(131deg) brightness(88%) contrast(94%)" },
  { name: "purple",     code: "10", hex: "8932B8", filter: "brightness(0) saturate(100%) invert(26%) sepia(73%) saturate(2155%) hue-rotate(263deg) brightness(83%) contrast(95%)" },
  { name: "blue",       code: "11", hex: "3C44AA", filter: "brightness(0) saturate(100%) invert(22%) sepia(83%) saturate(1389%) hue-rotate(218deg) brightness(97%) contrast(93%)" },
  { name: "brown",      code: "12", hex: "835432", filter: "brightness(0) saturate(100%) invert(31%) sepia(17%) saturate(1524%) hue-rotate(342deg) brightness(103%) contrast(85%)" },
  { name: "green",      code: "13", hex: "5E7C16", filter: "brightness(0) saturate(100%) invert(35%) sepia(94%) saturate(554%) hue-rotate(38deg) brightness(96%) contrast(83%)" },
  { name: "red",        code: "14", hex: "B02E26", filter: "brightness(0) saturate(100%) invert(21%) sepia(73%) saturate(2356%) hue-rotate(347deg) brightness(89%) contrast(85%)" },
  { name: "black",      code: "15", hex: "1E1B1B", filter: "brightness(0) saturate(100%) invert(7%) sepia(9%) saturate(346%) hue-rotate(337deg) brightness(100%) contrast(92%)" },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface LayerData {
  name: string;
  pattern: string;
  color: string;
}

interface ToastItem {
  id: number;
  message: string;
}

const defaultLayers = (): LayerData[] => [
  { name: "Base",    pattern: "N/A", color: "FFFFFF" },
  { name: "Layer 1", pattern: "",    color: "" },
  { name: "Layer 2", pattern: "",    color: "" },
  { name: "Layer 3", pattern: "",    color: "" },
  { name: "Layer 4", pattern: "",    color: "" },
  { name: "Layer 5", pattern: "",    color: "" },
  { name: "Layer 6", pattern: "",    color: "" },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function BannerCreator() {
  const [activeTab, setActiveTab]   = useState(0);
  const [layers, setLayers]         = useState<LayerData[]>(defaultLayers());
  const [history, setHistory]       = useState<LayerData[][]>([]);
  const [toasts, setToasts]         = useState<ToastItem[]>([]);
  const toastId                     = useRef(0);

  const [bannerGive, setBannerGive] = useState("");
  const [shieldGive, setShieldGive] = useState("");
  const [spigot, setSpigot]         = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────

  const colorByHex = (hex: string) => COLORS.find((c) => c.hex === hex);

  const showToast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const computeOutputs = useCallback((data: LayerData[]) => {
    const base     = colorByHex(data[0].color);
    const baseName = base?.name ?? "white";
    const baseCode = base?.code ?? "0";

    let patternStr    = "";
    let spigotStr     = "";
    let patternPresent = false;

    for (let i = 1; i < data.length; i++) {
      if (!data[i].pattern || !data[i].color) continue;
      patternPresent = true;
      const c = colorByHex(data[i].color);
      patternStr  += `,{Color:${c?.code ?? "0"},Pattern:"${data[i].pattern}"}`;
      spigotStr   += `meta.addPattern(new Pattern(DyeColor.${(c?.name ?? "white").toUpperCase()}, PatternType.getByIdentifier("${data[i].pattern}")));\n`;

    }

    let newBanner = `/give @p minecraft:${baseName}_banner`;
    let newShield = "/give @p minecraft:shield";
    let newSpigot = `ItemStack is = new ItemStack(Material.${baseName.toUpperCase()}_BANNER);\n`;

    if (patternPresent) {
      const pBlock = patternStr.substring(1);
      newBanner += `{BlockEntityTag:{Patterns:[${pBlock}]}}`;
      newShield += `{BlockEntityTag:{Base:${baseCode},Patterns:[${pBlock}]}}`;
      newSpigot += `BannerMeta meta = (BannerMeta) is.getItemMeta();\n${spigotStr}is.setItemMeta(meta);`;
    }

    setBannerGive(newBanner);
    setShieldGive(newShield);
    setSpigot(newSpigot);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback(
    (newData: LayerData[]) => {
      setLayers(newData);
      setHistory((prev) => [...prev, JSON.parse(JSON.stringify(newData))]);
      computeOutputs(newData);
    },
    [computeOutputs],
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleSetPattern = (pattern: string) => {
    const next = layers.map((l, i) =>
      i !== activeTab ? l : { ...l, pattern, color: l.color || "FFFFFF" },
    );
    commit(next);
  };

  const handleSetColor = (hex: string) => {
    const next = layers.map((l, i) => (i !== activeTab ? l : { ...l, color: hex }));
    commit(next);
  };

  const handleClearLayer = () => {
    const next = layers.map((l, i) =>
      i !== activeTab ? l : { ...l, pattern: "", color: "" },
    );
    commit(next);
  };

  const handleClearBanner = () => {
    const next = layers.map((l, i) =>
      i === 0 ? l : { ...l, pattern: "", color: "" },
    );
    commit(next);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const prev       = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    const restored = JSON.parse(JSON.stringify(prev));
    setLayers(restored);
    computeOutputs(restored);
  };

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied successfully!");
  };

  // ── URL hash hydration ─────────────────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const base   = params.get("base");

    if (base && COLORS.some((c) => c.hex === base)) {
      const data = defaultLayers();
      data[0].color = base;

      for (let i = 1; i <= 6; i++) {
        const p = params.get(`l${i}p`);
        const c = params.get(`l${i}c`);
        if (p && PATTERNS.includes(p)) {
          data[i].pattern = p;
          if (c && COLORS.some((col) => col.hex === c)) data[i].color = c;
        }
      }

      setLayers(data);
      setHistory([JSON.parse(JSON.stringify(data))]);
      computeOutputs(data);
    } else {
      const init = defaultLayers();
      setHistory([JSON.parse(JSON.stringify(init))]);
      computeOutputs(init);
    }
  }, [computeOutputs]);

  // ── Button style helpers ───────────────────────────────────────────────────

  const tabBtn = (active: boolean) =>
    `text-sm sm:text-base h-8 sm:h-9 px-3 sm:px-4 rounded-lg cursor-pointer transition-colors border-none ring-0 font-medium flex items-center gap-1.5 ${
      active
        ? "bg-[#235AB4] hover:bg-[#235AB4]/90 text-white"
        : "bg-[#36446B] hover:bg-[#36446B]/80 text-[#A4BDDE]"
    }`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-2 md:py-2 space-y-4 bg-transparent">

      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-green-700/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg"
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Main card */}
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222]">
        <CardContent className="py-6 px-4 sm:px-6 md:px-12">

          {/* Header */}
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
              <p className="text-[#2B7FFF]">Gravel Host</p>
              <p>Banner Creator</p>
            </CardTitle>
            <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
              Design custom Minecraft banners with up to 6 pattern layers. Copy commands directly into your server.
            </CardDescription>
          </CardHeader>

          {/* Layer tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {layers.map((layer, i) => (
              <button key={layer.name} onClick={() => setActiveTab(i)} className={tabBtn(i === activeTab)}>
                {layer.name}
                {i > 0 && layer.pattern && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF]" />
                )}
              </button>
            ))}
          </div>

          {/* Pattern picker (always visible; disabled on Base tab) */}
          <div className="mb-5">
            <p className="text-[#94A0B6] text-xs uppercase tracking-wide mb-2">Pattern</p>
            <div className={`flex flex-wrap gap-1.5 ${activeTab === 0 ? "opacity-40 pointer-events-none select-none" : ""}`}>
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSetPattern(p)}
                  disabled={activeTab === 0}
                  className={`rounded border-2 transition-colors ${
                    layers[activeTab].pattern === p
                      ? "border-[#235AB4] bg-[#235AB4]/20"
                      : "border-[#222F45] hover:border-[#235AB4]/60"
                  }`}
                >
                  <img
                    src={`/banner/${p}.png`}
                    alt={p}
                    width={32}
                    height={60}
                    style={{ imageRendering: "pixelated" }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="mb-6">
            <p className="text-[#94A0B6] text-xs uppercase tracking-wide mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleSetColor(c.hex)}
                  title={c.name.replace(/_/g, " ")}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 transition-colors ${
                    layers[activeTab].color === c.hex
                      ? "border-[#2B7FFF] scale-110"
                      : "border-transparent hover:border-white/40"
                  }`}
                  style={{ backgroundColor: `#${c.hex}` }}
                />
              ))}
            </div>
          </div>

          {/* Preview + outputs */}
          <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-8 xl:gap-12 items-start">

            {/* Banner preview */}
            <div className="mx-auto xl:mx-0 flex flex-col items-center xl:items-start">
              <p className="text-[#94A0B6] text-xs uppercase tracking-wide mb-3">Preview</p>
              <div className="relative w-[112px] h-[209px] sm:w-[140px] sm:h-[262px]">
                {/* Base layer */}
                <img
                  src="/banner/base.png"
                  alt="Banner base"
                  className="absolute inset-0 w-full h-full"
                  style={{
                    imageRendering: "pixelated",
                    filter: colorByHex(layers[0].color)?.filter,
                  }}
                />
                {/* Pattern layers */}
                {layers.slice(1).map((layer, i) =>
                  layer.pattern ? (
                    <img
                      key={i}
                      src={`/banner/${layer.pattern}.png`}
                      alt={`Layer ${i + 1}`}
                      className="absolute inset-0 w-full h-full"
                      style={{
                        imageRendering: "pixelated",
                        filter: colorByHex(layer.color)?.filter,
                      }}
                    />
                  ) : null,
                )}
              </div>
            </div>

            {/* Output commands */}
            <div className="space-y-4 min-w-0">
              <OutputField
                label="Banner Give Command"
                value={bannerGive}
                onCopy={() => copyValue(bannerGive)}
              />
              <OutputField
                label="Shield Give Command"
                value={shieldGive}
                onCopy={() => copyValue(shieldGive)}
              />
              <OutputField
                label="Spigot API Code"
                value={spigot}
                multiline
                onCopy={() => copyValue(spigot)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-[#222F45]">
            <Button
              onClick={handleClearLayer}
              className="bg-[#36446B] hover:bg-[#36446B]/80 text-white border-none ring-0 text-sm h-9"
            >
              <X className="size-4" />
              Clear Layer
            </Button>
            <Button
              onClick={handleClearBanner}
              className="bg-[#36446B] hover:bg-[#36446B]/80 text-white border-none ring-0 text-sm h-9"
            >
              <Trash2 className="size-4" />
              Clear Banner
            </Button>
            <Button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="bg-[#36446B] hover:bg-[#36446B]/80 text-white border-none ring-0 text-sm h-9 disabled:opacity-40"
            >
              <Undo2 className="size-4" />
              Undo
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ── OutputField ──────────────────────────────────────────────────────────────

interface OutputFieldProps {
  label: string;
  value: string;
  onCopy: () => void;
  multiline?: boolean;
}

function OutputField({ label, value, onCopy, multiline = false }: OutputFieldProps) {
  return (
    <div>
      <p className="text-sm font-medium text-[#DBE9FE] mb-1.5">{label}</p>
      <div className="flex gap-2 items-start">
        {multiline ? (
          <textarea
            readOnly
            value={value}
            rows={4}
            className="flex-1 min-w-0 text-sm text-[#A4BDDE] font-mono rounded-md p-2 bg-[#141517] border border-[#222F45] resize-none focus:outline-none"
          />
        ) : (
          <input
            readOnly
            value={value}
            className="flex-1 min-w-0 text-sm text-[#A4BDDE] font-mono rounded-md px-3 h-9 bg-[#141517] border border-[#222F45] focus:outline-none"
          />
        )}
        <Button
          onClick={onCopy}
          size="sm"
          className="bg-[#235AB4] hover:bg-[#235AB4]/90 text-white border-none ring-0 h-9 shrink-0"
        >
          <Copy className="size-4" />
          Copy
        </Button>
      </div>
    </div>
  );
}
