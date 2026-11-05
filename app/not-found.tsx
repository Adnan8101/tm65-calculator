import { LinkButton } from "@/components/ui";
import { LostArt } from "@/components/art2";

export default function NotFound() {
  return (
    <div className="rise mx-auto max-w-md px-6 py-24 text-center">
      <LostArt className="mx-auto h-40 w-56" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-2 text-ink-2">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton href="/">Back home</LinkButton>
        <LinkButton href="/calculator" kind="secondary">
          Open calculator
        </LinkButton>
      </div>
    </div>
  );
}
