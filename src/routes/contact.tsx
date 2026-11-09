import { createFileRoute } from "@tanstack/react-router";
import { SplitReveal } from "@/components/gs/Reveal";
import { faq } from "@/lib/content";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact & FAQ — Global Students" }, { name: "description", content: "Questions fréquentes et contact Global Students." }, { property: "og:title", content: "Contact & FAQ — Global Students" }, { property: "og:description", content: "Questions fréquentes et contact Global Students." }] }),
  component: Page,
});
function Page() {
  return (
    <div className="container-gs pb-24 pt-36">
      <p className="label text-muted-foreground">Contact & FAQ</p>
      <SplitReveal as="h1" text="Une question ?" className="display display-xl mt-4" immediate />
      <div className="mt-16 divide-y divide-border border-y border-border">{faq.map((f) => <details key={f.q} className="py-6"><summary className="display cursor-pointer text-3xl">{f.q}</summary><p className="mt-3 max-w-2xl text-muted-foreground">{f.r}</p></details>)}</div>
    </div>
  );
}
