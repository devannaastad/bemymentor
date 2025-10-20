// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();
      
      if (!session?.user?.email) {
        throw new UploadThingError("Unauthorized");
      }

      return { email: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for email:", metadata.email);
      console.log("file url", file.url);

      await db.user.update({
        where: { email: metadata.email },
        data: { image: file.url },
      });

      return { uploadedBy: metadata.email, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;