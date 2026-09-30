
const API_URL = "http://127.0.0.1:8000/api/tasks/";

export async function getTasks() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load tasks");
  }

  const data = await response.json();


  return Array.isArray(data) ? data : data.results || [];
}


export async function createTask(taskData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}


export async function updateTask(id, taskData) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}


export async function deleteTask(id) {
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete task");
  }

  return true;
}