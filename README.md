# Gravel Host Tools

A collection of free, open-source Minecraft server utilities built with [Next.js](https://nextjs.org), [React](https://react.dev), and [Tailwind CSS](https://tailwindcss.com). Each tool is designed to help server owners configure, preview, and manage parts of their Minecraft server.

> **Live at** — deployed as part of the Gravel Host platform.

---

## Tools

### MOTD Creator (`/motd-creator`)

A visual editor for Minecraft server MOTDs (Message of the Day). Type and format text with the toolbar, and see exactly how it will look in the Minecraft server list.

- Two-line editor with a live server-list preview (background, icon, and Minecraft font rendering)
- 16 color buttons and 6 format buttons (bold, italic, underline, strikethrough, obfuscated, reset) matching Minecraft's `§` formatting codes
- Real-time MOTD code output with one-click copy
- Keyboard navigation between lines (Enter / Backspace)

**Module breakdown:**

| File | Purpose |
|------|---------|
| `page.tsx` | React component — editor UI, toolbar, preview area, copy output |
| `constants.ts` | Minecraft color/format code mappings, button key arrays, default state |
| `types.ts` | `FormatState` interface shared across modules |
| `motd-utils.ts` | Pure functions — DOM-to-MOTD parsing, format code application, selection formatting |

### RAM Calculator (`/minecraft-ram-calculator`)

Estimates monthly cost and player capacity for a Minecraft server based on RAM allocation.

- Three pricing tiers (Budget, Premium, Ultimate)
- Three game profiles (Vanilla, Paper/Purpur, Modpacks) with sensible RAM defaults
- Interactive slider (1–128 GB) with live price and player capacity estimates

### Skin Grabber (`/skin-grabber`)

Look up any Minecraft player's skin by username, view it in 3D, and download or share it.

- 3D skin viewer powered by [skinview3d](https://github.com/nickg87/skinview3d) (THREE.js)
- Download skin as PNG
- Shareable deep-links via URL hash (`#ign=username`)
- Proxied through a local API route to avoid CORS issues

### Cape Grabber (`/cape-grabber`)

Look up any Minecraft player's capes across multiple providers and download them.

- Fetches capes from Mojang, Optifine, MinecraftCapes, LabyMod, 5zig, and TLauncher
- Download cape images directly
- Shareable deep-links via URL hash (`#ign=username`)

### Server Icon Converter (`/server-icon-converter`)

Upload any image and convert it to a properly sized Minecraft server icon.

- Resizes images to the required 64×64 pixels
- Live preview before downloading
- Download the converted icon ready to drop into your server folder

### Start File Generator (`/start-file-generator`)

Generate server startup scripts (`.bat` / `.sh`) with optimized JVM flags.

- Supports Aikar's flags and proxy server presets
- Configurable memory allocation and JAR file name
- Outputs ready-to-use batch (Windows) and shell (Linux/macOS) scripts

---

## API Routes

### `GET /api/skin/[username]`

Proxies skin requests to [Minotar](https://minotar.net) and returns the PNG image. Validates the username (1–16 alphanumeric characters or underscores) and caches responses for 1 hour.

---

## Project Structure

```
app/
├── api/skin/[username]/route.ts   # Skin proxy API
├── cape-grabber/
│   └── page.tsx
├── minecraft-ram-calculator/
│   └── page.tsx
├── motd-creator/
│   ├── page.tsx                   # Editor component
│   ├── constants.ts               # Color/format maps
│   ├── motd-utils.ts              # Parsing & formatting logic
│   └── types.ts                   # Shared types
├── server-icon-converter/
│   └── page.tsx
├── skin-grabber/
│   └── page.tsx
├── start-file-generator/
│   └── page.tsx
├── layout.tsx                     # Root layout & metadata
├── globals.css                    # Tailwind config, Minecraft colors, custom fonts
└── page.tsx                       # Home page

components/ui/                     # shadcn/ui components (Button, Card, Slider, etc.)
lib/utils.ts                       # cn() class-merge helper
public/
├── fonts/                         # Minecraft font files (Regular, Italic, Bold, BoldItalic)
├── minecraft-background.png       # MOTD editor dirt-block background
└── unknown_server.jpg             # Default server icon
```

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Language** — TypeScript 5 (strict mode)
- **Styling** — Tailwind CSS 4
- **UI primitives** — [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- **Icons** — [Lucide](https://lucide.dev)
- **3D rendering** — [skinview3d](https://github.com/nickg87/skinview3d) (THREE.js)
- **Package manager** — [Bun](https://bun.sh)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ or [Bun](https://bun.sh)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/gravelhost/tools.git
cd tools

# Install dependencies
bun install    # or: npm install

# Start the dev server
bun dev        # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
bun run build
bun start
```

---

## Contributing

Contributions are welcome! Whether it's a bug fix, a new tool, or an improvement to an existing one — we'd love your help.

1. Fork the repo
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Make sure the build passes (`bun run build`)
5. Open a pull request

### Guidelines

- Keep tools focused — each one should solve a specific Minecraft server admin problem
- Use the existing UI components (`components/ui/`) and styling conventions
- Client components go in `app/<tool-name>/page.tsx`; extract logic into sibling modules when the file grows
- Test your changes across screen sizes — all tools should work on mobile

---

## License

Open source. See the repository for license details.
