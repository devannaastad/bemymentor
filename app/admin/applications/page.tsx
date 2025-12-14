// app/admin/applications/page.tsx
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/common/Card";
import Badge from "@/components/common/Badge";
import { formatCurrency } from "@/lib/utils/format";
import ApplicationActions from "@/components/admin/ApplicationActions";
import { requireAdmin } from "@/lib/admin";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  // Require admin authentication
  const session = await requireAdmin();

  const applications = await db.application.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    pending: applications.filter((a) => a.status === "PENDING").length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="h1">Mentor Applications</h1>
            <p className="mt-1 text-sm text-white/60">
              Signed in as: {session?.user?.email}
            </p>
          </div>
          <Badge variant="outline">Total: {applications.length}</Badge>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Pending Review</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Approved</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-white/60">Rejected</p>
              <p className="text-2xl font-bold text-rose-400">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="grid gap-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent>
                <p className="muted">No applications yet.</p>
              </CardContent>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id}>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                    {/* Application Details */}
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{app.fullName}</h3>
                            <Badge
                              variant={
                                app.status === "APPROVED"
                                  ? "success"
                                  : app.status === "REJECTED"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {app.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-white/70">{app.email}</p>
                          {app.phone && (
                            <p className="text-sm text-white/70">{app.phone}</p>
                          )}
                        </div>

                        <div className="text-right text-xs text-white/50">
                          <p>{new Date(app.createdAt).toLocaleDateString()}</p>
                          <p>{new Date(app.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div>
                          <p className="text-xs font-medium text-white/60">Topic</p>
                          <p className="text-sm">{app.topic}</p>
                        </div>

                        {app.customCategory && (
                          <div>
                            <p className="text-xs font-medium text-white/60">Category</p>
                            <p className="text-sm">{app.customCategory}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-white/60">Pricing</p>
                          <p className="text-sm">
                            {app.offerType}
                            {app.accessPrice && ` • ACCESS ${formatCurrency(app.accessPrice)}`}
                            {app.hourlyRate && ` • TIME ${formatCurrency(app.hourlyRate)}/hr`}
                            {app.weeklyPrice && ` • WEEKLY ${formatCurrency(app.weeklyPrice)}/wk`}
                            {app.monthlyPrice && ` • MONTHLY ${formatCurrency(app.monthlyPrice)}/mo`}
                          </p>
                        </div>

                        {/* Social Proof Links */}
                        {app.socialProof &&
                          Object.values(app.socialProof as Record<string, string>).some((v) => v && v !== "") && (
                          <div>
                            <p className="text-xs font-medium text-white/60 mb-2">Social Proof Links</p>
                            <div className="grid gap-1 text-xs">
                              {(app.socialProof as Record<string, string>).portfolio && (
                                <div>
                                  <span className="text-white/50">Portfolio:</span>{" "}
                                  <a
                                    href={(app.socialProof as Record<string, string>).portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:underline"
                                  >
                                    {(app.socialProof as Record<string, string>).portfolio}
                                  </a>
                                </div>
                              )}
                              {(app.socialProof as Record<string, string>).youtube && (
                                <div>
                                  <span className="text-white/50">YouTube:</span>{" "}
                                  <a
                                    href={(app.socialProof as Record<string, string>).youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:underline"
                                  >
                                    {(app.socialProof as Record<string, string>).youtube}
                                  </a>
                                </div>
                              )}
                              {(app.socialProof as Record<string, string>).twitch && (
                                <div>
                                  <span className="text-white/50">Twitch:</span>{" "}
                                  <a
                                    href={(app.socialProof as Record<string, string>).twitch}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:underline"
                                  >
                                    {(app.socialProof as Record<string, string>).twitch}
                                  </a>
                                </div>
                              )}
                              {(app.socialProof as Record<string, string>).twitter && (
                                <div>
                                  <span className="text-white/50">Twitter/X:</span>{" "}
                                  <a
                                    href={(app.socialProof as Record<string, string>).twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:underline"
                                  >
                                    {(app.socialProof as Record<string, string>).twitter}
                                  </a>
                                </div>
                              )}
                              {(app.socialProof as Record<string, string>).instagram && (
                                <div>
                                  <span className="text-white/50">Instagram:</span>{" "}
                                  <a
                                    href={(app.socialProof as Record<string, string>).instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:underline"
                                  >
                                    {(app.socialProof as Record<string, string>).instagram}
                                  </a>
                                </div>
                              )}
                              {(app.socialProof as Record<string, string>).tiktok && (
                                <div>
                                  <span className="text-white/50">TikTok:</span>{" "}
                                  <a
                                    href={(app.socialProof as Record<string, string>).tiktok}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-400 hover:underline"
                                  >
                                    {(app.socialProof as Record<string, string>).tiktok}
                                  </a>
                                </div>
                              )}
                              {(app.socialProof as Record<string, string>).other && (
                                <div>
                                  <span className="text-white/50">Other:</span>{" "}
                                  <span className="text-white/70">{(app.socialProof as Record<string, string>).other}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Proof Images */}
                        {app.proofImages && (app.proofImages as string[]).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-white/60 mb-2">Proof Screenshots</p>
                            <div className="grid grid-cols-3 gap-2">
                              {(app.proofImages as string[]).map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <Image
                                    src={url}
                                    alt={`Proof ${index + 1}`}
                                    width={150}
                                    height={100}
                                    className="w-full h-20 object-cover rounded border border-white/20 hover:border-primary-400 transition-colors"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Notes */}
                        <details>
                          <summary className="cursor-pointer text-sm text-white/60 hover:text-white/80">
                            View additional notes/proof
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap rounded bg-black/30 p-3 text-xs">
                            {app.proofLinks}
                          </pre>
                        </details>

                        {app.notes && (
                          <div>
                            <p className="text-xs font-medium text-white/60">Admin Notes</p>
                            <p className="mt-1 text-sm italic text-white/70">{app.notes}</p>
                          </div>
                        )}

                        {app.reviewedBy && app.reviewedAt && (
                          <div className="text-xs text-white/50">
                            Reviewed by {app.reviewedBy} on{" "}
                            {new Date(app.reviewedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <ApplicationActions
                        applicationId={app.id}
                        currentStatus={app.status}
                        currentNotes={app.notes}
                      />
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