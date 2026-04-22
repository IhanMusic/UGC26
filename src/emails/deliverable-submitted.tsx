import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface Props { companyName: string; influencerName: string; campaignTitle: string; deliverablesUrl: string; }

export function DeliverableSubmittedTemplate({ companyName, influencerName, campaignTitle, deliverablesUrl }: Props) {
  return (
    <Html><Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>Nouveau livrable soumis 📦</Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Bonjour {companyName},<br /><br />
            <strong>{influencerName}</strong> a soumis un livrable pour la campagne <strong>&quot;{campaignTitle}&quot;</strong>.<br />
            Veuillez le réviser et approuver ou rejeter.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button href={deliverablesUrl} style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}>
              Voir le livrable
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
