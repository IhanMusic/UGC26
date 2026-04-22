import { Html, Head, Body, Container, Text, Button, Hr, Section } from "@react-email/components";

interface Props { firstName: string; resetUrl: string; }

export function ForgotPasswordTemplate({ firstName, resetUrl }: Props) {
  return (
    <Html><Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>Bonjour {firstName},</Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.</Text>
          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Button href={resetUrl} style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e2e8f0" }} />
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 16 }}>Ce lien expire dans 1 heure. Si vous n&apos;avez pas fait cette demande, ignorez cet email.</Text>
        </Container>
      </Body>
    </Html>
  );
}
