export default function Home() {
  return (
    <section
      data-section="hero"
      className="px-6 py-16 text-center font-sans sm:px-10 sm:py-24"
    >
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        GhostShift
      </h1>
      <p
        data-testid="hero-tagline"
        className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 sm:text-xl"
      >
        Dark-factory automation that runs your production line without the lights on.
      </p>
    </section>
  );
}
