import { NavLink } from "react-router-dom";
import useAuthStore from "../store/authStore";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", roles: ["admin", "manager", "cashier"] },
  { to: "/pos", label: "Point of Sale", roles: ["admin", "manager", "cashier"] },
  { to: "/products", label: "Products", roles: ["admin", "manager"] },
  { to: "/inventory", label: "Inventory", roles: ["admin", "manager"] },
  { to: "/orders", label: "Orders", roles: ["admin", "manager", "cashier"] },
  { to: "/stores", label: "Stores", roles: ["admin"] },
  { to: "/users", label: "Users", roles: ["admin"] },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const role = user?.role || "cashier";

  return (
    <div className="sidebar">
      <h2>POS</h2>
      {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/"}>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}
