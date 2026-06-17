import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { PrivateRoute } from './components/common/PrivateRoute';

// Pages (lazy loaded)
import { lazy, Suspense, useState } from 'react';
import { Loader } from './components/common/Loader';
import { SplashScreen } from './components/common/SplashScreen';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const PropertyListPage = lazy(() => import('./pages/PropertyListPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const AuctionsListPage = lazy(() => import('./pages/AuctionsListPage'));
const AuctionRoomPage = lazy(() => import('./pages/AuctionRoomPage'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AddPropertyPage = lazy(() => import('./pages/AddPropertyPage'));
const MyPropertiesPage = lazy(() => import('./pages/MyPropertiesPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DocumentUploadPage = lazy(() => import('./pages/DocumentUploadPage'));

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/properties" element={<PropertyListPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/auctions" element={<AuctionsListPage />} />
              <Route path="/auctions/:id" element={<AuctionRoomPage />} />
              <Route path="/membership" element={<MembershipPage />} />

              {/* Protected – Buyer */}
              <Route element={<PrivateRoute allowedRoles={['buyer']} />}>
                <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              </Route>

              {/* Protected – Seller */}
              <Route element={<PrivateRoute allowedRoles={['seller']} />}>
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/add-property" element={<AddPropertyPage />} />
                <Route path="/seller/my-properties" element={<MyPropertiesPage />} />
                <Route path="/seller/payments" element={<PaymentsPage />} />
                <Route path="/seller/documents" element={<DocumentUploadPage />} />
              </Route>

              {/* Protected – Admin */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Protected – All authenticated */}
              <Route element={<PrivateRoute allowedRoles={['buyer', 'seller', 'admin']} />}>
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <MobileNav />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{ style: { background: '#0A0A0A', border: '1px solid #1A1A1A', color: '#fff' } }}
        />
      </div>
    </BrowserRouter>
  );
}
