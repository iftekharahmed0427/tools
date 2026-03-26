"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, ImageUp, Info } from "lucide-react";
import NextImage from "next/image";

export default function ServerIconConverter() {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target?.result as string;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(image, 0, 0, 64, 64);
        setResizedImage(canvas.toDataURL("image/png"));
      };
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find(
        (item) => item.type.indexOf("image") !== -1
      );

      if (imageItem) {
        const file = imageItem.getAsFile();
        if (file) processImageFile(file);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processImageFile]);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-2 space-y-3 bg-transparent">
      <Card className="bg-[#0E1222] rounded-2xl sm:rounded-3xl bg-radial-[at_30%_75%] from-[#10294E] to-[#0E1222]">
        <CardContent className="py-4 pb-6 px-4 sm:px-6 md:px-12">
          <div className="grid gap-4 md:gap-12 md:grid-cols-2 items-center">
            <div className="space-y-3 sm:space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#DBE9FE]">
                  <p className="text-[#2B7FFF]">Server Icon</p>
                  <p>Converter</p>
                </CardTitle>
                <CardDescription className="text-[#A4BDDE] text-base md:text-lg">
                  Upload or paste an image to resize it to 64x64 for your
                  Minecraft server icon. The preview shows how it will appear in
                  the server list.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={onFileSelected}
                />
                <Button
                  className="w-full text-base sm:text-lg h-10 sm:h-12 rounded-lg cursor-pointer transition-colors bg-[#235AB4] hover:bg-[#235AB4]/90 border-none ring-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageUp className="size-4 sm:size-5" />
                  Upload Image
                </Button>
              </div>

              {resizedImage && (
                <div className="pt-2">
                  <Button
                    asChild
                    className="w-full text-base sm:text-lg h-10 sm:h-12 rounded-lg cursor-pointer transition-colors bg-[#235AB4] hover:bg-[#235AB4]/90 border-none ring-0"
                  >
                    <a href={resizedImage} download="server-icon.png">
                      <Download className="size-4 sm:size-5" />
                      Download server-icon.png
                    </a>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-start">
              <p className="text-lg sm:text-xl md:text-2xl text-[#8095B2] mb-3">
                Server List <span className="text-[#2B7FFF]">Preview</span>
              </p>
              <div
                className="relative w-full max-w-[642px] min-h-[64px] bg-repeat p-3 sm:pr-5 flex box-border rounded-md"
                style={{
                  backgroundImage: "url('/minecraft-background.png')",
                  backgroundSize: "calc(min(642px, 100%) * 80 / 642)",
                }}
              >
                <div className="relative mr-1.5">
                  {resizedImage ? (
                    <img
                      src={resizedImage}
                      alt="Server Icon"
                      width={64}
                      height={64}
                      className="w-12 h-12 sm:w-16 sm:h-16"
                      draggable={false}
                    />
                  ) : (
                    <NextImage
                      src="/unknown_server.jpg"
                      alt="Server Icon"
                      width={64}
                      height={64}
                      className="w-12 h-12 sm:w-16 sm:h-16"
                    />
                  )}
                </div>
                <div className="font-minecraft text-white text-[16px] sm:text-[19px] leading-3.5 flex-1 min-w-0">
                  <div className="mt-1 whitespace-pre-wrap">Minecraft Server</div>
                  <div className="mt-1.5 leading-[18px] text-[#7e7e7e] text-[16px] sm:text-[19px] leading-[20px]">
                    <div className="min-h-[1.25em]">A Minecraft Server</div>
                  </div>
                </div>
              </div>
              <a
                href="https://gravelhost.com/minecraft-motd-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm sm:text-base text-[#A4BDDE] hover:text-[#2B7FFF] transition-colors"
              >
                Need a custom MOTD? Try our MOTD Generator →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      <Alert className="rounded-lg border-[#222F45] bg-[#0E1222] text-[#A4BDDE] [&>svg]:text-[#2B7FFF] px-3 py-3 sm:px-4 sm:py-3">
        <Info className="size-4 sm:size-5 shrink-0" />
        <AlertDescription className="text-[#A4BDDE] text-sm sm:text-base">
          Images are resized to 64x64 pixels and renamed to server-icon.png.
          Transparency is preserved for PNG files. You can also paste an image
          directly with Ctrl+V.
        </AlertDescription>
      </Alert>
    </div>
  );
}
