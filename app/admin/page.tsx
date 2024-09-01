import Button from "../ui/button";

export default async function AdminDashboard() {
  return (
    <main>
      <div>
        <h1>Admin Dashboard</h1>
      </div>
      <div>
        <span>Data</span>
      </div>
      <div>
        <Button navUrl="/api/logout">Logout</Button>
      </div>
    </main>
  )
};
