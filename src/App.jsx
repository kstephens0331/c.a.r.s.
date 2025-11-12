// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import Error Boundary
import ErrorBoundary from './components/ErrorBoundary.jsx';

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
import WorkOrdersListView from './pages/admin/WorkOrdersListView.jsx';
import Inventory from './pages/admin/Inventory.jsx';
import Invoices from './pages/admin/Invoices.jsx';
import PhotoUploads from './pages/admin/PhotoUploads.jsx';
import AdminDashboardContent from './pages/admin/AdminDashboard.jsx';
import CustomerDetailsPage from './pages/admin/CustomerDetailsPage.jsx';

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
    <ErrorBoundary>
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

              {/* Admin Routes - Nested under AdminLayout with ErrorBoundary */}
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              }>
                <Route index element={<ErrorBoundary><AdminDashboardContent /></ErrorBoundary>} />
                <Route path="customers" element={<ErrorBoundary><CustomerList /></ErrorBoundary>} />
                <Route path="customers/:id" element={<ErrorBoundary><CustomerDetailsPage /></ErrorBoundary>} />
                <Route path="customers/add" element={<ErrorBoundary><AddCustomer /></ErrorBoundary>} />
                <Route path="customers/edit/:id" element={<ErrorBoundary><EditCustomer /></ErrorBoundary>} />
                <Route path="work-orders" element={<ErrorBoundary><WorkOrdersListView /></ErrorBoundary>} />
                <Route path="work-orders/details/:id" element={<ErrorBoundary><WorkOrders /></ErrorBoundary>} />
                <Route path="inventory" element={<ErrorBoundary><Inventory /></ErrorBoundary>} />
                <Route path="invoices" element={<ErrorBoundary><Invoices /></ErrorBoundary>} />
                <Route path="photos" element={<ErrorBoundary><PhotoUploads /></ErrorBoundary>} />
              </Route>

              {/* Customer Portal Routes - Nested under CustomerPortalLayout with ErrorBoundary */}
              <Route path="/portal" element={
                <ErrorBoundary>
                  <CustomerPortalLayout />
                </ErrorBoundary>
              }>
                <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="my-vehicles" element={<ErrorBoundary><MyVehicles /></ErrorBoundary>} />
                <Route path="add-vehicle" element={<ErrorBoundary><AddVehicleForm /></ErrorBoundary>} />
                <Route path="repair-updates" element={<ErrorBoundary><RepairUpdates /></ErrorBoundary>} />
                <Route path="repair-photos" element={<ErrorBoundary><RepairPhotos /></ErrorBoundary>} />
                <Route path="my-documents" element={<ErrorBoundary><MyDocuments /></ErrorBoundary>} />
                <Route path="vehicles/:id" element={<ErrorBoundary><VehicleDetailsPage /></ErrorBoundary>} />
              </Route>

              {/* Optional: Add a catch-all for 404 Not Found pages */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </main>

          {/* Footer that appears on most public pages */}
          <Footer />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
