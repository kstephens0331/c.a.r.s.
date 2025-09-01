// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import Public/Portal Page Components
import HomePage from './pages/portal/HomePage.jsx';
import CustomerLogin from './pages/portal/CustomerLogin.jsx';
import RegisterPage from './pages/portal/RegisterPage.jsx';
import AboutPage from './pages/portal/AboutPage.jsx';
import CollisionRepairPage from './pages/portal/Services.jsx';
import ContactPage from './pages/portal/ContactPage.jsx';
import RepairGallery from './pages/portal/RepairGallery';
import CollisionRepair from './pages/portal/CollisionRepair';
import PaintAndRefinishPage from './pages/portal/PaintAndRefinishPage';
import CustomPaint from './pages/portal/CustomPaint';
import PaintlessDentRepair from './pages/portal/PaintlessDentRepair';
import BedlinersPage from './pages/portal/BedlinersPage';
import LightMechanicalPage from './pages/portal/LightMechanicalPage';
import FinancingPage from './pages/portal/FinancingPage.jsx';

// Import Admin Layout Component
import AdminLayout from './layouts/AdminLayout.jsx';

// Import Admin Sub-Page Components
import CustomerList from './pages/admin/CustomerList.jsx';
import AddCustomer from './pages/admin/AddCustomer.jsx';
import EditCustomer from './pages/admin/EditCustomer.jsx';
import WorkOrders from './pages/admin/WorkOrders.jsx';
import Inventory from './pages/admin/Inventory.jsx';
import Invoices from './pages/admin/Invoices.jsx';
import PhotoUploads from './pages/admin/PhotoUploads.jsx';
import AdminDashboardContent from './pages/admin/AdminDashboard.jsx';
import CustomerDetailsPage from './pages/admin/CustomerDetailsPage.jsx'; // NEW IMPORT

// Import Customer Portal Layout
import CustomerPortalLayout from './layouts/CustomerPortalLayout.jsx';

// Import Customer Portal Sub-Page Components
import Dashboard from './pages/portal/Dashboard.jsx';
import MyVehicles from './pages/portal/MyVehicles.jsx';
import RepairPhotos from './pages/portal/RepairPhotos.jsx';
import RepairUpdates from './pages/portal/RepairUpdates.jsx';
import AddVehicleForm from './pages/portal/AddVehicleForm.jsx';
import MyDocuments from './pages/portal/MyDocuments.jsx';
import VehicleDetailsPage from './pages/portal/VehicleDetailsPage.jsx';


// Import General Layout Components
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';


function App() {
  return (
    <HelmetProvider>
      <Router>
        {/* Navbar that appears on most public pages */}
        <Navbar />

        <main>
          <Routes>
            {/* Public-facing routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<CollisionRepairPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/repair-gallery" element={<RepairGallery />} />
            <Route path="/services/collision-repair" element={<CollisionRepair />} />
<Route path="/services/paint-refinish" element={<PaintAndRefinishPage />} />
<Route path="/services/custom-paint" element={<CustomPaint />} />
<Route path="/services/paintless-dent-repair" element={<PaintlessDentRepair />} />
<Route path="/services/bedliners-accessories" element={<BedlinersPage />} />
<Route path="/services/light-mechanical" element={<LightMechanicalPage />} />
<Route path="/financing" element={<FinancingPage />} />

            {/* Admin Routes - Nested under AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardContent />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/:id" element={<CustomerDetailsPage />} /> {/* NEW ROUTE */}
              <Route path="customers/add" element={<AddCustomer />} /> {/* Keep if you need a separate add customer form */}
              <Route path="customers/edit/:id" element={<EditCustomer />} /> {/* Keep if you need a separate edit form */}
              <Route path="work-orders" element={<WorkOrders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="photos" element={<PhotoUploads />} />
            </Route>

            {/* Customer Portal Routes - Nested under CustomerPortalLayout */}
            <Route path="/portal" element={<CustomerPortalLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="my-vehicles" element={<MyVehicles />} />
              <Route path="add-vehicle" element={<AddVehicleForm />} />
              <Route path="repair-updates" element={<RepairUpdates />} />
              <Route path="repair-photos" element={<RepairPhotos />} />
              <Route path="my-documents" element={<MyDocuments />} />
              <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
            </Route>

            {/* Optional: Add a catch-all for 404 Not Found pages */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </main>

        {/* Footer that appears on most public pages */}
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
