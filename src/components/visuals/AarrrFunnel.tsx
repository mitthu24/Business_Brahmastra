import { FunnelDiagram } from "./FunnelDiagram";

export function AarrrFunnel() {
  return (
    <FunnelDiagram
      illustrative
      stages={[
        { name: "ACQUISITION", explanation: "A new user discovers and tries your product.", example: "downloads the app from an ad", metric: "5,000 installs" },
        { name: "ACTIVATION", explanation: "They experience the core value for the first time.", example: "completes their first order", metric: "35% activation rate" },
        { name: "RETENTION", explanation: "They keep coming back.", example: "orders again within 30 days", metric: "92% monthly retention" },
        { name: "REVENUE", explanation: "They pay.", example: "upgrades to a paid plan", metric: "₹500 ARPU" },
        { name: "REFERRAL", explanation: "They bring others.", example: "shares a referral code", metric: "5% referral rate" },
      ]}
    />
  );
}
