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

const RAM_MIN = 1;
const RAM_MAX = 128;
const PRICE_PER_GB = 0.90;

export default function RamCalculator() {
  const [ram, setRam] = useState([8]);

  const ramGb = ram[0];
  const price = ramGb * PRICE_PER_GB;

  return (
    <div className="container mx-auto max-w-5xl py-42">
      <Card className="bg-[#0E1222] rounded-3xl">
        <CardContent className="py-2">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-4xl font-bold text-[#DBE9FE]">
                    <p className="text-[#2B7FFF]">GravelHost</p>
                    <p>Ram Calculator</p>
                </CardTitle>
                <CardDescription className="text-[#A4BDDE] text-lg">
                  Choose how much memory you need. The calculator will estimate the price based on the amount of RAM you choose.
                </CardDescription>
              </CardHeader>
              <div className="space-y-1 text-[#DBE9FE]">
                <p className="text-sm text-[#94A0B6]">Estimated price</p>
                <p className="text-4xl font-semibold">
                  <span className="text-[#949FB2]">$</span>{price.toLocaleString()}
                  <span className="text-sm font-normal text-[#94A0B6]">
                    /mo
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#EFF6FF] text-3xl font-bold">RAM</span>
                <span className="font-medium text-[#8092AF]">{ramGb} GB</span>
              </div>
              <Slider
                value={ram}
                onValueChange={setRam}
                min={RAM_MIN}
                max={RAM_MAX}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-[#8092AF]">
                {RAM_MIN} GB – {RAM_MAX} GB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
