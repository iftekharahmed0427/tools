"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Send, CheckCircle, XCircle } from "lucide-react";

interface VoteResult {
  success: boolean;
  version?: string;
  protocol?: string;
  error?: string;
}

export default function VotifierTester() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("8192");
  const [username, setUsername] = useState("");
  const [serviceName, setServiceName] = useState("GravelHost Tools");
  const [address, setAddress] = useState("127.0.0.1");
  const [publicKey, setPublicKey] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoteResult | null>(null);

  const canSubmit = host.trim() && username.trim() && !loading;

  const sendVote = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/votifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: host.trim(),
          port: parseInt(port) || 8192,
          username: username.trim(),
          serviceName: serviceName.trim() || "GravelHost Tools",
          address: address.trim() || "127.0.0.1",
          publicKey: publicKey.trim() || undefined,
          token: token.trim() || undefined,
          protocol: "auto",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: data.success, version: data.version, protocol: data.protocol });
      } else {
        setResult({ success: false, error: data.error || "Request failed" });
      }
    } catch {
      setResult({ success: false, error: "Failed to connect to the API" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendVote();
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-[#141517] text-[#DBE9FE] border border-[#222F45] focus:border-[#235AB4] focus:outline-none placeholder-[#8092AF] text-sm sm:text-base transition-colors";

  const labelClass = "block text-sm text-[#94A0B6] mb-1";

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-2 md:py-2 space-y-4 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222] calculator-card">
        <CardContent className="py-4 px-4 sm:px-6 md:px-12">
          <div className="space-y-6 md:space-y-8">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE] text-center">
                <p>
                  <span className="text-[#2B7FFF]">Gravel Host</span> Votifier Tester
                </p>
              </CardTitle>
              <CardDescription className="text-[#A4BDDE] text-base md:text-lg text-center">
                Send a test vote to your Minecraft server to verify your Votifier setup is working.
              </CardDescription>
            </CardHeader>

            {/* Form */}
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {/* Left column - required fields */}
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Host <span className="text-[#F55050]">*</span></label>
                  <input
                    type="text"
                    placeholder="play.example.com"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Port</label>
                  <input
                    type="number"
                    placeholder="8192"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Username <span className="text-[#F55050]">*</span></label>
                  <input
                    type="text"
                    placeholder="Steve"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Right column - optional fields */}
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Service Name</label>
                  <input
                    type="text"
                    placeholder="GravelHost Tools"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input
                    type="text"
                    placeholder="127.0.0.1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Public Key <span className="text-[#8092AF]">(v1)</span></label>
                  <textarea
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Token <span className="text-[#8092AF]">(v2)</span></label>
                  <input
                    type="text"
                    placeholder="Your Votifier token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Send button */}
            <div className="flex justify-center">
              <Button
                onClick={sendVote}
                disabled={!canSubmit}
                className="bg-[#235AB4] hover:bg-[#235AB4]/90 border-none ring-0 cursor-pointer text-base sm:text-lg px-8 h-11 sm:h-12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4 sm:size-5 mr-2" />
                {loading ? "Sending..." : "Send Test Vote"}
              </Button>
            </div>

            {/* Result */}
            {result && (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  result.success
                    ? "bg-[#0a2010] border-[#1a4030] text-[#55FF55]"
                    : "bg-[#200a0a] border-[#401a1a] text-[#FF5555]"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="size-5 shrink-0" />
                ) : (
                  <XCircle className="size-5 shrink-0" />
                )}
                <div className="text-sm sm:text-base">
                  {result.success ? (
                    <span>
                      Vote acknowledged!
                      {result.protocol && <span className="text-[#A4BDDE]"> — Protocol: {result.protocol}</span>}
                    </span>
                  ) : (
                    <span>{result.error || "Vote was not acknowledged by the server"}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert className="calculator-info-bar rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          Make sure your Votifier port is open and the plugin is configured correctly. The default port is 8192.
        </AlertDescription>
      </Alert>
    </div>
  );
}
