// app/admin/users/page.tsx
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { requireAdmin } from "@/lib/admin";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { id: "desc" },
    include: {
      mentorProfile: {
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      },
      bookings: {
        select: {
          id: true,
        },
      },
      savedMentors: {
        select: {
          id: true,
        },
      },
    },
    take: 100,
  });

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="h1">User Management</h1>
            <p className="mt-1 text-sm text-white/60">
              Signed in as: {session?.user?.email}
            </p>
          </div>
          <Badge variant="outline">Total: {users.length}</Badge>
        </div>

        {/* Users List */}
        <div className="grid gap-4">
          {users.length === 0 ? (
            <Card>
              <CardContent>
                <p className="muted">No users found.</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold truncate">
                          {user.name || "No name"}
                        </h3>
                        {user.emailVerified && (
                          <Badge variant="success" size="sm">
                            Verified
                          </Badge>
                        )}
                        {user.mentorProfile && (
                          <Badge
                            variant={user.mentorProfile.isActive ? "success" : "default"}
                            size="sm"
                          >
                            Mentor
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-white/70 mb-3 truncate">
                        {user.email}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-4 text-xs text-white/60">
                        <div>
                          <span className="font-medium">{user.bookings.length}</span>{" "}
                          booking{user.bookings.length !== 1 ? "s" : ""}
                        </div>
                        <div>
                          <span className="font-medium">{user.savedMentors.length}</span>{" "}
                          saved
                        </div>
                        {user.mentorProfile && (
                          <div>
                            Mentor ID: {user.mentorProfile.id.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="text-right text-xs text-white/50">
                      <p>ID: {user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
