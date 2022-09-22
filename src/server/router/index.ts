// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

// import { exampleRouter } from "./example";
import { linkRouter } from "./link";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("links.", linkRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
