import { FunnelDiagram } from "./FunnelDiagram";

export function MarketingFunnel() {
  return (
    <FunnelDiagram
      illustrative
      stages={[
        { name: "AWARENESS", explanation: "A potential customer first hears about you.", example: "sees an Instagram ad", metric: "100,000 reached" },
        { name: "INTEREST", explanation: "They want to know more.", example: "clicks through to your website", metric: "10,000 visits" },
        { name: "CONSIDERATION", explanation: "They compare you against alternatives.", example: "reads reviews, compares pricing", metric: "2,000 compare" },
        { name: "CONVERSION", explanation: "They buy.", example: "completes checkout", metric: "400 customers" },
        { name: "RETENTION", explanation: "They come back.", example: "makes a repeat purchase", metric: "250 repeat" },
        { name: "ADVOCACY", explanation: "They recommend you to others.", example: "refers a friend", metric: "60 referrals" },
      ]}
    />
  );
}
