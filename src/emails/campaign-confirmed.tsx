import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface Props { influencerName: string; campaignTitle: string; netAmountDinar: number; paymentsUrl: string; }

export function CampaignConfirmedTemplate({ influencerName, campaignTitle, netAmountDinar, paymentsUrl }: Props) {
  return (
    <Html><Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>Campagne confirmée 🎉</Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Bonjour {influencerName},<br /><br />
            L&apos;entreprise a confirmé l&apos;achèvement de la campagne <strong>&quot;{campaignTitle}&quot;</strong>.<br /><br />
            Vous recevrez <strong>{netAmountDinar.toLocaleString("fr-DZ")} DZD</strong> une fois le paiement traité.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button href={paymentsUrl} style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}>
              Voir mes paiements
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
