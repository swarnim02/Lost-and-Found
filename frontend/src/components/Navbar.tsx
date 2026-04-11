import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand">Lost &amp; Found</Link>
      <Link to="/">Browse</Link>
      {user && <Link to="/report-lost">Report Lost</Link>}
      {user && <Link to="/report-found">Report Found</Link>}
      {user && <Link to="/my-items">My Items</Link>}
      {user && <Link to="/my-claims">My Claims</Link>}
      {user && <Link to="/inbox">Inbox</Link>}
      {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      <div className="spacer" />
      {user ? (
        <>
          <span className="muted">{user.name} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
