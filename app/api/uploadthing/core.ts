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
      console.log("file url", file.ufsUrl);

      await db.user.update({
        where: { email: metadata.email },
        data: { image: file.ufsUrl },
      });

      return { uploadedBy: metadata.email, url: file.ufsUrl };
    }),

  proofUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(async () => {
      // Allow unauthenticated uploads for mentor applications
      return { uploadType: "proof" };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Proof image uploaded:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.email) {
        throw new UploadThingError("Unauthorized");
      }

      return { email: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image uploaded by:", metadata.email);
      console.log("Image URL:", file.ufsUrl);
      return { uploadedBy: metadata.email, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;