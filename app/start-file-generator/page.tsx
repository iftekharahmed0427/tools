"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy, Download, Info, Monitor, RotateCcw } from "lucide-react";

type Flags = "none" | "aikar" | "aikarex" | "proxy";
type Platform = "windows" | "linux";

const FLAG_OPTIONS: { value: Flags; label: string }[] = [
  { value: "none", label: "None" },
  { value: "aikar", label: "Aikar's Flags" },
  { value: "aikarex", label: "Aikar's Flags (12GB+)" },
  { value: "proxy", label: "Proxy Flags" },
];

function getFlags(flags: Flags, ramFormatted: string): string {
  switch (flags) {
    case "aikar":
      return ` -Xms${ramFormatted} -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Daikars.new.flags=true -Dusing.aikars.flags=https://mcutils.com`;
    case "aikarex":
      return ` -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=40 -XX:G1MaxNewSizePercent=50 -XX:G1HeapRegionSize=16M -XX:G1ReservePercent=15 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=20 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Daikars.new.flags=true -Dusing.aikars.flags=https://mcutils.com`;
    case "proxy":
      return ` -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -XX:MaxInlineLevel=15`;
    default:
      return "";
  }
}

function buildCommand(
  serverJarName: string,
  ram: string,
  flags: Flags,
  gui: boolean,
  autoRestart: boolean,
  platform: Platform
): string {
  const ramFormatted = ram.replace("GB", "G");
  const flagStr = getFlags(flags, ramFormatted);
  const guiStr = gui || flags === "proxy" ? "" : " --nogui";
  const base = `java -Xmx${ramFormatted}${flagStr} -jar ${serverJarName}${guiStr}`;

  if (platform === "windows") {
    if (autoRestart) {
      return `:start\n${base}\n\necho Server restarting...\ngoto :start`;
    }
    return base;
  }

  if (autoRestart) {
    return `#!/bin/bash\n\nwhile [ true ]; do\n    ${base}\n\n    echo Server restarting...\ndone`;
  }
  return `#!/bin/bash\n\n${base}`;
}

export default function StartFileGenerator() {
  const [serverJarName, setServerJarName] = useState("server.jar");
  const [ram, setRam] = useState("8GB");
  const [flags, setFlags] = useState<Flags>("aikar");
  const [gui, setGui] = useState(false);
  const [autoRestart, setAutoRestart] = useState(false);
  const [platform, setPlatform] = useState<Platform>("windows");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ramParam = params.get("ram");
    if (ramParam) setRam(ramParam);
  }, []);

  const result = useMemo(
    () => buildCommand(serverJarName, ram, flags, gui, autoRestart, platform),
    [serverJarName, ram, flags, gui, autoRestart, platform]
  );

  const updateRam = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3) val = val.slice(0, 3);
    setRam(val + "GB");
  }, []);

  const copyValue = useCallback(() => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result]);

  const downloadFile = useCallback(() => {
    const blob = new Blob([result], { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = platform === "windows" ? "start.bat" : "start.sh";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [result, platform]);

  const isProxy = flags === "proxy";

  const tabBase =
    "text-base sm:text-lg h-10 px-5 rounded-lg cursor-pointer transition-colors border-none ring-0";
  const tabActive = "bg-[#235AB4] hover:bg-[#235AB4]/90";
  const tabInactive = "bg-[#36446B] hover:bg-[#36446B]/80";

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-2 space-y-3 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222]">
        <CardContent className="py-4 pb-6 px-4 sm:px-6 md:px-12">
          <div className="grid gap-6 md:gap-12 md:grid-cols-2">
            {/* Left column — title & inputs */}
            <div className="space-y-3 sm:space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
                  <p className="text-[#2B7FFF]">Start File</p>
                  <p>Generator</p>
                </CardTitle>
                <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
                  Generate a start script for your Minecraft server with
                  optimized JVM flags.
                </CardDescription>
              </CardHeader>

              {/* Server Jar Name */}
              <div className="space-y-1">
                <label className="text-sm text-[#94A0B6]">Server Jar Name</label>
                <input
                  value={serverJarName}
                  onChange={(e) => setServerJarName(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-sm text-white bg-[#36446B] border-none outline-none focus:ring-0 focus:outline-none"
                />
              </div>

              {/* RAM */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-[#94A0B6]">RAM</label>
                  <a
                    href="https://gravelhost.com/minecraft-ram-calculator"
                    className="text-xs text-[#2B7FFF] hover:text-[#2B7FFF]/80 transition-colors"
                  >
                    Need help? Use our RAM Calculator →
                  </a>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ram}
                  onChange={updateRam}
                  className="w-full rounded-md px-3 py-2 text-sm text-white bg-[#36446B] border-none outline-none focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Flags */}
              <div className="space-y-1">
                <label className="text-sm text-[#94A0B6]">Flags</label>
                <select
                  value={flags}
                  onChange={(e) => setFlags(e.target.value as Flags)}
                  className="w-full rounded-md px-3 py-2 text-sm text-white bg-[#36446B] border-none outline-none focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {FLAG_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#36446B]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gui}
                    disabled={isProxy}
                    onClick={() => { if (!isProxy) setGui(!gui); }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${gui ? "bg-[#235AB4]" : "bg-[#374151]"} ${isProxy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${gui ? "translate-x-5" : ""}`} />
                  </button>
                  <span className="text-sm text-[#A4BDDE]" title="Starts an inbuilt GUI control panel as well as the console.">
                    <Monitor className="inline size-4 mr-1 mb-0.5" />
                    Additional GUI
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoRestart}
                    onClick={() => setAutoRestart(!autoRestart)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${autoRestart ? "bg-[#235AB4]" : "bg-[#374151]"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${autoRestart ? "translate-x-5" : ""}`} />
                  </button>
                  <span className="text-sm text-[#A4BDDE]" title="Restarts the server after it has crashed or stopped.">
                    <RotateCcw className="inline size-4 mr-1 mb-0.5" />
                    Auto-restart
                  </span>
                </label>
              </div>
            </div>

            {/* Right column — result */}
            <div className="flex flex-col justify-start">
              <p className="text-lg sm:text-xl md:text-2xl text-[#8095B2] mb-3">
                Generated <span className="text-[#2B7FFF]">Start Script</span>
              </p>

              {/* Platform tabs */}
              <div className="flex gap-2 mb-3">
                <Button
                  className={`${tabBase} ${platform === "windows" ? tabActive : tabInactive}`}
                  onClick={() => setPlatform("windows")}
                >
                  Windows
                </Button>
                <Button
                  className={`${tabBase} ${platform === "linux" ? tabActive : tabInactive}`}
                  onClick={() => setPlatform("linux")}
                >
                  Linux/MacOS
                </Button>
              </div>

              {/* Code output */}
              <code className="block w-full text-sm text-[#A4BDDE] font-mono rounded-md p-3 bg-[#141517] whitespace-pre-wrap break-all min-h-[120px]">
                {result}
              </code>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  className="flex-1 text-base sm:text-lg h-10 sm:h-12 rounded-lg cursor-pointer transition-colors bg-[#235AB4] hover:bg-[#235AB4]/90 border-none ring-0"
                  onClick={copyValue}
                >
                  {copied ? <Check className="size-4 sm:size-5" /> : <Copy className="size-4 sm:size-5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  className="flex-1 text-base sm:text-lg h-10 sm:h-12 rounded-lg cursor-pointer transition-colors bg-[#36446B] hover:bg-[#36446B]/80 border-none ring-0"
                  onClick={downloadFile}
                >
                  <Download className="size-4 sm:size-5" />
                  Download {platform === "windows" ? "start.bat" : "start.sh"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Alert className="rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          Aikar&apos;s flags are recommended for most servers. Use the 12GB+
          variant if your server has 12 GB or more of RAM. Proxy flags are for
          BungeeCord/Velocity.
        </AlertDescription>
      </Alert>
    </div>
  );
}
