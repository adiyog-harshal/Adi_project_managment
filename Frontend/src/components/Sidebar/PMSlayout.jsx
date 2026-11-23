import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

import "./PMSLayout.css";

const PMSLayout = () => {
  return (
    <div className="pms-layout">

      <Sidebar />

      <main className="pms-main-content">
        <Outlet />
      </main>

    </div>
  );
};

export default PMSLayout;