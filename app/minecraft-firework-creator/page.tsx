"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

// ── Assets ───────────────────────────────────────────────────────────────────

const TEX = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/";

const ITEM_TEX: Record<string, string> = {
  "Black Dye":      `${TEX}black_dye.png`,
  "Blue Dye":       `${TEX}blue_dye.png`,
  "Brown Dye":      `${TEX}brown_dye.png`,
  "Cyan Dye":       `${TEX}cyan_dye.png`,
  "Gray Dye":       `${TEX}gray_dye.png`,
  "Green Dye":      `${TEX}green_dye.png`,
  "Light Blue Dye": `${TEX}light_blue_dye.png`,
  "Light Gray Dye": `${TEX}light_gray_dye.png`,
  "Lime Dye":       `${TEX}lime_dye.png`,
  "Magenta Dye":    `${TEX}magenta_dye.png`,
  "Orange Dye":     `${TEX}orange_dye.png`,
  "Pink Dye":       `${TEX}pink_dye.png`,
  "Purple Dye":     `${TEX}purple_dye.png`,
  "Red Dye":        `${TEX}red_dye.png`,
  "White Dye":      `${TEX}white_dye.png`,
  "Yellow Dye":     `${TEX}yellow_dye.png`,
  "Gunpowder":      `${TEX}gunpowder.png`,
  "Paper":          `${TEX}paper.png`,
  "Diamond":        `${TEX}diamond.png`,
  "Glowstone Dust": `${TEX}glowstone_dust.png`,
  "Firework Star":  `${TEX}firework_star.png`,
  "Firework Rocket":`${TEX}firework_rocket.png`,
  "Fire Charge":    `${TEX}fire_charge.png`,
  "Gold Nugget":    `${TEX}gold_nugget.png`,
  "Feather":        `${TEX}feather.png`,
  "Creeper Head":   `${TEX}creeper_head.png`,
};

// ── Data ─────────────────────────────────────────────────────────────────────

const DYES = [
  { color: "Black Dye",      deci: 1973019,  rgb: "0, 0, 0" },
  { color: "Blue Dye",       deci: 2437522,  rgb: "0, 0, 255" },
  { color: "Brown Dye",      deci: 5320730,  rgb: "150, 75, 0" },
  { color: "Cyan Dye",       deci: 2651799,  rgb: "0, 100, 100" },
  { color: "Gray Dye",       deci: 4408131,  rgb: "128, 128, 128" },
  { color: "Green Dye",      deci: 3887386,  rgb: "0, 255, 0" },
  { color: "Light Blue Dye", deci: 6719955,  rgb: "173, 216, 230" },
  { color: "Light Gray Dye", deci: 11250603, rgb: "211, 211, 211" },
  { color: "Lime Dye",       deci: 4312372,  rgb: "50, 205, 50" },
  { color: "Magenta Dye",    deci: 12801229, rgb: "255, 0, 255" },
  { color: "Orange Dye",     deci: 15435844, rgb: "255, 165, 0" },
  { color: "Pink Dye",       deci: 14188952, rgb: "255, 192, 203" },
  { color: "Purple Dye",     deci: 8073150,  rgb: "128, 0, 128" },
  { color: "Red Dye",        deci: 11743532, rgb: "255, 0, 0" },
  { color: "White Dye",      deci: 15790320, rgb: "255, 255, 255" },
  { color: "Yellow Dye",     deci: 14602026, rgb: "255, 255, 0" },
];

const SHAPES = [
  { shape: "Default",    img: "default" },
  { shape: "Large Ball", img: "large-ball" },
  { shape: "Star",       img: "star" },
  { shape: "Creeper",    img: "creeper" },
  { shape: "Burst",      img: "burst" },
];

const EFFECTS = [
  { name: "Flicker", img: "flicker" },
  { name: "Trail",   img: "trail" },
];

const POWER_VALUES = [
  { name: "Low",    img: "flight-1", level: 1 },
  { name: "Medium", img: "flight-2", level: 2 },
  { name: "High",   img: "flight-3", level: 3 },
];

// Item positions on the crafting grid (top-left 2 rows, 3 columns)
const CRAFT_POSITIONS = [
  { left: 60,  top: 40  },
  { left: 100, top: 40  },
  { left: 138, top: 40  },
  { left: 60,  top: 85  },
  { left: 100, top: 85  },
  { left: 138, top: 85  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Results {
  giveCmd:    string;
  summonCmd:  string;
  spigotCode: string;
  hasRecipe:  boolean;
}

interface ToastItem {
  id: number;
  message: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shapeType(s: string): number {
  switch (s) {
    case "Large Ball": return 1;
    case "Star":       return 2;
    case "Creeper":    return 3;
    case "Burst":      return 4;
    default:           return 0;
  }
}

function shapeTypeStr(s: string): string {
  switch (s) {
    case "Large Ball": return "BALL_LARGE";
    case "Star":       return "STAR";
    case "Creeper":    return "CREEPER";
    case "Burst":      return "BURST";
    default:           return "BALL";
  }
}

function shapeIngredient(s: string): string {
  switch (s) {
    case "Large Ball": return "Fire Charge";
    case "Star":       return "Gold Nugget";
    case "Creeper":    return "Creeper Head";
    case "Burst":      return "Feather";
    default:           return "";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FireworkCreator() {
  const [primaryColors, setPrimaryColors] = useState<string[]>([]);
  const [fadingColors,  setFadingColors]  = useState<string[]>([]);
  const [shape,         setShape]         = useState("Default");
  const [flicker,       setFlicker]       = useState(false);
  const [trail,         setTrail]         = useState(false);
  const [flightPower,   setFlightPower]   = useState(0);
  const [results,       setResults]       = useState<Results | null>(null);
  const [errors,        setErrors]        = useState<string[]>([]);
  const [toasts,        setToasts]        = useState<ToastItem[]>([]);
  const toastId    = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied successfully!");
  };

  const toggleColor = (color: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(color)) {
      setList(list.filter((c) => c !== color));
    } else if (list.length < 6) {
      setList([...list, color]);
    }
  };

  const handleGenerate = () => {
    const errs: string[] = [];
    if (!primaryColors.length) errs.push("Select at least one Primary Color.");
    if (!flightPower)          errs.push("Select a Flight Duration.");
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);

    const type     = shapeType(shape);
    const flickStr = flicker ? ",Flicker:1" : "";
    const trailStr = trail   ? ",Trail:1"   : "";
    const primary  = primaryColors.map((c) => DYES.find((d) => d.color === c)!.deci);
    const fading   = fadingColors.map((c)  => DYES.find((d) => d.color === c)!.deci);
    const fadePart = fading.length ? `,FadeColors:[I;${fading.join(",")}]` : "";

    const giveCmd =
      `/give @s firework_rocket{Fireworks:{Flight:${flightPower},Explosions:[{Type:${type}${flickStr}${trailStr},Colors:[I;${primary.join(",")}]${fadePart}}]}} 1`;

    const summonCmd =
      `/summon firework_rocket ~ ~ ~ {FireworksItem:{id:firework_rocket,Count:1,tag:{Fireworks:{Flight:${flightPower},Explosions:[{Type:${type}${flickStr}${trailStr},Colors:[I;${primary.join(",")}]${fadePart}}]}}}}`;

    const primarySpigot = primaryColors
      .map((c) => `.withColor(Color.fromRGB(${DYES.find((d) => d.color === c)!.rgb}))`)
      .join("");
    const fadingSpigot = fadingColors
      .map((c) => `.withFade(Color.fromRGB(${DYES.find((d) => d.color === c)!.rgb}))`)
      .join("");

    const spigotCode =
      `ItemStack firework = new ItemStack(Material.FIREWORK_ROCKET);\n` +
      `FireworkMeta meta = (FireworkMeta) firework.getItemMeta();\n` +
      `meta.addEffect(FireworkEffect.builder()${primarySpigot}.with(FireworkEffect.Type.${shapeTypeStr(shape)})${flicker ? ".withFlicker()" : ""}${trail ? ".withTrail()" : ""}${fadingSpigot}.build());\n` +
      `meta.setPower(${flightPower});\n` +
      `firework.setItemMeta(meta);`;

    const hasRecipe =
      !(flicker && trail) &&
      primaryColors.length <= 6 &&
      fadingColors.length <= 6;

    setResults({ giveCmd, summonCmd, spigotCode, hasRecipe });

    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const imgBtnCls = (active: boolean) =>
    `flex flex-col items-center p-1 border-2 rounded-xl transition-colors cursor-pointer text-white font-bold ${
      active
        ? "bg-[#235AB4] border-[#235AB4]"
        : "border-[#626875] hover:border-[#8092AF]"
    }`;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-2 md:py-2 space-y-4 bg-transparent">

      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="bg-green-700/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            {t.message}
          </div>
        ))}
      </div>

      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222]">
        <CardContent className="py-6 px-4 sm:px-6 md:px-12 space-y-8">

          {/* Header */}
          <CardHeader className="p-0">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
              <p className="text-[#2B7FFF]">Gravel Host</p>
              <p>Firework Creator</p>
            </CardTitle>
            <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
              Design custom Minecraft fireworks with colors, shapes, and effects. Generate give and summon commands instantly.
            </CardDescription>
          </CardHeader>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 items-start">

            {/* ── Left: Controls ── */}
            <div className="space-y-6">

              {/* Color pickers */}
              <div className="space-y-6">
                <ColorPicker
                  label="Primary Colors"
                  subtitle="Firework particle colors (max 6)"
                  selected={primaryColors}
                  onToggle={(c) => toggleColor(c, primaryColors, setPrimaryColors)}
                />
                <ColorPicker
                  label="Fading Colors"
                  subtitle="Colors the explosion fades to (max 6)"
                  selected={fadingColors}
                  onToggle={(c) => toggleColor(c, fadingColors, setFadingColors)}
                />
              </div>

              {/* Explosion Shape */}
              <div>
                <p className="text-[#94A0B6] text-xs uppercase tracking-wide mb-3">Explosion Shape</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SHAPES.map((s) => (
                    <button key={s.shape} onClick={() => setShape(s.shape)} className={imgBtnCls(shape === s.shape)}>
                      <img src={`/fireworks/${s.img}.png`} alt={s.shape} className="w-full rounded-xl" style={{ imageRendering: "pixelated" }} />
                      <p className="py-1.5 font-normal text-sm">{s.shape}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Effect + Flight Duration side by side */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[#94A0B6] text-xs uppercase tracking-wide mb-3">Firework Effect</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EFFECTS.map((e) => {
                      const active = e.name === "Flicker" ? flicker : trail;
                      return (
                        <button
                          key={e.name}
                          onClick={() => e.name === "Flicker" ? setFlicker(!flicker) : setTrail(!trail)}
                          className={imgBtnCls(active)}
                        >
                          <img src={`/fireworks/${e.img}.png`} alt={e.name} className="w-full rounded-xl" style={{ imageRendering: "pixelated" }} />
                          <p className="py-1.5 font-normal text-sm">{e.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[#94A0B6] text-xs uppercase tracking-wide mb-3">Flight Duration</p>
                  <div className="grid grid-cols-3 gap-2">
                    {POWER_VALUES.map((p) => (
                      <button key={p.name} onClick={() => setFlightPower(p.level)} className={imgBtnCls(flightPower === p.level)}>
                        <img src={`/fireworks/${p.img}.png`} alt={p.name} className="w-full rounded-xl" style={{ imageRendering: "pixelated" }} />
                        <p className="py-1.5 font-normal text-sm">{p.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Validation errors */}
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300 space-y-1">
                  {errors.map((e) => <p key={e}>{e}</p>)}
                </div>
              )}

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                className="w-full bg-[#235AB4] hover:bg-[#235AB4]/90 text-white border-none ring-0 text-base h-10"
              >
                Generate
              </Button>
            </div>

            {/* ── Right: Results ── */}
            <div ref={resultsRef}>
              {results ? (
                <div className="space-y-4">
                  <OutputField label="Firework Give Command"   value={results.giveCmd}   onCopy={() => copyValue(results.giveCmd)} />
                  <OutputField label="Firework Summon Command" value={results.summonCmd}  onCopy={() => copyValue(results.summonCmd)} />
                  <OutputField label="Spigot API Code"         value={results.spigotCode} onCopy={() => copyValue(results.spigotCode)} multiline />

                  {/* Crafting recipe */}
                  <div className="pt-2">
                    <h3 className="text-base font-medium text-[#DBE9FE] mb-4">Crafting Recipe</h3>

                    {results.hasRecipe ? (
                      <div className="space-y-6">
                        <h4 className="text-sm font-medium text-[#A4BDDE]">Step 1: Firework Star</h4>
                        <CraftingTable>
                          <CraftItem tex={ITEM_TEX["Firework Star"]} alt="Firework Star" style={{ right: 76, top: 85 }} />
                          <CraftItem tex={ITEM_TEX["Gunpowder"]}     alt="Gunpowder"     style={{ left: 60,  top: 128 }} />
                          {shapeIngredient(shape) && (
                            <CraftItem tex={ITEM_TEX[shapeIngredient(shape)]} alt={shapeIngredient(shape)} style={{ left: 100, top: 128 }} />
                          )}
                          {flicker && <CraftItem tex={ITEM_TEX["Glowstone Dust"]} alt="Glowstone Dust" style={{ left: 138, top: 128 }} />}
                          {trail && !flicker && <CraftItem tex={ITEM_TEX["Diamond"]} alt="Diamond" style={{ left: 138, top: 128 }} />}
                          {primaryColors.map((color, i) => (
                            <CraftItem key={color} tex={ITEM_TEX[color]} alt={color} style={CRAFT_POSITIONS[i]} />
                          ))}
                        </CraftingTable>

                        {fadingColors.length > 0 && (
                          <>
                            <h4 className="text-sm font-medium text-[#A4BDDE]">Step 2: Fading Colors</h4>
                            <CraftingTable>
                              <CraftItem tex={ITEM_TEX["Firework Star"]} alt="Firework Star (output)" style={{ right: 76, top: 85 }} />
                              <CraftItem tex={ITEM_TEX["Firework Star"]} alt="Firework Star"          style={{ left: 60,  top: 128 }} />
                              {fadingColors.map((color, i) => (
                                <CraftItem key={color} tex={ITEM_TEX[color]} alt={color} style={CRAFT_POSITIONS[i]} />
                              ))}
                            </CraftingTable>
                          </>
                        )}

                        <h4 className="text-sm font-medium text-[#A4BDDE]">
                          Step {fadingColors.length ? 3 : 2}: Crafting the Rocket
                        </h4>
                        <CraftingTable>
                          <CraftItem tex={ITEM_TEX["Firework Star"]}   alt="Firework Star"   style={{ left: 60,  top: 85 }} />
                          <CraftItem tex={ITEM_TEX["Paper"]}           alt="Paper"           style={{ left: 100, top: 85 }} />
                          <CraftItem tex={ITEM_TEX["Gunpowder"]}       alt="Gunpowder"       style={{ left: 138, top: 85 }} />
                          <CraftItem tex={ITEM_TEX["Firework Rocket"]} alt="Firework Rocket" style={{ right: 76, top: 85 }} />
                          {flightPower > 1  && <CraftItem tex={ITEM_TEX["Gunpowder"]} alt="Gunpowder" style={{ left: 138, top: 40  }} />}
                          {flightPower === 3 && <CraftItem tex={ITEM_TEX["Gunpowder"]} alt="Gunpowder" style={{ left: 138, top: 128 }} />}
                        </CraftingTable>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        <strong>No crafting recipe available.</strong> Confirm that you have up to 6 primary colors, fewer than 7 fading colors, and less than 2 effects to view the vanilla recipe.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[200px] flex items-center justify-center rounded-xl border border-dashed border-[#222F45]">
                  <p className="text-[#94A0B6] text-sm">Configure your firework and click Generate</p>
                </div>
              )}
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ── ColorPicker ───────────────────────────────────────────────────────────────

interface ColorPickerProps {
  label:    string;
  subtitle: string;
  selected: string[];
  onToggle: (color: string) => void;
}

function ColorPicker({ label, subtitle, selected, onToggle }: ColorPickerProps) {
  return (
    <div>
      <p className="text-sm font-medium text-[#DBE9FE] mb-0.5">{label}</p>
      <p className="text-xs text-[#94A0B6] mb-3">{subtitle}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {DYES.map((dye) => {
          const active = selected.includes(dye.color);
          return (
            <button
              key={dye.color}
              onClick={() => onToggle(dye.color)}
              title={dye.color}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors text-xs ${
                active
                  ? "border-[#2B7FFF] bg-[#235AB4]/20 text-[#DBE9FE]"
                  : "border-[#222F45] hover:border-[#8092AF] text-[#94A0B6]"
              }`}
            >
              <img
                src={ITEM_TEX[dye.color]}
                alt={dye.color}
                className="w-5 h-5 shrink-0"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="truncate">{dye.color.replace(" Dye", "")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── CraftingTable + CraftItem ─────────────────────────────────────────────────

function CraftingTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <div className="relative w-[370px] h-[170px] mx-auto">
        <img
          src="/fireworks/crafting-table.png"
          alt="crafting table"
          className="absolute w-[370px] h-[170px]"
          style={{ imageRendering: "pixelated" }}
        />
        {children}
      </div>
    </div>
  );
}

interface CraftItemProps {
  tex:  string;
  alt:  string;
  style: { left?: number; right?: number; top: number };
}

function CraftItem({ tex, alt, style }: CraftItemProps) {
  return (
    <img
      src={tex}
      alt={alt}
      className="absolute w-[33px] h-[35px]"
      style={{
        left:  style.left  !== undefined ? style.left  : undefined,
        right: style.right !== undefined ? style.right : undefined,
        top:   style.top,
        imageRendering: "pixelated",
      }}
    />
  );
}

// ── OutputField ───────────────────────────────────────────────────────────────

interface OutputFieldProps {
  label:     string;
  value:     string;
  onCopy:    () => void;
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
            rows={5}
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
