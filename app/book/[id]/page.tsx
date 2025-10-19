// app/book/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import BookingForm from "@/components/booking/BookingForm";
import Image from "next/image";


type Params = { id: string };

export default async function BookPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/signin?callbackUrl=" + encodeURIComponent(`/book/${(await params).id}`));
  }

  const { id } = await params;

  const mentor = await db.mentor.findUnique({
    where: { id, isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      tagline: true,
      profileImage: true,
      offerType: true,
      accessPrice: true,
      hourlyRate: true,
      rating: true,
      reviews: true,
    },
  });

  if (!mentor) notFound();

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="h1 mb-2">Book with {mentor.name}</h1>
          <p className="text-white/60">{mentor.tagline}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Mentor Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent>
                {mentor.profileImage && (
                  <Image
                    src={mentor.profileImage}
                    alt={mentor.name}
                    width={96}
                    height={96}
                    className="mb-4 h-24 w-24 rounded-full object-cover"
                  />
                )}
                <h2 className="mb-1 text-lg font-semibold">{mentor.name}</h2>
                <p className="mb-3 text-sm text-white/60">{mentor.tagline}</p>
                
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline">{mentor.category}</Badge>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <span className="text-amber-400">★</span>
                  <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                  <span className="text-white/40">({mentor.reviews} reviews)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="mb-6 text-xl font-semibold">Complete Your Booking</h2>
                <BookingForm mentor={mentor} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}