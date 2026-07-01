import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Navbar />

        <div className="content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}