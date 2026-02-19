import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard</h1>

      <p>
        Signed in as:{" "}
        <strong>
          {user?.emailAddresses?.[0]?.emailAddress ?? "Unknown email"}
        </strong>
      </p>

      <p>User ID: {user?.id}</p>
    </main>
  );
}
