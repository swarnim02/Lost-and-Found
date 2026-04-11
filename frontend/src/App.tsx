import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/report-lost" element={<ProtectedRoute><ReportItemPage kind="lost" /></ProtectedRoute>} />
          <Route path="/report-found" element={<ProtectedRoute><ReportItemPage kind="found" /></ProtectedRoute>} />
          <Route path="/my-items" element={<ProtectedRoute><MyItemsPage /></ProtectedRoute>} />
          <Route path="/my-claims" element={<ProtectedRoute><MyClaimsPage /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<div>Page not found. <a href="/">Home</a></div>} />
        </Routes>
      </div>
    </>
  );
}
