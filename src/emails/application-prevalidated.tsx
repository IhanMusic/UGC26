import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface Props { companyName: string; influencerName: string; campaignTitle: string; applicantsUrl: string; }

export function ApplicationPrevalidatedTemplate({ companyName, influencerName, campaignTitle, applicantsUrl }: Props) {
  return (
    <Html><Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>Candidature pré-validée ✅</Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Bonjour {companyName},<br /><br />
            L&apos;admin a pré-validé la candidature de <strong>{influencerName}</strong> pour votre campagne <strong>&quot;{campaignTitle}&quot;</strong>.<br /><br />
            Vous pouvez maintenant le/la sélectionner et procéder au paiement.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button href={applicantsUrl} style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}>
              Voir les candidats validés
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
