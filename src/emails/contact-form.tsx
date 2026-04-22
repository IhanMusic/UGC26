import { Html, Head, Body, Container, Text, Hr } from "@react-email/components";

interface Props { senderName: string; senderEmail: string; subject: string; message: string; }

export function ContactFormTemplate({ senderName, senderEmail, subject, message }: Props) {
  return (
    <Html><Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 4 }}>[Contact UGC26] {subject}</Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>De : {senderName} &lt;{senderEmail}&gt;</Text>
          <Hr style={{ borderColor: "#e2e8f0", marginBottom: 16 }} />
          <Text style={{ color: "#334155", whiteSpace: "pre-wrap" }}>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
