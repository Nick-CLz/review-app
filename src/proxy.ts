import { clerkMiddleware } from "@clerk/nextjs/server";

// Makes the Clerk session available to Server Functions and route handlers.
// Pages stay public; writes are checked inside each Server Function (src/app/actions.ts).
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
