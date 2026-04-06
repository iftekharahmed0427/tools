"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Search } from "lucide-react";
import Image from "next/image";

interface MotdNode {
  color?: string;
  text?: string;
  bold?: boolean;
  extra?: (MotdNode | string)[];
}

interface ServerStatus {
  status: string;
  online: boolean;
  motd: string;
  motd_json: string | MotdNode;
  players: { now: number; max: number };
  favicon: string;
}

function flattenMotdNode(node: MotdNode | string): string {
  if (typeof node === "string") return node;
  let result = "";
  if (node.bold) result += "§l";
  if (node.color) result += `%${node.color}%`;
  result += node.text ?? "";
  if (node.extra) result += node.extra.map(flattenMotdNode).join("");
  return result;
}

function formatMOTD(text: string): string {
  // Section sign color codes
  const sectionColors: Record<string, string> = {
    "§0": "#000000", "§1": "#0000AA", "§2": "#00AA00", "§3": "#00AAAA",
    "§4": "#AA0000", "§5": "#AA00AA", "§6": "#FFAA00", "§7": "#AAAAAA",
    "§8": "#555555", "§9": "#5555FF", "§a": "#55FF55", "§b": "#55FFFF",
    "§c": "#FF5555", "§d": "#FF55FF", "§e": "#FFFF55", "§f": "#FFFFFF",
  };

  // Named color codes
  const namedColors: Record<string, string> = {
    black: "#000000", dark_blue: "#0000AA", dark_green: "#00AA00",
    dark_aqua: "#00AAAA", dark_red: "#AA0000", dark_purple: "#AA00AA",
    gold: "#FFAA00", gray: "#AAAAAA", dark_gray: "#555555", blue: "#5555FF",
    green: "#55FF55", aqua: "#55FFFF", red: "#FF5555", light_purple: "#FF55FF",
    yellow: "#FFFF55", white: "#FFFFFF",
  };

  for (const [code, color] of Object.entries(sectionColors)) {
    text = text.replaceAll(code, `<span style="color: ${color}">`);
  }

  for (const [name, color] of Object.entries(namedColors)) {
    text = text.replaceAll(`%${name}%`, `<span style="color: ${color}">`);
  }

  text = text.replace(/\n/g, "<br>");

  // Hex color codes
  text = text.replace(/§#([A-Fa-f0-9]{6})/g, (_, c) => `<span style="color: #${c}">`);
  text = text.replace(/%#([A-Fa-f0-9]{6})%/g, (_, c) => `<span style="color: #${c}">`);

  // Formatting codes
  text = text.replace(/§k/g, '<span style="font-weight: bold">');
  text = text.replace(/§l/g, '<span style="font-weight: bold">');
  text = text.replace(/§m/g, '<span style="text-decoration: line-through">');
  text = text.replace(/§n/g, '<span style="text-decoration: underline">');
  text = text.replace(/§o/g, '<span style="font-style: italic">');
  text = text.replace(/§r/g, '<span style="color: #AAAAAA">');

  return '<span style="color: #AAAAAA">' + text;
}

function getInitialServer(): string {
  if (typeof window === "undefined") return "";
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  return params.get("ip") ?? "";
}

export default function ServerInfo() {
  const [searchValue, setSearchValue] = useState(getInitialServer);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const initialFetchDone = useRef(false);

  const fetchServerStatus = useCallback(async (ip: string) => {
    if (!ip) return;
    setLoading(true);
    try {
      const response = await fetch(`https://mcapi.us/server/status?ip=${ip}`);
      const data: ServerStatus = await response.json();

      if (data.status !== "error") {
        const motdJson = data.motd_json;
        data.motd_json = formatMOTD(
          typeof motdJson === "string" ? motdJson : flattenMotdNode(motdJson)
        );
      }

      setStatus(data);
    } catch (error) {
      console.error("Error fetching server status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on first render if URL had an ip param
  if (!initialFetchDone.current && searchValue) {
    initialFetchDone.current = true;
    fetchServerStatus(searchValue);
  }

  const handleInput = (value: string) => {
    setSearchValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") e.preventDefault();
    if (e.key === "Enter") fetchServerStatus(searchValue);
  };

  const isOnline = status && status.status !== "error";

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-2 md:py-2 space-y-4 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222] calculator-card">
        <CardContent className="py-4 px-4 sm:px-6 md:px-12">
          <div className="space-y-6 md:space-y-8">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE] text-center">
                <p>
                  <span className="text-[#2B7FFF]">Gravel Host</span> Server Status
                </p>
              </CardTitle>
              <CardDescription className="text-[#A4BDDE] text-base md:text-lg text-center">
                Look up any Minecraft server to see its status, MOTD, player count, and icon.
              </CardDescription>
            </CardHeader>

            {/* Search input */}
            <div className="flex justify-center">
              <div className="flex gap-2 w-full max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8092AF] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter server address..."
                    value={searchValue}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#141517] text-[#DBE9FE] border border-[#222F45] focus:border-[#235AB4] focus:outline-none placeholder-[#8092AF] text-sm sm:text-base transition-colors"
                  />
                </div>
                <Button
                  onClick={() => fetchServerStatus(searchValue)}
                  disabled={!searchValue || loading}
                  className="shrink-0 bg-[#235AB4] hover:bg-[#235AB4]/90 border-none ring-0 cursor-pointer text-sm sm:text-base px-4 h-[42px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            {/* Server preview */}
            <div className="flex justify-center">
              <div
                className="relative w-full max-w-[650px] mx-auto"
                style={
                  {
                    "--preview-w": "min(650px, calc(100vw - 2rem))",
                  } as React.CSSProperties
                }
              >
                <div
                  className="relative w-full bg-repeat p-3 sm:p-4 flex box-border rounded-md overflow-hidden"
                  style={{
                    backgroundImage: "url('/minecraft-background.png')",
                    backgroundSize: "calc(min(650px, 100%) * 80 / 642)",
                  }}
                >
                  {/* Favicon */}
                  <div className="relative mr-2 sm:mr-3 shrink-0">
                    <Image
                      src={isOnline && status.favicon ? status.favicon : "/unknown_server.jpg"}
                      alt="Server Favicon"
                      width={64}
                      height={64}
                      className="w-12 h-12 sm:w-16 sm:h-16"
                      unoptimized
                    />
                  </div>

                  {/* Server info */}
                  <div className="flex-1 min-w-0 font-minecraft text-[14px] sm:text-[19px] leading-[1.3] text-white overflow-hidden">
                    {/* Server name + player count row */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="truncate">
                        {searchValue || "Minecraft Server"}
                      </span>
                      <span className="shrink-0 text-[#AAAAAA]">
                        {isOnline
                          ? `${status.players.now}/${status.players.max}`
                          : "0/0"}
                      </span>
                    </div>

                    {/* MOTD */}
                    <div className="mt-1.5 text-[12px] sm:text-[19px] leading-[1.3] whitespace-pre-wrap break-words">
                      {isOnline ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: typeof status.motd_json === "string" ? status.motd_json : "",
                          }}
                        />
                      ) : (
                        <span style={{ color: "#AA0000" }}>
                          {status ? "Can't connect to server" : "Enter a server address above"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      <Alert className="calculator-info-bar rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          Server data is fetched in real-time. Some servers may block status queries or take a moment to respond.
        </AlertDescription>
      </Alert>
    </div>
  );
}
