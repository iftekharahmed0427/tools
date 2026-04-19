"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Boxes, Info, Layers, Leaf } from "lucide-react";

// ~$0.74/GB derived from tier pricing with ~$0.10/GB NVMe subtracted
const PRICE_PER_GB = 0.74;

type ModLevel = "vanilla" | "light" | "heavy";

const MAPS = {
  "the-island":     { label: "The Island",     vanilla: 8,  light: 10, heavy: 12 },
  "the-center":     { label: "The Center",     vanilla: 8,  light: 10, heavy: 12 },
  "scorched-earth": { label: "Scorched Earth", vanilla: 8,  light: 10, heavy: 12 },
  aberration:       { label: "Aberration",     vanilla: 8,  light: 10, heavy: 12 },
  extinction:       { label: "Extinction",     vanilla: 10, light: 12, heavy: 15 },
  ragnarok:         { label: "Ragnarok",       vanilla: 10, light: 12, heavy: 15 },
  valguero:         { label: "Valguero",       vanilla: 10, light: 12, heavy: 15 },
  "lost-colony":    { label: "Lost Colony",    vanilla: 13, light: 15, heavy: 18 },
  astraeos:         { label: "Astraeos",       vanilla: 13, light: 15, heavy: 18 },
} as const;
type MapKey = keyof typeof MAPS;

const PLAYER_MIN = 1;
const PLAYER_MAX = 100;
const PLAYER_THRESHOLD = 10;
const RAM_PER_EXTRA_PLAYER = 0.5;

export default function ArkEvolvedRamCalculator() {
  const [map, setMap] = useState<MapKey>("the-island");
  const [modLevel, setModLevel] = useState<ModLevel>("vanilla");
  const [players, setPlayers] = useState([10]);

  const playerCount = players[0];
  const baseRam = MAPS[map][modLevel];
  const extraRam = Math.max(0, playerCount - PLAYER_THRESHOLD) * RAM_PER_EXTRA_PLAYER;
  const recommendedRam = Math.ceil(baseRam + extraRam);
  const price = (recommendedRam * PRICE_PER_GB).toFixed(2);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-2 md:py-2 space-y-4 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222] calculator-card">
        <CardContent className="py-4 px-4 sm:px-6 md:px-12">
          <div className="grid gap-6 md:gap-12 md:grid-cols-2">
            <div className="space-y-3 sm:space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
                  <p className="text-[#2B7FFF]">Gravel Host</p>
                  <p>ARK: Survival Evolved</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#A4BDDE]">RAM Calculator</p>
                </CardTitle>
                <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
                  Select your map, mod level, and player count to get a recommended RAM amount and estimated price.
                </CardDescription>
              </CardHeader>
              <div className="space-y-1 text-[#DBE9FE]">
                <p className="text-sm text-[#94A0B6]">Estimated price</p>
                <p className="text-3xl sm:text-4xl font-semibold">
                  <span className="text-[#949FB2]">$</span>{price}
                  <span className="text-sm font-normal text-[#94A0B6]">/mo</span>
                </p>
              </div>
              <div className="space-y-1 text-[#DBE9FE]">
                <p className="text-sm text-[#94A0B6]">Recommended RAM</p>
                <p className="text-2xl sm:text-3xl font-semibold">
                  {recommendedRam}
                  <span className="text-sm font-normal text-[#94A0B6]"> GB</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-start gap-4 sm:gap-5">
              <div className="space-y-2">
                <span className="text-[#EFF6FF] text-2xl sm:text-3xl font-bold">Map</span>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value as MapKey)}
                  className="w-full bg-[#36446B] text-[#DBE9FE] border-none rounded-lg h-10 sm:h-12 px-3 text-base sm:text-lg cursor-pointer outline-none"
                >
                  {Object.entries(MAPS).map(([key, { label }]) => (
                    <option key={key} value={key} className="bg-[#1A2438]">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-[#EFF6FF] text-2xl sm:text-3xl font-bold">Mod Level</span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    className={`w-full text-white border-none ring-0 cursor-pointer text-base sm:text-lg h-10 transition-colors ${modLevel === "vanilla" ? "bg-[#1D58B4] hover:bg-[#1D58B4]/90" : "bg-[#36446B] hover:bg-[#36446B]/80"}`}
                    onClick={() => setModLevel("vanilla")}
                  >
                    <Leaf className="size-4 sm:size-5" />
                    Vanilla
                  </Button>
                  <Button
                    className={`w-full text-white border-none ring-0 cursor-pointer text-base sm:text-lg h-10 transition-colors ${modLevel === "light" ? "bg-[#1D58B4] hover:bg-[#1D58B4]/90" : "bg-[#36446B] hover:bg-[#36446B]/80"}`}
                    onClick={() => setModLevel("light")}
                  >
                    <Layers className="size-4 sm:size-5" />
                    Light
                  </Button>
                  <Button
                    className={`w-full text-white border-none ring-0 cursor-pointer text-base sm:text-lg h-10 transition-colors ${modLevel === "heavy" ? "bg-[#1D58B4] hover:bg-[#1D58B4]/90" : "bg-[#36446B] hover:bg-[#36446B]/80"}`}
                    onClick={() => setModLevel("heavy")}
                  >
                    <Boxes className="size-4 sm:size-5" />
                    Heavy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#EFF6FF] text-2xl sm:text-3xl font-bold">Players:</span>
                  <span className="text-[#2B7FFF] text-2xl sm:text-3xl font-bold">{playerCount}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <span className="text-sm sm:text-lg text-[#8092AF] shrink-0">{PLAYER_MIN}</span>
                  <Slider
                    value={players}
                    onValueChange={setPlayers}
                    min={PLAYER_MIN}
                    max={PLAYER_MAX}
                    step={1}
                    thumbLabel={`${playerCount}`}
                    className="flex-1 min-w-0"
                    trackClassName="bg-[#222F45] data-[orientation=horizontal]:h-[16px]"
                    rangeClassName="bg-[#235AB4]"
                  />
                  <span className="text-sm sm:text-lg text-[#8092AF] shrink-0">{PLAYER_MAX}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="calculator-info-bar rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          RAM estimates are based on consistent server startup needs. Actual usage may increase over time with player activity, builds, and tamed dinos. +0.5 GB is added per player above 10.
        </AlertDescription>
      </Alert>
    </div>
  );
}
