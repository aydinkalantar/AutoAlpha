import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ZombieReminderEmailProps {
  userName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autoalpha.ai";

export const ZombieReminderEmail = ({
  userName = "Trader",
}: ZombieReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Complete your AutoAlpha setup to start automated trading.</Preview>
      <Tailwind>
        <Body className="bg-[#0B0D14] my-auto mx-auto font-sans px-2">
          <Container className="border border-white/10 rounded-[20px] my-[40px] mx-auto p-[20px] max-w-[465px] bg-[#11131F]">
            
            {/* Header / Logo Simulation */}
            <Section className="mt-[20px] mb-[30px] text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                 <div className="w-4 h-4 bg-white rotate-45 rounded-sm" />
              </div>
            </Section>

            <Heading className="text-white text-[24px] font-bold text-center p-0 my-[30px] mx-0 tracking-tight">
              Action Required: Connect Your Exchange
            </Heading>
            
            <Text className="text-white/80 text-[15px] leading-[24px]">
              Hi {userName},
            </Text>
            
            <Text className="text-white/80 text-[15px] leading-[24px]">
              We noticed you created an AutoAlpha account but haven't connected your exchange API keys yet. Your algorithmic trading terminal is currently suspended and won't execute trades in the market.
            </Text>
            
            <Text className="text-white/80 text-[15px] leading-[24px]">
              You can complete your setup in under two minutes by securely linking your Binance or Bybit read-only execution credentials.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-emerald-500 rounded-lg text-white text-[14px] font-bold no-underline text-center px-6 py-3"
                href={`${baseUrl}/dashboard/account`}
              >
                Connect Exchange API &rarr;
              </Button>
            </Section>
            
            <Text className="text-white/60 text-[14px] leading-[24px]">
              Our platform uses end-to-end AES-256 encryption. We can never withdraw funds from your exchange—AutoAlpha only negotiates read-only and Spot execution rights.
            </Text>

            <Hr className="border border-solid border-white/10 my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you have any questions about API security or need help generating your keys, reply to this email to reach our engineering team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ZombieReminderEmail;
