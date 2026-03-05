/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join Stammerly ✨</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>✨ Stammerly</Text>
        <Heading style={h1}>You're invited!</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>Stammerly</strong>
          </Link>
          — a collaborative speech therapy platform empowering every voice.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Poppins', 'Inter', Arial, sans-serif" }
const container = { padding: '40px 30px' }
const brand = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#1a2a6c',
  margin: '0 0 24px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0d1536',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#5c606b',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const link = { color: '#1a2a6c', textDecoration: 'underline' }
const button = {
  backgroundColor: '#1a2a6c',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
