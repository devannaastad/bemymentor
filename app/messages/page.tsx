// app/messages/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserMessages from "@/components/messages/UserMessages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages • BeMyMentor",
};

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin?callbackUrl=/messages");
  }

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="h1 mb-2">Messages</h1>
          <p className="text-white/60">View and manage all your conversations</p>
        </div>

        <UserMessages />
      </div>
    </section>
  );
}
