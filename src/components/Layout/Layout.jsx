import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
