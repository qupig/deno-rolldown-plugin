import denoPlugin from "./mod.ts";
import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";

Deno.test("should load and resolve", async () => {
  const plugin = denoPlugin({
    noTranspile: true,
  });
  await plugin.buildStart({
    input: import.meta.url,
  });
  {
    const value = (await plugin.resolveId("./mod.ts", import.meta.url, {
      kind: "import-statement",
    })) as string;
    assertEquals(value, fromFileUrl(import.meta.resolve("./mod.ts")));
    const text = await plugin.load(value);
    assertEquals(text, Deno.readTextFileSync(value));
  }
  // non exist file
  {
    const value = await plugin.resolveId("./non-exist-file.ts", undefined, {
      kind: "import-statement",
    });
    assertEquals(value, null); // Should return null to allow other plugins to resolve it.
  }
  // node specifier
  {
    const value = await plugin.resolveId("node:events", import.meta.url, {
      kind: "import-statement",
    });
    if (typeof value === "string") {
      throw new Error("Fail.");
    }
    assertEquals(value?.external, true);
    assertEquals(value?.id, "node:events");
  }
});
