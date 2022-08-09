import npath from "path";
import { unwrapId } from "../../util.js";
import { STYLE_EXTENSIONS } from "../util.js";
const fileExtensionsToSSR = /* @__PURE__ */ new Set([".astro", ".md"]);
async function* crawlGraph(viteServer, _id, isFile, scanned = /* @__PURE__ */ new Set()) {
  const id = unwrapId(_id);
  const importedModules = /* @__PURE__ */ new Set();
  const moduleEntriesForId = isFile ? viteServer.moduleGraph.getModulesByFile(id) ?? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([viteServer.moduleGraph.getModuleById(id)]);
  for (const entry of moduleEntriesForId) {
    if (!entry) {
      continue;
    }
    if (id === entry.id) {
      scanned.add(id);
      const entryIsStyle = STYLE_EXTENSIONS.has(npath.extname(id));
      for (const importedModule of entry.importedModules) {
        if (importedModule.id) {
          const { pathname } = new URL(`file://${importedModule.id}`);
          if (entryIsStyle && !STYLE_EXTENSIONS.has(npath.extname(pathname))) {
            continue;
          }
          if (fileExtensionsToSSR.has(npath.extname(pathname))) {
            const mod = viteServer.moduleGraph.getModuleById(importedModule.id);
            if (!(mod == null ? void 0 : mod.ssrModule)) {
              await viteServer.ssrLoadModule(importedModule.id);
            }
          }
        }
        importedModules.add(importedModule);
      }
    }
  }
  for (const importedModule of importedModules) {
    if (!importedModule.id || scanned.has(importedModule.id)) {
      continue;
    }
    yield importedModule;
    yield* crawlGraph(viteServer, importedModule.id, false, scanned);
  }
}
export {
  crawlGraph
};
