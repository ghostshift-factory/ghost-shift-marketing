export default function Home() {
  return (
    <>
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
      <section
        data-section="product-description"
        className="px-6 py-16 font-sans sm:px-10 sm:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What is GhostShift?
          </h2>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl">
            GhostShift is a dark-factory automation platform built to keep your
            production line running around the clock, with no operators on the
            floor and no lights left on. It orchestrates robotics, sensors, and
            scheduling into a single system so manufacturing can continue
            unattended, shift after shift.
          </p>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Instead of bolting automation onto an existing line, GhostShift is
            designed from the ground up for lights-out operation: it monitors
            every station in real time, adapts to changing conditions, and
            hands off decisions to your team only when something truly needs a
            human.
          </p>
        </div>
      </section>
    </>
  );
}
