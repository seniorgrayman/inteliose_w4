export default async function DashboardPage() {
  // Kept as a simple landing that matches the first dashboard section.
  const Overview = (await import("./overview/page")).default;
  return <Overview />;
}

