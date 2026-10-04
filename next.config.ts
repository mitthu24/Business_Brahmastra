import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase 5.5.1 performance pass: src/components/nav/Icon.tsx does `import * as Icons from
  // "lucide-react"` (a namespace/barrel import) and is used on every learner, founder and
  // marketing page - without this, bundlers can struggle to tree-shake a barrel import down to
  // only the icons actually referenced. This does not change which icons render, only how much
  // unrelated icon code ships to the browser.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
