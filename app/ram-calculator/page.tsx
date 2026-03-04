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
    <div className="container mx-auto max-w-7xl py-42">
      <Card className="bg-[#0E1222] rounded-3xl">
        <CardContent className="py-5 px-12">
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
            <div className="flex flex-col justify-start">
              <div className="flex items-center gap-2">
                <p className="text-2xl text-[#8095B2]">Best for: <span className="text-[#2B7FFF]">50 Players</span> </p>
              </div>
              <div className="flex items-center justify-between text-sm pt-3">
                <span className="text-[#EFF6FF] text-3xl font-bold">RAM</span>
              </div>
              <div className="flex items-center gap-3 w-full pt-2">
                <span className="text-lg text-[#8092AF] shrink-0">{RAM_MIN} GB</span>
                <Slider
                  value={ram}
                  onValueChange={setRam}
                  min={RAM_MIN}
                  max={RAM_MAX}
                  step={1}
                  thumbLabel={`${ramGb} GB`}
                  className="flex-1 min-w-0"
                  trackClassName="bg-[#222F45] data-[orientation=horizontal]:h-[16px]"
                  rangeClassName="bg-[#235AB4]"
                />
                <span className="text-lg text-[#8092AF] shrink-0">{RAM_MAX} GB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
