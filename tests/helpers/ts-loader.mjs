import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
registerHooks({
  resolve(specifier, context, nextResolve) {
    let value = specifier;
    if (specifier.startsWith("@/"))
      value = pathToFileURL(path.resolve("src", specifier.slice(2))).href;
    if (value.startsWith(".") || value.startsWith("file:")) {
      const resolved = new URL(
        value,
        context.parentURL || pathToFileURL(process.cwd() + "/"),
      );
      if (existsSync(fileURLToPath(resolved) + ".ts"))
        value = resolved.href + ".ts";
    }
    if (value === "next/server" || value === "next/headers") value += ".js";
    return nextResolve(value, context);
  },
});
