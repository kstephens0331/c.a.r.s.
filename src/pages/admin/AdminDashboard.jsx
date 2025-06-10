import { Helmet } from 'react-helmet-async';

export default function AdminDashboard() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Administrative overview and quick links to manage the shop."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-lg">
          Use the sidebar to manage customers, work orders, inventory and more.
        </p>
      </div>
    </>
  );
}
