const apiBase = "/api/clients";

async function fetchClients() {
  const res = await fetch(apiBase);
  const data = await res.json();
  return data;
}

function rowForClient(c) {
  return `
    <tr data-id="${c._id}">
      <td>${escapeHtml(c.nombre || "")}</td>
      <td>${escapeHtml(c.email || "")}</td>
      <td>${escapeHtml(c.telefono || "")}</td>
      <td>${escapeHtml(c.direccion || "")}</td>
      <td>${c.created_at ? new Date(c.created_at).toLocaleString() : ""}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-edit">Editar</button>
        <button class="btn btn-sm btn-danger btn-delete">Eliminar</button>
      </td>
    </tr>
  `;
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function renderClients() {
  const tbody = document.querySelector("#clientsTable tbody");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";
  try {
    const clients = await fetchClients();
    if (!clients.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No hay clientes</td></tr>";
      return;
    }
    tbody.innerHTML = clients.map(rowForClient).join("");
    attachRowEvents();
  } catch (err) {
    tbody.innerHTML = "<tr><td colspan='6'>Error al cargar</td></tr>";
    console.error(err);
  }
}

function attachRowEvents() {
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = (e) => {
      const tr = e.target.closest("tr");
      const id = tr.getAttribute("data-id");
      openEditModal(tr, id);
    };
  });
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.onclick = async (e) => {
      if (!confirm("Eliminar cliente?")) return;
      const tr = e.target.closest("tr");
      const id = tr.getAttribute("data-id");
      try {
        const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
        if (res.ok) {
          await renderClients();
        } else {
          const err = await res.json();
          alert("Error: " + (err.error || err.message || "Unknown"));
        }
      } catch (err) {
        console.error(err); alert("Error de red");
      }
    };
  });
}

function openEditModal(tr, id) {
  const nombre = tr.children[0].textContent;
  const email = tr.children[1].textContent;
  const telefono = tr.children[2].textContent;
  const direccion = tr.children[3].textContent;

  document.getElementById("editId").value = id;
  document.getElementById("editNombre").value = nombre;
  document.getElementById("editEmail").value = email;
  document.getElementById("editTelefono").value = telefono;
  document.getElementById("editDireccion").value = direccion;

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

document.getElementById("formAdd").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = {
    nombre: form.nombre.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    direccion: form.direccion.value.trim()
  };
  try {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.status === 201) {
      form.reset();
      await renderClients();
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || err.message || "Unknown"));
    }
  } catch (err) {
    console.error(err); alert("Error de red");
  }
});

document.getElementById("formEdit").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const body = {
    nombre: document.getElementById("editNombre").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    telefono: document.getElementById("editTelefono").value.trim(),
    direccion: document.getElementById("editDireccion").value.trim()
  };
  try {
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const modalEl = document.getElementById("editModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      await renderClients();
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || err.message || "Unknown"));
    }
  } catch (err) {
    console.error(err); alert("Error de red");
  }
});

document.getElementById("btnRefresh").addEventListener("click", renderClients);

// inicial
renderClients();
