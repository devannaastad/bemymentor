// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export Next.js App Router handlers
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
