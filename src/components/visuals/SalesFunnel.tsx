import { FunnelDiagram } from "./FunnelDiagram";

export function SalesFunnel() {
  return (
    <FunnelDiagram
      illustrative
      stages={[
        { name: "LEAD", explanation: "Shown some interest, identified and contactable.", example: "filled a 'request a demo' form", metric: "10,000 leads" },
        { name: "PROSPECT", explanation: "Responded to a follow-up.", example: "replied to a sales email", metric: "2,000 prospects" },
        { name: "QUALIFIED", explanation: "Has budget, authority, need, and timeline (BANT).", example: "confirmed budget on a call", metric: "500 qualified" },
        { name: "OPPORTUNITY", explanation: "Actively negotiating a deal.", example: "reviewing a proposal", metric: "100 opportunities" },
        { name: "CUSTOMER", explanation: "Signed and paying.", example: "signed the contract", metric: "25 customers" },
      ]}
    />
  );
}
