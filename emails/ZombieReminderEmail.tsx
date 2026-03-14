import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import React from 'react';

export default function ZombieReminderEmail({
    userName = 'Investor',
}: {
    userName?: string;
}) {
    return (
        <Html>
            <Head />
            <Preview>Need help setting up AutoAlpha? 🤖</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Need help setting up AutoAlpha? 🤖</Heading>
                    <Text style={text}>Hi {userName},</Text>
                    <Text style={text}>
                        We noticed you created an AutoAlpha account but haven't connected your exchange API yet.
                    </Text>
                    <Text style={text}>
                        Because our platform is 100% non-custodial, you must connect a Read/Trade API key to deploy your first strategy. It takes exactly 60 seconds.
                    </Text>
                    
                    <Section style={stepsContainer}>
                        <Text style={stepText}>1. Log in to your exchange (e.g. Binance, Bybit)</Text>
                        <Text style={stepText}>2. Create a new API Key with Read & Trade permissions (No Withdrawals)</Text>
                        <Text style={stepText}>3. Paste the keys into AutoAlpha</Text>
                    </Section>

                    <Section style={buttonContainer}>
                        <Button style={button} href="https://autoalpha.io/dashboard/settings">
                            Connect Your API Now
                        </Button>
                    </Section>

                    <Text style={text}>
                        If you need any help, check out our <Link href="https://docs.autoalpha.io" style={link}>documentation</Link> or reply directly to this email!
                    </Text>

                    <Text style={footer}>
                        — The AutoAlpha Team
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#000000',
    color: '#ffffff',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '560px',
    backgroundColor: '#111111',
    borderRadius: '12px',
    border: '1px solid #333333',
};

const h1 = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '30px 0',
    padding: '0',
    textAlign: 'center' as const,
};

const text = {
    color: '#e0e0e0',
    fontSize: '16px',
    lineHeight: '24px',
    marginBottom: '20px',
};

const stepsContainer = {
    backgroundColor: '#1a1a1a',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #333333',
};

const stepText = {
    color: '#cccccc',
    fontSize: '14px',
    margin: '8px 0',
};

const buttonContainer = {
    textAlign: 'center' as const,
    marginTop: '32px',
    marginBottom: '32px',
};

const button = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    color: '#000000',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 24px',
    fontWeight: 'bold',
};

const link = {
    color: '#60a5fa',
    textDecoration: 'underline',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    marginTop: '48px',
};
