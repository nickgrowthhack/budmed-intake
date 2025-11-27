## Problem

* The editor still reports `ts(2307)` for `npm:@supabase/supabase-js@2` despite Deno settings, due to Node tsserver lingering diagnostics.

## Plan

1. Add an ambient declaration file that defines the `npm:@supabase/supabase-js@2` module with minimal exports.
2. Update `jsconfig.json` to include the `types/**/*.d.ts` folder so tsserver loads the ambient declarations.
3. Advise IDE window reload so settings and declarations take effect.
4. Keep the Deno import intact; this change only affects editor diagnostics, not runtime.

## Expected Outcome

* The `ts(2307)` error disappears in the editor while preserving Deno-compatible imports and behavior.

