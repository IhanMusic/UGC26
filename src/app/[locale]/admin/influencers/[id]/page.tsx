import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function AdminInfluencerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const t = await getTranslations("nav");

  const user = await prisma.user.findUnique({
    where: { id },
    include: { influencerProfile: true },
  });

  if (!user) {
    return (
      <AppShell title={t("influencerDetail")} nav={await getAdminNav()}>
        <div className="text-slate-700">Not found</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("influencerDetail")} nav={await getAdminNav()}>
      <Card>
        <CardHeader>
          <CardTitle>
            {user.firstName} {user.lastName}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {user.isDeleted ? <Badge variant="danger">Deleted</Badge> : null}
            {user.isBlocked ? <Badge variant="warning">Blocked</Badge> : null}
            {user.isVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="secondary">Unverified</Badge>
            )}
          </div>

          <div className="grid gap-2 text-sm text-slate-700">
            <div>Phone: {user.phone ?? "—"}</div>
            <div>Main account: {user.influencerProfile?.mainAccountLink ?? "—"}</div>
            <div>Country: {user.influencerProfile?.country ?? "—"}</div>
            <div>Passion: {user.influencerProfile?.passion ?? "—"}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!user.isVerified ? (
              <ActionButton
                url={`/api/admin/users/${user.id}`}
                method="PATCH"
                body={{ action: "verify" }}
              >
                Verify
              </ActionButton>
            ) : null}
            {user.isBlocked ? (
              <ActionButton
                variant="outline"
                url={`/api/admin/users/${user.id}`}
                method="PATCH"
                body={{ action: "unblock" }}
              >
                Unblock
              </ActionButton>
            ) : (
              <ActionButton
                variant="outline"
                url={`/api/admin/users/${user.id}`}
                method="PATCH"
                body={{ action: "block" }}
              >
                Block
              </ActionButton>
            )}
            {user.isDeleted ? (
              <ActionButton
                variant="outline"
                url={`/api/admin/users/${user.id}`}
                method="PATCH"
                body={{ action: "restore" }}
              >
                Restore
              </ActionButton>
            ) : (
              <ActionButton
                variant="destructive"
                url={`/api/admin/users/${user.id}`}
                method="PATCH"
                body={{ action: "delete" }}
              >
                Delete
              </ActionButton>
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
