"use client";

import { useCallback, useMemo, useState } from "react";
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
  Download,
  Info,
  RotateCcw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Property definitions                                               */
/* ------------------------------------------------------------------ */

interface BoolProp {
  type: "boolean";
  default: boolean;
  description: string;
}

interface NumberProp {
  type: "number";
  default: number;
  min?: number;
  max?: number;
  description: string;
}

interface StringProp {
  type: "string";
  default: string;
  description: string;
}

interface SelectProp {
  type: "select";
  default: string;
  options: { value: string; label: string }[];
  description: string;
}

type PropDef = BoolProp | NumberProp | StringProp | SelectProp;

interface Section {
  title: string;
  props: Record<string, PropDef>;
}

const SECTIONS: Section[] = [
  {
    title: "General",
    props: {
      motd: { type: "string", default: "A Minecraft Server", description: "Message displayed in the server list below the name. Supports color codes." },
      difficulty: { type: "select", default: "easy", options: [{ value: "peaceful", label: "Peaceful" }, { value: "easy", label: "Easy" }, { value: "normal", label: "Normal" }, { value: "hard", label: "Hard" }], description: "Server difficulty affecting mob damage, hunger, and poison." },
      gamemode: { type: "select", default: "survival", options: [{ value: "survival", label: "Survival" }, { value: "creative", label: "Creative" }, { value: "adventure", label: "Adventure" }, { value: "spectator", label: "Spectator" }], description: "Default game mode for players." },
      hardcore: { type: "boolean", default: false, description: "Enable hardcore mode (players are banned on death)." },
      "force-gamemode": { type: "boolean", default: false, description: "Force players into the default game mode on join." },
      "max-players": { type: "number", default: 20, min: 0, max: 2147483647, description: "Maximum players allowed at the same time." },
      "online-mode": { type: "boolean", default: true, description: "Verify players with Mojang's authentication servers." },
      "white-list": { type: "boolean", default: false, description: "Enable the server whitelist." },
      "enforce-whitelist": { type: "boolean", default: false, description: "Kick non-whitelisted players when the whitelist is reloaded." },
      "op-permission-level": { type: "number", default: 4, min: 0, max: 4, description: "Default permission level for ops (0-4)." },
      "function-permission-level": { type: "number", default: 2, min: 1, max: 4, description: "Default permission level for functions (1-4)." },
      "player-idle-timeout": { type: "number", default: 0, min: 0, description: "Minutes before idle players are kicked. 0 disables." },
      "pause-when-empty-seconds": { type: "number", default: 60, min: 0, description: "Seconds with no players before the server pauses." },
      "spawn-protection": { type: "number", default: 16, min: 0, description: "Spawn protection radius. 0 disables." },
      "allow-flight": { type: "boolean", default: false, description: "Allow flight in Survival mode via mods." },
      "enforce-secure-profile": { type: "boolean", default: true, description: "Only allow players with Mojang-signed public keys." },
      "accepts-transfers": { type: "boolean", default: false, description: "Accept incoming transfers via transfer packets." },
    },
  },
  {
    title: "World",
    props: {
      "level-name": { type: "string", default: "world", description: "World directory name/path." },
      "level-seed": { type: "string", default: "", description: "World seed. Random if blank." },
      "level-type": { type: "select", default: "minecraft\\:normal", options: [{ value: "minecraft\\:normal", label: "Normal" }, { value: "minecraft\\:flat", label: "Flat" }, { value: "minecraft\\:large_biomes", label: "Large Biomes" }, { value: "minecraft\\:amplified", label: "Amplified" }, { value: "minecraft\\:single_biome_surface", label: "Single Biome" }], description: "World generation preset." },
      "generate-structures": { type: "boolean", default: true, description: "Generate structures (villages, temples, etc.)." },
      "generator-settings": { type: "string", default: "{}", description: "Custom world generation settings (JSON). Used with Flat/Single Biome." },
      "max-world-size": { type: "number", default: 29999984, min: 1, max: 29999984, description: "World border distance from center in blocks." },
      "view-distance": { type: "number", default: 10, min: 3, max: 32, description: "Server-side view distance in chunks." },
      "simulation-distance": { type: "number", default: 10, min: 3, max: 32, description: "Entity update distance in chunks." },
      "entity-broadcast-range-percentage": { type: "number", default: 100, min: 10, max: 1000, description: "Entity render distance as a percentage." },
      "initial-enabled-packs": { type: "string", default: "vanilla", description: "Datapacks enabled on world creation (comma-separated)." },
      "initial-disabled-packs": { type: "string", default: "", description: "Datapacks disabled on world creation (comma-separated)." },
    },
  },
  {
    title: "Network",
    props: {
      "server-ip": { type: "string", default: "", description: "IP to bind to. Leave blank to listen on all IPs." },
      "server-port": { type: "number", default: 25565, min: 1, max: 65534, description: "TCP port the server listens on." },
      "network-compression-threshold": { type: "number", default: 256, min: -1, description: "Packet size (bytes) before compression. -1 disables, 0 compresses all." },
      "rate-limit": { type: "number", default: 0, min: 0, description: "Max packets per player before kick. 0 disables." },
      "max-tick-time": { type: "number", default: 60000, min: -1, description: "Max ms for a single tick before watchdog stops the server. -1 disables." },
      "max-chained-neighbor-updates": { type: "number", default: 1000000, description: "Limit of consecutive neighbor updates. Negative disables." },
      "use-native-transport": { type: "boolean", default: true, description: "Use optimized packet handling on Linux." },
      "sync-chunk-writes": { type: "boolean", default: true, description: "Synchronous chunk writes to prevent data loss." },
      "prevent-proxy-connections": { type: "boolean", default: false, description: "Kick players if ISP differs from Mojang auth." },
      "region-file-compression": { type: "select", default: "deflate", options: [{ value: "deflate", label: "Deflate" }, { value: "lz4", label: "LZ4" }, { value: "none", label: "None" }], description: "Chunk compression algorithm." },
    },
  },
  {
    title: "Status & Query",
    props: {
      "enable-status": { type: "boolean", default: true, description: "Show server as online in the server list." },
      "hide-online-players": { type: "boolean", default: false, description: "Hide player list from status requests." },
      "enable-query": { type: "boolean", default: false, description: "Enable GameSpy4 query protocol." },
      "query.port": { type: "number", default: 25565, min: 1, max: 65534, description: "UDP port for query." },
      "log-ips": { type: "boolean", default: true, description: "Show client IPs in server log." },
      "broadcast-console-to-ops": { type: "boolean", default: true, description: "Send console outputs to online ops." },
    },
  },
  {
    title: "RCON",
    props: {
      "enable-rcon": { type: "boolean", default: false, description: "Enable remote console access." },
      "rcon.port": { type: "number", default: 25575, min: 1, max: 65534, description: "TCP port for RCON." },
      "rcon.password": { type: "string", default: "", description: "RCON password. Blank disables RCON even if enabled." },
      "broadcast-rcon-to-ops": { type: "boolean", default: true, description: "Send RCON command outputs to online ops." },
    },
  },
  {
    title: "Resource Pack",
    props: {
      "resource-pack": { type: "string", default: "", description: "Resource pack download URL (max 250 MiB)." },
      "resource-pack-id": { type: "string", default: "", description: "Optional UUID for the resource pack." },
      "resource-pack-sha1": { type: "string", default: "", description: "SHA-1 hash of the resource pack for integrity verification." },
      "resource-pack-prompt": { type: "string", default: "", description: "Custom message shown on resource pack prompt." },
      "require-resource-pack": { type: "boolean", default: false, description: "Disconnect players who decline the resource pack." },
    },
  },
  {
    title: "Management Server",
    props: {
      "management-server-enabled": { type: "boolean", default: false, description: "Enable the Minecraft Server Management Protocol." },
      "management-server-host": { type: "string", default: "localhost", description: "Host for the management protocol." },
      "management-server-port": { type: "number", default: 0, min: 0, max: 65534, description: "Port for the management protocol." },
      "management-server-secret": { type: "string", default: "", description: "40-char alphanumeric secret. Auto-generated if blank." },
      "management-server-allowed-origins": { type: "string", default: "", description: "Allowed origins for the management server." },
      "management-server-tls-enabled": { type: "boolean", default: true, description: "Use TLS for the management protocol." },
      "management-server-tls-keystore": { type: "string", default: "", description: "Path to the TLS keystore file." },
      "management-server-tls-keystore-password": { type: "string", default: "", description: "Password for the TLS keystore." },
      "status-heartbeat-interval": { type: "number", default: 0, min: 0, description: "Heartbeat interval in seconds. 0 disables." },
    },
  },
  {
    title: "Miscellaneous",
    props: {
      "enable-jmx-monitoring": { type: "boolean", default: false, description: "Expose JMX MBean for tick time monitoring." },
      "enable-code-of-conduct": { type: "boolean", default: false, description: "Look for code of conduct files in codeofconduct subfolder." },
      "bug-report-link": { type: "string", default: "", description: "URL for the report_bug server link." },
      "text-filtering-config": { type: "string", default: "", description: "Chat filtering configuration (used by Realms)." },
      "text-filtering-version": { type: "number", default: 0, min: 0, max: 1, description: "Text filtering config format version (0 or 1)." },
    },
  },
];

/* Collect all property keys in order for output */
const ALL_KEYS = SECTIONS.flatMap((s) => Object.keys(s.props));

/* Build default values map */
function getDefaults(): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {};
  for (const section of SECTIONS) {
    for (const [key, def] of Object.entries(section.props)) {
      defaults[key] = def.default;
    }
  }
  return defaults;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ServerPropertiesGenerator() {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(getDefaults);
  const setValue = useCallback((key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => {
    setValues(getDefaults());
  }, []);

  const output = useMemo(() => {
    const lines = [
      "#Minecraft server properties",
      `#Generated by GravelHost Tools`,
    ];
    for (const key of ALL_KEYS) {
      const val = values[key];
      lines.push(`${key}=${val === true ? "true" : val === false ? "false" : val}`);
    }
    return lines.join("\n");
  }, [values]);

  const downloadFile = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "server.properties";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [output]);

  const inputClass =
    "w-full rounded-md px-3 py-2 text-sm text-white bg-[#36446B] border-none outline-none focus:ring-0 focus:outline-none";

  const labelClass = "text-sm sm:text-base text-[#94A0B6]";

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-2 space-y-3 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222]">
        <CardContent className="py-4 pb-6 px-4 sm:px-6 md:px-12">
          <div className="space-y-4">
            {/* Header */}
            <CardHeader className="p-0 text-center">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
                <p>
                  <span className="text-[#2B7FFF]">Server Properties</span> Generator
                </p>
              </CardTitle>
              <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
                Configure your Minecraft server.properties file with all
                available options, then download.
              </CardDescription>
            </CardHeader>

            {/* Reset */}
            <div className="flex justify-center">
              <Button
                onClick={resetAll}
                className="text-sm h-9 rounded-lg cursor-pointer transition-colors bg-[#36446B] hover:bg-[#36446B]/80 border-none ring-0"
              >
                <RotateCcw className="size-4 mr-1" />
                Reset to Defaults
              </Button>
            </div>

            {/* All properties flat — two columns on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {SECTIONS.map((section) => (
                <div key={section.title} className="md:col-span-2 mt-2 first:mt-0">
                  <p className="text-[#2B7FFF] font-semibold text-sm sm:text-base mb-2">
                    {section.title}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {Object.entries(section.props).map(([key, def]) => (
                      <PropertyInput
                        key={key}
                        propKey={key}
                        def={def}
                        value={values[key]}
                        onChange={setValue}
                        inputClass={inputClass}
                        labelClass={labelClass}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Download button */}
            <Button
              className="w-full text-base sm:text-lg h-10 sm:h-12 rounded-lg cursor-pointer transition-colors bg-[#235AB4] hover:bg-[#235AB4]/90 border-none ring-0"
              onClick={downloadFile}
            >
              <Download className="size-4 sm:size-5" />
              Download server.properties
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert className="rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          Default values match a fresh Minecraft server. Only change what you need — hover over labels for descriptions.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual property input                                          */
/* ------------------------------------------------------------------ */

function PropertyInput({
  propKey,
  def,
  value,
  onChange,
  inputClass,
  labelClass,
}: {
  propKey: string;
  def: PropDef;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
  inputClass: string;
  labelClass: string;
}) {
  if (def.type === "boolean") {
    return (
      <label className="flex items-center justify-between gap-3 cursor-pointer group">
        <span className={labelClass} title={def.description}>
          {propKey}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={value as boolean}
          onClick={() => onChange(propKey, !value)}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${value ? "bg-[#235AB4]" : "bg-[#374151]"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? "translate-x-5" : ""}`}
          />
        </button>
      </label>
    );
  }

  if (def.type === "select") {
    return (
      <div className="space-y-1.5">
        <label className={labelClass} title={def.description}>
          {propKey}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {def.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(propKey, opt.value)}
              className={`px-2 py-1.5 text-xs sm:text-sm rounded-md cursor-pointer transition-colors text-white border-none ${
                value === opt.value
                  ? "bg-[#235AB4] hover:bg-[#235AB4]/90"
                  : "bg-[#36446B] hover:bg-[#36446B]/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (def.type === "number") {
    return (
      <div className="space-y-1">
        <label className={labelClass} title={def.description}>
          {propKey}
        </label>
        <input
          type="number"
          value={value as number}
          min={def.min}
          max={def.max}
          onChange={(e) => onChange(propKey, e.target.value === "" ? 0 : Number(e.target.value))}
          className={inputClass}
        />
      </div>
    );
  }

  // string
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <label className={labelClass} title={def.description}>
          {propKey}
        </label>
        {propKey === "motd" && (
          <a
            href="https://gravelhost.com/minecraft-motd-editor"
            className="text-xs text-[#2B7FFF] hover:text-[#2B7FFF]/80 transition-colors"
          >
            Need a MOTD? Use our MOTD Editor →
          </a>
        )}
      </div>
      <input
        type="text"
        value={value as string}
        onChange={(e) => onChange(propKey, e.target.value)}
        className={inputClass}
      />
    </div>
  );
}
