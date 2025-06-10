import React from 'react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import CollisionRepairPage from './pages/CollisionRepairPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CustomerLogin from './pages/CustomerLogin.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CustomerPortalLayout from './layouts/CustomerPortalLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Dashboard from './pages/portal/Dashboard.jsx';
import MyVehicles from './pages/portal/MyVehicles.jsx';
import RepairUpdates from './pages/portal/RepairUpdates.jsx';
import RepairPhotos from './pages/portal/RepairPhotos.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import WorkOrders from './pages/admin/WorkOrders.jsx';
import Inventory from './pages/admin/Inventory.jsx';
import Invoices from './pages/admin/Invoices.jsx';
import PhotoUploads from './pages/admin/PhotoUploads.jsx';
import CustomerList from './pages/admin/CustomerList.jsx';
import AddCustomer from './pages/admin/AddCustomer.jsx';
import EditCustomer from './pages/admin/EditCustomer.jsx';

function RootLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-accent text-primary p-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="collision-repair" element={<CollisionRepairPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="login" element={<CustomerLogin />} />
      <Route path="register" element={<RegisterPage />} />

      <Route path="portal" element={<CustomerPortalLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<MyVehicles />} />
        <Route path="repairs" element={<RepairUpdates />} />
        <Route path="photos" element={<RepairPhotos />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="photos" element={<PhotoUploads />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<AddCustomer />} />
        <Route path="customers/:id/edit" element={<EditCustomer />} />
      </Route>
    </Route>
  )
);

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
