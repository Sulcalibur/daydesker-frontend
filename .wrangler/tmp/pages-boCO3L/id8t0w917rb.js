// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/_fonts/*",
    "/_nuxt/*",
    "/favicon.ico",
    "/robots.txt",
    "/workspaces/1",
    "/workspaces/2",
    "/workspaces/3",
    "/workspaces/4",
    "/workspaces/5",
    "/workspaces/6",
    "/workspaces/1/_payload.json",
    "/workspaces/2/_payload.json",
    "/workspaces/3/_payload.json",
    "/workspaces/4/_payload.json",
    "/workspaces/5/_payload.json",
    "/workspaces/6/_payload.json"
  ]
};

// ../node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/sul/Dev/DayDeskr-Refactor/daydeskr-frontend/.wrangler/tmp/pages-boCO3L/bundledWorker-0.6399497103749274.mjs";
import { isRoutingRuleMatch } from "/Users/sul/Dev/DayDeskr-Refactor/daydeskr-frontend/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/sul/Dev/DayDeskr-Refactor/daydeskr-frontend/.wrangler/tmp/pages-boCO3L/bundledWorker-0.6399497103749274.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=id8t0w917rb.js.map
