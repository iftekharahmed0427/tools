"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function MotdCreatorPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-16">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222] calculator-card">
        <CardContent className="py-4 px-4 sm:px-6 md:px-12">
          <div className="space-y-6 md:space-y-12">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE] text-center">
                <p><span className="text-[#2B7FFF]">Gravel Host</span> MOTD Editor</p>
              </CardTitle>
              <CardDescription className="text-[#A4BDDE] text-base md:text-lg text-center">
                Edit and preview your server MOTD.
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col justify-center items-center max-w-[610px] mx-auto">
              <div className="editor-container relative mx-auto w-full font-minecraft">
                <div className="editor-inner relative min-h-[64px] w-[610px] bg-repeat bg-size-[80px] pt-3 pr-5 pb-3 pl-3 flex box-content" style={{ backgroundImage: "url('/minecraft-background.png')" }}>
                  <div className="server-icon relative mr-1.5">
                    <Image src="/unknown_server.jpg" alt="Server Icon" width={64} height={64} />
                  </div>
                  <div className="server-texts text-white text-[19px] leading-3.5">
                    <div className="server-name mt-1 whitespace-pre-wrap">Minecraft Server</div>
                    <div className="editor mt-1.5 leading-[18px]">
                      <div className="motd-editor h-full flex flex-col text-white">
                        <div className="output" />
                          <span className="editor-wrapper text-[#7e7e7e] italic" aria-hidden>
                            A Minecraft Server
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="editor-bar-bottom min-w-[642px] bg-[#2C385C] flex justify-between items-center pt-2 pb-2 pl-3 pr-3 rounded-bl-[5px] rounded-br-[5px] relative">
                  <div className="toolbar w-full">
                    <div className="toolbar-wrapper justify-center w-full flex items-center">
                      <div className="toolbar-color-buttons flex items-center flex-wrap h-full minecraft-colors">
                        <div className="toolbar-button text-mc-black">0</div>
                        <div className="toolbar-button text-mc-dark-blue">1</div>
                        <div className="toolbar-button text-mc-dark-green">2</div>
                        <div className="toolbar-button text-mc-dark-aqua">3</div>
                        <div className="toolbar-button text-mc-dark-red">4</div>
                        <div className="toolbar-button text-mc-dark-purple">5</div>
                        <div className="toolbar-button text-mc-gold">6</div>
                        <div className="toolbar-button text-mc-gray">7</div>
                        <div className="toolbar-button text-mc-dark-gray">8</div>
                        <div className="toolbar-button text-mc-blue">9</div>
                        <div className="toolbar-button text-mc-green">a</div>
                        <div className="toolbar-button text-mc-aqua">b</div>
                        <div className="toolbar-button text-mc-red">c</div>
                        <div className="toolbar-button text-mc-light-purple">d</div>
                        <div className="toolbar-button text-mc-yellow">e</div>
                        <div className="toolbar-button text-mc-white">f</div>
                      </div>
                      <div className="toolbar-format-buttons flex flex-wrap items-center h-full justify-center minecraft-colors">
                        <div className="toolbar-button text-mc-white font-bold">l</div>
                        <div className="toolbar-button text-mc-white line-through">m</div>
                        <div className="toolbar-button text-mc-white underline">n</div>
                        <div className="toolbar-button text-mc-white italic">o</div>
                        <div className="toolbar-button text-mc-white">r</div>
                        <div className="toolbar-button text-mc-white">k</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}