import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h3>Omnichannel POS System</h3>
      <div className="navbar-right">
        <div className="navbar-user">
          <span className="user-name">{user?.name || "User"}</span>
          <span className="user-role">{user?.role || ""}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
