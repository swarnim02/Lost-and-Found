import { Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { BrowsePage } from './pages/BrowsePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReportItemPage } from './pages/ReportItemPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { MyItemsPage } from './pages/MyItemsPage';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { InboxPage } from './pages/InboxPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/report-lost" element={<ProtectedRoute><ReportItemPage kind="lost" /></ProtectedRoute>} />
          <Route path="/report-found" element={<ProtectedRoute><ReportItemPage kind="found" /></ProtectedRoute>} />
          <Route path="/my-items" element={<ProtectedRoute><MyItemsPage /></ProtectedRoute>} />
          <Route path="/my-claims" element={<ProtectedRoute><MyClaimsPage /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<div className="empty"><h3>Page not found</h3><Link to="/" className="btn">Go home</Link></div>} />
        </Routes>
      </div>
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-logo" style={{ width: 22, height: 22, fontSize: 11 }}>LF</span>
          <strong>Lost &amp; Found</strong>
        </div>
        <div>SESD Capstone · Built with Express, TypeScript, MongoDB &amp; React</div>
      </footer>
    </>
  );
}
