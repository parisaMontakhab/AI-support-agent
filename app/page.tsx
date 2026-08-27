import Link from "next/link";
import { ChatPreview } from "@/components/chat/chat-preview";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Navbar />

      <main className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <section className="min-w-0">
          <p className="text-sm font-medium text-primary">
            AI customer support
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Support that feels calm, clear, and personal.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-muted sm:text-lg">
            Aria is an intelligent assistant for shoppers. Ask about orders,
            returns, shipping, and products — in one simple conversation.
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Start Chat
          </Link>
        </section>

        <section className="min-w-0" aria-hidden="true">
          <ChatPreview />
        </section>
      </main>
    </div>
  );
}
