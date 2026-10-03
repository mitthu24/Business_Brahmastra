import { TamSamSom } from "@/components/visuals/TamSamSom";
import { MarketingFunnel } from "@/components/visuals/MarketingFunnel";
import { SalesFunnel } from "@/components/visuals/SalesFunnel";
import { AarrrFunnel } from "@/components/visuals/AarrrFunnel";
import { SwotMatrix } from "@/components/visuals/SwotMatrix";
import { PortersFiveForces } from "@/components/visuals/PortersFiveForces";
import { PnLDiagram } from "@/components/visuals/PnLDiagram";
import { BreakEvenChart } from "@/components/visuals/BreakEvenChart";
import { UnitEconomicsDiagram } from "@/components/visuals/UnitEconomicsDiagram";
import { FundingDilutionDiagram } from "@/components/visuals/FundingDilutionDiagram";
import { DiagramCard } from "@/components/ui/DiagramCard";

/** Maps a lesson day to the diagram that best illustrates its concept, rendered below the lesson's written content. */
export function getLessonDiagram(day: number): React.ReactNode | null {
  switch (day) {
    case 18:
      return (
        <DiagramCard title="TAM → SAM → SOM" description="Sizing a market from the total opportunity down to what you can realistically win.">
          <TamSamSom />
        </DiagramCard>
      );
    case 33:
      return (
        <DiagramCard title="Marketing Funnel" description="The stages a customer moves through, from first hearing about you to recommending you.">
          <MarketingFunnel />
        </DiagramCard>
      );
    case 38:
      return (
        <DiagramCard title="Sales Funnel" description="How a lead narrows down into a paying customer, stage by stage.">
          <SalesFunnel />
        </DiagramCard>
      );
    case 52:
      return (
        <DiagramCard title="P&L Waterfall" description="Click each layer to see what it means.">
          <PnLDiagram />
        </DiagramCard>
      );
    case 56:
      return (
        <DiagramCard title="Break-even Chart" description="Illustrative example: Fixed Costs ₹2,00,000, Price ₹1,000/unit, Variable Cost ₹600/unit." footnote="Try the live version in the Break-even Calculator.">
          <BreakEvenChart fixedCosts={200000} sellingPrice={1000} variableCost={600} />
        </DiagramCard>
      );
    case 57:
      return (
        <DiagramCard title="Unit Economics" description="Illustrative example: ₹500/month ARPU, 20-month lifetime, ₹2,500 CAC." footnote="Try the live version in the LTV Calculator.">
          <UnitEconomicsDiagram arpu={500} lifetimeMonths={20} cac={2500} />
        </DiagramCard>
      );
    case 73:
      return (
        <DiagramCard title="Funding & Dilution" description="Illustrative example: ₹9 crore pre-money, ₹1 crore investment." footnote="Try the live version in the Dilution Calculator.">
          <FundingDilutionDiagram previousOwnershipPercent={100} newInvestorOwnershipPercent={10} />
        </DiagramCard>
      );
    case 76:
      return (
        <DiagramCard title="AARRR Growth Framework" description="Acquisition, Activation, Retention, Revenue, Referral.">
          <AarrrFunnel />
        </DiagramCard>
      );
    case 82:
      return (
        <DiagramCard title="SWOT Matrix" description="Click a quadrant for an example.">
          <SwotMatrix />
        </DiagramCard>
      );
    case 83:
      return (
        <DiagramCard title="Porter's Five Forces" description="Five pressures that shape an industry's profit potential.">
          <PortersFiveForces />
        </DiagramCard>
      );
    default:
      return null;
  }
}
