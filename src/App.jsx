// App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import Error Boundary
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Import General Layout Components (needed immediately)
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Eager load only the homepage for fastest initial load
import HomePage from './pages/portal/HomePage.jsx';

// Lazy load all other public pages
const CustomerLogin = lazy(() => import('./pages/portal/CustomerLogin.jsx'));
const RegisterPage = lazy(() => import('./pages/portal/RegisterPage.jsx'));
const AboutPage = lazy(() => import('./pages/portal/AboutPage.jsx'));
const CollisionRepairPage = lazy(() => import('./pages/portal/Services.jsx'));
const ContactPage = lazy(() => import('./pages/portal/ContactPage.jsx'));
const RepairGallery = lazy(() => import('./pages/portal/RepairGallery'));
const CollisionRepair = lazy(() => import('./pages/portal/CollisionRepair'));
const PaintAndRefinishPage = lazy(() => import('./pages/portal/PaintAndRefinishPage'));
const CustomPaint = lazy(() => import('./pages/portal/CustomPaint'));
const PaintlessDentRepair = lazy(() => import('./pages/portal/PaintlessDentRepair'));
const BedlinersPage = lazy(() => import('./pages/portal/BedlinersPage'));
const LightMechanicalPage = lazy(() => import('./pages/portal/LightMechanicalPage'));
const FinancingPage = lazy(() => import('./pages/portal/FinancingPage.jsx'));

// Lazy load Admin Layout and Components
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const CustomerList = lazy(() => import('./pages/admin/CustomerList.jsx'));
const AddCustomer = lazy(() => import('./pages/admin/AddCustomer.jsx'));
const EditCustomer = lazy(() => import('./pages/admin/EditCustomer.jsx'));
const WorkOrders = lazy(() => import('./pages/admin/WorkOrders.jsx'));
const WorkOrdersListView = lazy(() => import('./pages/admin/WorkOrdersListView.jsx'));
const Inventory = lazy(() => import('./pages/admin/Inventory.jsx'));
const Invoices = lazy(() => import('./pages/admin/Invoices.jsx'));
const PhotoUploads = lazy(() => import('./pages/admin/PhotoUploads.jsx'));
const AdminDashboardContent = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const CustomerDetailsPage = lazy(() => import('./pages/admin/CustomerDetailsPage.jsx'));

// Lazy load Customer Portal Layout and Components
const CustomerPortalLayout = lazy(() => import('./layouts/CustomerPortalLayout.jsx'));
const Dashboard = lazy(() => import('./pages/portal/Dashboard.jsx'));
const MyVehicles = lazy(() => import('./pages/portal/MyVehicles.jsx'));
const RepairPhotos = lazy(() => import('./pages/portal/RepairPhotos.jsx'));
const RepairUpdates = lazy(() => import('./pages/portal/RepairUpdates.jsx'));
const AddVehicleForm = lazy(() => import('./pages/portal/AddVehicleForm.jsx'));
const MyDocuments = lazy(() => import('./pages/portal/MyDocuments.jsx'));
const VehicleDetailsPage = lazy(() => import('./pages/portal/VehicleDetailsPage.jsx'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    color: '#f8f1e7'
  }}>
    <div>Loading...</div>
  </div>
);


function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          {/* Navbar that appears on most public pages */}
          <Navbar />

          <main>
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </main>

          {/* Footer that appears on most public pages */}
          <Footer />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
