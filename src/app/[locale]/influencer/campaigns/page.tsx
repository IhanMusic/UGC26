import { Link } from "@/i18n/navigation";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getTranslations } from "next-intl/server";

const statusVariant = (s: string) => {
  if (s === "APPLIED") return "secondary" as const;
  if (s === "ACCEPTED" || s === "CONFIRMED" || s === "PAID") return "success" as const;
  if (s === "REJECTED") return "danger" as const;
  if (s === "ONGOING") return "warning" as const;
  return "default" as const;
};

function Section({
  title,
  rows,
  status,
}: {
  title: string;
  rows: Array<{ id: string; title: string; priceDinar: number; href?: string }>;
  status: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="rounded-full border border-slate-200/60 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500">
          {rows.length}
        </div>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Campaign</TH>
            <TH>Price</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TR>
              <TD colSpan={3} className="text-center text-slate-400">
                No campaigns
              </TD>
            </TR>
          ) : (
            rows.map((r) => (
              <TR key={r.id}>
                <TD>
                  {r.href ? (
                    <Link href={r.href} className="font-medium text-slate-900 hover:text-violet-700 hover:underline underline-offset-4">
                      {r.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-900">{r.title}</span>
                  )}
                </TD>
                <TD>{r.priceDinar.toLocaleString()} DZD</TD>
                <TD>
                  <Badge variant={statusVariant(status)}>{status}</Badge>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </div>
  );
}

export default async function InfluencerCampaignsPage() {
  const user = await requireRole("INFLUENCER");
  const t = await getTranslations("nav");

  const [applied, accepted, rejected, participations] = await Promise.all([
    prisma.campaignApplication.findMany({
      where: { influencerId: user.id, status: "APPLIED" },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaignApplication.findMany({
      where: { influencerId: user.id, status: "ACCEPTED" },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaignApplication.findMany({
      where: { influencerId: user.id, status: "REJECTED" },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaignParticipation.findMany({
      where: { influencerId: user.id },
      include: { campaign: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const ongoing = participations.filter((p) => p.status === "ONGOING");
  const upcoming = participations.filter((p) => p.status === "UPCOMING");
  const completed = participations.filter((p) => p.status === "COMPLETED");
  const confirmed = participations.filter((p) => p.status === "CONFIRMED");
  const paid = participations.filter((p) => p.status === "PAID");

  return (
    <AppShell title={t("myCampaigns")} nav={await getInfluencerNav()}>
      <div className="space-y-8">
        <Section
          title="Applied campaigns"
          status="APPLIED"
          rows={applied.map((a) => ({
            id: a.id,
            title: a.campaign.title,
            priceDinar: a.campaign.priceDinar,
            href: `/public/campaigns/${a.campaignId}`,
          }))}
        />

        <Section
          title="Accepted campaigns"
          status="ACCEPTED"
          rows={accepted.map((a) => ({
            id: a.id,
            title: a.campaign.title,
            priceDinar: a.campaign.priceDinar,
            href: `/influencer/campaigns/${a.campaignId}`,
          }))}
        />

        <Section
          title="Rejected campaigns"
          status="REJECTED"
          rows={rejected.map((a) => ({
            id: a.id,
            title: a.campaign.title,
            priceDinar: a.campaign.priceDinar,
            href: `/public/campaigns/${a.campaignId}`,
          }))}
        />

        <Section
          title="Upcoming"
          status="UPCOMING"
          rows={upcoming.map((p) => ({
            id: p.id,
            title: p.campaign.title,
            priceDinar: p.campaign.priceDinar,
            href: `/influencer/campaigns/${p.campaignId}`,
          }))}
        />

        <Section
          title="Ongoing"
          status="ONGOING"
          rows={ongoing.map((p) => ({
            id: p.id,
            title: p.campaign.title,
            priceDinar: p.campaign.priceDinar,
            href: `/influencer/campaigns/${p.campaignId}`,
          }))}
        />

        <Section
          title="Completed"
          status="COMPLETED"
          rows={completed.map((p) => ({
            id: p.id,
            title: p.campaign.title,
            priceDinar: p.campaign.priceDinar,
            href: `/influencer/campaigns/${p.campaignId}`,
          }))}
        />

        <Section
          title="Confirmed"
          status="CONFIRMED"
          rows={confirmed.map((p) => ({
            id: p.id,
            title: p.campaign.title,
            priceDinar: p.campaign.priceDinar,
            href: `/influencer/campaigns/${p.campaignId}`,
          }))}
        />

        <Section
          title="Paid"
          status="PAID"
          rows={paid.map((p) => ({
            id: p.id,
            title: p.campaign.title,
            priceDinar: p.campaign.priceDinar,
            href: `/influencer/campaigns/${p.campaignId}`,
          }))}
        />
      </div>
    </AppShell>
  );
}
