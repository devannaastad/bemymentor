// app/access-pass/[mentorId]/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import { Lock, ExternalLink, MessageSquare, FileText } from "lucide-react";
import Image from "next/image";

type Params = { mentorId: string };

export default async function AccessPassPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { mentorId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/access-pass/${mentorId}`);
  }

  // Fetch the mentor
  const mentor = await db.mentor.findUnique({
    where: { id: mentorId },
  });

  if (!mentor) {
    return (
      <div className="section">
        <div className="container max-w-4xl">
          <h1 className="mb-4 text-3xl font-bold">Mentor Not Found</h1>
          <p className="text-white/70">
            The mentor you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has purchased an access pass from this mentor
  const accessPass = await db.booking.findFirst({
    where: {
      userId: session.user.id,
      mentorId: mentorId,
      type: "ACCESS",
      status: {
        in: ["CONFIRMED", "COMPLETED"], // Accept both confirmed and completed bookings
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!accessPass) {
    return (
      <div className="section">
        <div className="container max-w-4xl">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="text-center">
              <Lock className="mx-auto h-16 w-16 text-amber-400 mb-4" />
              <h1 className="mb-4 text-3xl font-bold">Access Pass Required</h1>
              <p className="mb-6 text-white/70">
                You need to purchase an access pass from {mentor.name} to view this
                exclusive content.
              </p>
              <a
                href={`/mentors/${mentorId}`}
                className="inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                View Mentor Profile
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  type AccessLink = { type: string; title: string; url: string; description?: string };
  const accessPassLinks: AccessLink[] = Array.isArray(mentor.accessPassLinks)
    ? (mentor.accessPassLinks as AccessLink[])
    : [];

  const getLinkIcon = (type: string) => {
    switch (type) {
      case "discord":
      case "telegram":
      case "slack":
        return MessageSquare;
      case "document":
        return FileText;
      default:
        return ExternalLink;
    }
  };

  return (
    <div className="section">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          {mentor.profileImage && (
            <Image
              src={mentor.profileImage}
              alt={mentor.name}
              width={96}
              height={96}
              className="mx-auto mb-4 rounded-full"
            />
          )}
          <h1 className="mb-2 text-3xl font-bold">{mentor.name} - Exclusive Content</h1>
          <p className="text-white/60">Welcome to your exclusive access pass area!</p>
        </div>

        {/* Welcome Message */}
        {mentor.accessPassWelcome && (
          <Card className="mb-8">
            <CardContent>
              <h2 className="mb-4 text-xl font-semibold">Welcome Message</h2>
              <div className="whitespace-pre-wrap text-white/80">
                {mentor.accessPassWelcome}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exclusive Links & Resources */}
        <Card>
          <CardContent>
            <h2 className="mb-6 text-xl font-semibold">Exclusive Links & Resources</h2>

            {accessPassLinks.length === 0 ? (
              <div className="py-12 text-center">
                <Lock className="mx-auto h-12 w-12 text-white/40" />
                <p className="mt-4 text-white/60">
                  No exclusive content has been added yet.
                </p>
                <p className="mt-2 text-sm text-white/40">
                  Check back soon for new resources!
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {accessPassLinks.map((link, index) => {
                  const Icon = getLinkIcon(link.type);

                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-500/50 hover:bg-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-purple-500/20 p-3">
                          <Icon className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="mt-1 text-sm text-white/60">
                              {link.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                            <span>Open link</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
