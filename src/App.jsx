import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import Policies from './pages/Policies/Policies';
import Pipeline from './pages/Pipeline/Pipeline';
import Tasks from './pages/Tasks/Tasks';

export default function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="policies" element={<Policies />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CRMProvider>
  );
}
