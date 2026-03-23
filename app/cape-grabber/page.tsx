"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Check,
  Download,
  Info,
  Loader2,
  Search,
} from "lucide-react";

const BASE_URL =
  process.env.NEXT_PUBLIC_CAPE_GRABBER_URL ?? "http://localhost";

interface CapeData {
  hash: string;
  type: string;
  exists: boolean;
  playerName: string;
  frontImageUrl?: string;
  imageUrl?: string;
}

const TYPE_LABELS: Record<string, string> = {
  minecraft: "Minecraft",
  optifine: "Optifine",
  minecraftcapes: "MinecraftCapes",
  labymod: "LabyMod",
  "5zig": "5zig",
  tlauncher: "TLauncher",
};

function formatCapeType(type: string) {
  return type.replace(
    /\b(?:minecraft|optifine|minecraftcapes|labymod|5zig|tlauncher)\b/g,
    (match) => TYPE_LABELS[match] ?? match,
  );
}

export default function CapeGrabber() {
  const [searchValue, setSearchValue] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [noCapes, setNoCapes] = useState(false);
  const [capes, setCapes] = useState<CapeData[]>([]);
  const [copied, setCopied] = useState(false);

  const shareableLink = currentSearch
    ? `${BASE_URL}/cape-grabber#ign=${currentSearch}`
    : "";

  const fetchCapes = useCallback(
    async (username: string) => {
      if (!username || username.length > 16) return;
      if (!/^[a-zA-Z0-9_]+$/.test(username)) return;
      if (username === currentSearch) return;

      setLoading(true);
      setNoCapes(false);
      setCapes([]);
      setCurrentSearch(username);

      try {
        const res = await fetch(
          `https://api.capes.dev/load/${encodeURIComponent(username)}`,
        );

        if (!res.ok) {
          setNoCapes(true);
          setLoading(false);
          return;
        }

        const json = await res.json();
        const list: CapeData[] = Array.isArray(json)
          ? json
          : Object.values(json);

        const hasAnyCape = list.some(
          (cape) => cape.exists && cape.frontImageUrl,
        );
        setNoCapes(!hasAnyCape);
        setCapes(list);
      } catch {
        setNoCapes(true);
      }

      setLoading(false);
    },
    [currentSearch],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const ign = params.get("ign");

    if (ign) {
      setSearchValue(ign);
      fetchCapes(ign);
    } else {
      setSearchValue("Notch");
      fetchCapes("Notch");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchCapes(searchValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " ") e.preventDefault();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCape = async (imageUrl: string) => {
    const blob = await fetch(imageUrl).then((res) => res.blob());
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cape-download.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const buttonBase =
    "cursor-pointer transition-colors border-none ring-0 text-white";
  const buttonStyle = "bg-[#235AB4] hover:bg-[#235AB4]/90";

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-2 md:py-2 space-y-4 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222]">
        <CardContent className="py-6 px-4 sm:px-6 md:px-12">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
              <p className="text-[#2B7FFF]">Gravel Host</p>
              <p>Cape Grabber</p>
            </CardTitle>
            <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
              Search for a Minecraft player to view and download their capes.
            </CardDescription>
          </CardHeader>

          {/* Search bar */}
          <div className="flex gap-2 sm:gap-3">
            <input
              className="flex-1 min-w-0 rounded-lg bg-[#141517] text-[#DBE9FE] placeholder-[#8092AF] px-3 sm:px-4 py-2 text-base border border-[#222F45] outline-none focus:border-[#235AB4] transition-colors"
              maxLength={16}
              type="text"
              placeholder="Enter username..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyPress}
            />
            <Button
              className={`${buttonBase} ${buttonStyle} px-3 sm:px-6`}
              onClick={() => fetchCapes(searchValue)}
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>

          {/* Cape display area */}
          <div className="flex flex-col items-center mt-6 min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
                <Loader2 className="size-10 animate-spin text-[#2B7FFF]" />
              </div>
            ) : noCapes ? (
              <p className="mt-10 text-[#F55050] text-xl sm:text-2xl text-center">
                There are no capes associated with this account.
              </p>
            ) : (
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-4">
                {capes
                  .filter((cape) => cape.exists && cape.frontImageUrl)
                  .map((cape) => (
                    <div
                      key={cape.hash}
                      className="flex flex-col items-center justify-center"
                    >
                      <h3 className="font-medium text-white text-lg sm:text-xl mb-4 text-center">
                        {formatCapeType(cape.type)}
                      </h3>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="h-56 sm:h-80 w-auto"
                        style={{
                          imageRendering: "pixelated",
                        }}
                        src={cape.frontImageUrl}
                        alt={`${cape.playerName}'s ${cape.type} cape`}
                      />
                      <Button
                        className={`${buttonBase} ${buttonStyle} mt-4`}
                        onClick={() =>
                          cape.imageUrl && downloadCape(cape.imageUrl)
                        }
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Shareable link */}
          {!loading && currentSearch && (
            <div className="flex flex-col mt-6 sm:mt-8 items-center">
              <h3 className="font-medium text-white text-base sm:text-lg text-center">
                Shareable Link
              </h3>
              <div className="flex gap-2 sm:gap-3 mt-2 w-full max-w-md">
                <input
                  disabled
                  value={shareableLink}
                  className="flex-1 min-w-0 text-xs sm:text-sm text-gray-400 font-mono rounded-md p-2 bg-[#141517] h-[35px] border border-[#222F45] truncate"
                />
                <Button
                  onClick={copyLink}
                  className={`${buttonBase} ${buttonStyle} text-sm px-3 h-[35px] shrink-0`}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          Capes are fetched from multiple sources including Mojang, Optifine,
          and MinecraftCapes. Some capes may not be available for all accounts.
        </AlertDescription>
      </Alert>
    </div>
  );
}
