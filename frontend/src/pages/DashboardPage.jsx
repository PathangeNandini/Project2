import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Frontend Week 1 Dashboard</h1>
          <p>Authentication and route protection completed</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-box">
          <h3>User Name</h3>
          <p>{user?.name || "N/A"}</p>
        </div>

        <div className="dashboard-box">
          <h3>User Role</h3>
          <p>{user?.role || "N/A"}</p>
        </div>

        <div className="dashboard-box">
          <h3>Status</h3>
          <p>Logged in successfully</p>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;