import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  sampleClients,
  samplePolicies,
  sampleTasks,
  samplePipeline,
  sampleActivity,
} from '../data/sampleData';

const CRMContext = createContext(null);

export function CRMProvider({ children }) {
  const [clients, setClients] = useLocalStorage('crm_clients', sampleClients);
  const [policies, setPolicies] = useLocalStorage('crm_policies', samplePolicies);
  const [tasks, setTasks] = useLocalStorage('crm_tasks', sampleTasks);
  const [pipeline, setPipeline] = useLocalStorage('crm_pipeline', samplePipeline);
  const [activity, setActivity] = useLocalStorage('crm_activity', sampleActivity);

  // --- Clients ---
  const addClient = (client) => {
    const newClient = { ...client, id: `c${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setClients((prev) => [newClient, ...prev]);
    addActivity({ type: 'lead', clientId: newClient.id, clientName: `${newClient.firstName} ${newClient.lastName}`, text: 'New client added.' });
    return newClient;
  };

  const updateClient = (id, data) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setPolicies((prev) => prev.filter((p) => p.clientId !== id));
    setTasks((prev) => prev.filter((t) => t.clientId !== id));
  };

  const getClient = (id) => clients.find((c) => c.id === id);

  // --- Policies ---
  const addPolicy = (policy) => {
    const newPolicy = { ...policy, id: `p${Date.now()}` };
    setPolicies((prev) => [newPolicy, ...prev]);
    const client = getClient(policy.clientId);
    if (client) addActivity({ type: 'policy', clientId: client.id, clientName: `${client.firstName} ${client.lastName}`, text: `New ${policy.type} policy added (${policy.carrier}).` });
    return newPolicy;
  };

  const updatePolicy = (id, data) => {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deletePolicy = (id) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  const getPoliciesForClient = (clientId) => policies.filter((p) => p.clientId === clientId);

  // --- Tasks ---
  const addTask = (task) => {
    const newTask = { ...task, id: `t${Date.now()}`, completed: false, createdAt: new Date().toISOString().split('T')[0] };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id, data) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const getTasksForClient = (clientId) => tasks.filter((t) => t.clientId === clientId);

  // --- Pipeline ---
  const movePipelineItem = (itemId, fromStage, toStage) => {
    setPipeline((prev) => {
      const updated = { ...prev };
      const item = updated[fromStage].items.find((i) => i.id === itemId);
      if (!item) return prev;
      updated[fromStage] = { ...updated[fromStage], items: updated[fromStage].items.filter((i) => i.id !== itemId) };
      updated[toStage] = { ...updated[toStage], items: [...updated[toStage].items, item] };
      return updated;
    });
  };

  const addPipelineItem = (stage, item) => {
    const newItem = { ...item, id: `pi${Date.now()}` };
    setPipeline((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], items: [...prev[stage].items, newItem] },
    }));
  };

  const deletePipelineItem = (stage, itemId) => {
    setPipeline((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], items: prev[stage].items.filter((i) => i.id !== itemId) },
    }));
  };

  // --- Activity ---
  const addActivity = (entry) => {
    const newEntry = { ...entry, id: `a${Date.now()}`, date: new Date().toISOString().split('T')[0] };
    setActivity((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  // --- Stats ---
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const activePolicies = policies.filter((p) => p.status === 'Active').length;
    const totalPremium = policies.filter((p) => p.status === 'Active').reduce((s, p) => s + (p.annualPremium || 0), 0);
    const tasksDueToday = tasks.filter((t) => !t.completed && t.dueDate <= today).length;
    const pipelineValue = Object.values(pipeline).reduce((sum, stage) =>
      sum + stage.items.reduce((s, i) => s + (i.potentialPremium || 0), 0), 0);
    return { totalClients: clients.length, activePolicies, totalPremium, tasksDueToday, pipelineValue };
  };

  return (
    <CRMContext.Provider value={{
      clients, addClient, updateClient, deleteClient, getClient,
      policies, addPolicy, updatePolicy, deletePolicy, getPoliciesForClient,
      tasks, addTask, updateTask, deleteTask, toggleTask, getTasksForClient,
      pipeline, movePipelineItem, addPipelineItem, deletePipelineItem,
      activity, addActivity,
      getStats,
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error('useCRM must be used within CRMProvider');
  return ctx;
}
