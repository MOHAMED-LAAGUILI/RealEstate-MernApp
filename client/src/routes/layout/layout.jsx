import "./layout.scss";
import { Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast'
function Layout() {
  return (
    <div className="layout">
      <div className="navbar">
      {/**<Navbar />*/}
      <Toaster />
      </div>
      <div className="content">
        <Outlet/>
      </div>
    </div>
  );
}

export default Layout;
