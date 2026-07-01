import { NavLink } from "react-router-dom";

export default function Sidebar() {

    return (

        <div className="sidebar">

            <h2>POS</h2>

            <NavLink to="/">Dashboard</NavLink>

            <NavLink to="/products">Products</NavLink>

            <NavLink to="/inventory">Inventory</NavLink>

            <NavLink to="/orders">Orders</NavLink>

            <NavLink to="/stores">Stores</NavLink>

            <NavLink to="/users">Users</NavLink>

            <NavLink to="/pos">POS</NavLink>

        </div>

    );
}