// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.email) throw new Error("Unauthorized");
      return { email: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return data back to client (we'll save to DB in the API proxy below)
      return { email: metadata.email, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
