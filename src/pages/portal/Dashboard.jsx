import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom'; // Import Link

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | C.A.R.S Collision & Refinish Shop</title>
        <meta
          name="description"
          content="Customer dashboard for tracking your vehicle repairs, viewing updates, and managing your account."
        />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>

        <p className="text-lg">
          Here you can track your vehicle repairs, view progress updates, and access your repair photos.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* My Vehicles Box - Now Clickable */}
          <Link to="/portal/my-vehicles" className="block"> {/* Use Link for navigation */}
            <div className="bg-accent p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">My Vehicles</h2>
              <p>See all vehicles linked to your account.</p>
            </div>
          </Link>

          {/* Repair Updates Box - Now Clickable */}
          <Link to="/portal/repair-updates" className="block"> {/* Use Link for navigation */}
            <div className="bg-accent p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Repair Updates</h2>
              <p>Follow real-time repair progress and notifications.</p>
            </div>
          </Link>

          {/* Repair Photos Box - Now Clickable */}
          <Link to="/portal/repair-photos" className="block"> {/* Use Link for navigation */}
            <div className="bg-accent p-6 rounded-lg shadow hover:shadow-md transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Repair Photos</h2>
              <p>View images from each stage of your repair.</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}