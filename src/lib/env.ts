export const env = (() => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ] as const;

  type Keys = typeof required[number];
  const missing: string[] = [];
  const get = (k: Keys) => {
    const v = import.meta.env[k];
    if (!v) missing.push(k);
    return v ?? '';
  };

  const cfg = {
    url: get('VITE_SUPABASE_URL'),
    anon: get('VITE_SUPABASE_PUBLISHABLE_KEY'),
  };

  if (missing.length) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}. ` +
      `Set them in .env or your deploy environment.`
    );
  }
  return cfg;
})();