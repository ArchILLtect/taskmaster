/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_E2E_BYPASS_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?raw" {
  const content: string;
  export default content;
}
