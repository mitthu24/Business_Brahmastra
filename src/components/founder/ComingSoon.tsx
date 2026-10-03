import { Icon } from "@/components/nav/Icon";

/** Honest placeholder for a founder-panel section not yet built in this slice of Phase 5.3 -
 * never a fake/stubbed-out version of the real feature. See docs/PHASE-5.3.md "Known limitations"
 * for the planned order these get built in. */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{title}</h1>
      <p className="text-muted mb-6">{description}</p>
      <div className="card p-8 flex flex-col items-center text-center gap-3 text-muted">
        <Icon name="Construction" size={32} />
        <p className="text-sm max-w-sm">
          This section of the Founder Control Center hasn&apos;t been built yet. It&apos;s planned for a
          later step of Phase 5.3 - see docs/PHASE-5.3.md for the current roadmap.
        </p>
      </div>
    </div>
  );
}
