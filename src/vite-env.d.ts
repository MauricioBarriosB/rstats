/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RSTATS_API_KEY: string;
  readonly VITE_RSTATS_API_SALT: string;
  readonly VITE_RSTATS_VALIDATION_HASH: string;
  readonly VITE_RSTATS_VALIDATION_PHRASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
