const STORAGE_KEY = "crm-interactivo-contactos";
const THEME_KEY = "crm-interactivo-tema";

const initialContacts = [
  {
    id: crypto.randomUUID(),
    name: "Lucía Martínez",
    company: "Nova Retail",
    email: "lucia@novaretail.com",
    phone: "+34 611 000 123",
    status: "propuesta",
    value: 12000,
    nextTask: "Enviar contrato",
    notes: "Interesada en módulo de automatización.",
  },
  {
    id: crypto.randomUUID(),
    name: "Carlos Vega",
    company: "Iberia Labs",
    email: "carlos@iberialabs.es",
    phone: "+34 622 455 908",
    status: "contactado",
    value: 5400,
    nextTask: "Demo el jueves",
    notes: "Solicita integraciones con ERP.",
  },
];

let contacts = loadContacts();

const form = document.getElementById("contactForm");
const formTitle = document.getElementById("formTitle");
const contactIdInput = document.getElementById("contactId");
const list = document.getElementById("contactList");
const template = document.getElementById("contactTemplate");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const resetFormBtn = document.getElementById("resetForm");
const themeToggle = document.getElementById("themeToggle");

const statusMap = {
  lead: "Lead",
  contactado: "Contactado",
  propuesta: "Propuesta",
  cliente: "Cliente",
};

form.addEventListener("submit", onSaveContact);
searchInput.addEventListener("input", renderContacts);
statusFilter.addEventListener("change", renderContacts);
resetFormBtn.addEventListener("click", resetForm);
themeToggle.addEventListener("click", toggleTheme);

initTheme();
renderContacts();
updateKpis();

function loadContacts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialContacts));
    return [...initialContacts];
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialContacts));
    return [...initialContacts];
  }
}

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

function onSaveContact(event) {
  event.preventDefault();

  const data = {
    id: contactIdInput.value || crypto.randomUUID(),
    name: document.getElementById("name").value.trim(),
    company: document.getElementById("company").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    status: document.getElementById("status").value,
    value: Number(document.getElementById("value").value),
    nextTask: document.getElementById("nextTask").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };

  if (!data.name || !data.company || !data.email || !data.phone || Number.isNaN(data.value)) {
    return;
  }

  const existingIndex = contacts.findIndex((contact) => contact.id === data.id);
  if (existingIndex >= 0) {
    contacts[existingIndex] = data;
  } else {
    contacts.unshift(data);
  }

  saveContacts();
  resetForm();
  renderContacts();
  updateKpis();
}

function renderContacts() {
  const search = searchInput.value.toLowerCase().trim();
  const status = statusFilter.value;

  list.innerHTML = "";

  const filtered = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(search) ||
      contact.company.toLowerCase().includes(search);
    const matchesStatus = status === "all" || contact.status === status;
    return matchesSearch && matchesStatus;
  });

  if (!filtered.length) {
    const empty = document.createElement("li");
    empty.textContent = "No hay contactos que coincidan con los filtros.";
    empty.className = "panel";
    list.appendChild(empty);
    return;
  }

  filtered.forEach((contact) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-name").textContent = contact.name;
    node.querySelector(".card-company").textContent = contact.company;
    node.querySelector(".card-meta").textContent = `${contact.email} · ${contact.phone}`;
    node.querySelector(".card-notes").textContent =
      contact.nextTask ? `Próxima tarea: ${contact.nextTask}` : "Sin tarea definida";

    const badge = node.querySelector(".badge");
    badge.textContent = `${statusMap[contact.status]} · €${Number(contact.value).toLocaleString("es-ES")}`;

    node.querySelector(".edit").addEventListener("click", () => fillForm(contact));
    node.querySelector(".delete").addEventListener("click", () => removeContact(contact.id));

    list.appendChild(node);
  });
}

function fillForm(contact) {
  formTitle.textContent = `Editando: ${contact.name}`;
  contactIdInput.value = contact.id;
  document.getElementById("name").value = contact.name;
  document.getElementById("company").value = contact.company;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;
  document.getElementById("status").value = contact.status;
  document.getElementById("value").value = contact.value;
  document.getElementById("nextTask").value = contact.nextTask;
  document.getElementById("notes").value = contact.notes;
}

function removeContact(id) {
  contacts = contacts.filter((contact) => contact.id !== id);
  saveContacts();
  renderContacts();
  updateKpis();
}

function resetForm() {
  form.reset();
  document.getElementById("value").value = 1000;
  contactIdInput.value = "";
  formTitle.textContent = "Nuevo contacto";
}

function updateKpis() {
  const leads = contacts.length;
  const revenue = contacts.reduce((acc, contact) => acc + Number(contact.value || 0), 0);
  const tasks = contacts.filter((contact) => contact.nextTask).length;

  document.getElementById("kpiLeads").textContent = String(leads);
  document.getElementById("kpiRevenue").textContent = `€${revenue.toLocaleString("es-ES")}`;
  document.getElementById("kpiTasks").textContent = String(tasks);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Tema claro";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️ Tema claro" : "🌙 Tema oscuro";
}
