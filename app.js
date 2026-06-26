const STORAGE_KEY = "todos";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const footer = document.getElementById("footer");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

function getActiveCount() {
  return todos.filter((t) => !t.completed).length;
}

function render() {
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const message =
      currentFilter === "all"
        ? "暂无任务，添加一条开始吧"
        : currentFilter === "active"
          ? "没有进行中的任务"
          : "没有已完成的任务";

    todoList.innerHTML = `
      <li class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
        ${message}
      </li>`;
  } else {
    todoList.innerHTML = filtered
      .map(
        (todo) => `
      <li class="todo-item${todo.completed ? " completed" : ""}" data-id="${todo.id}">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? "checked" : ""}
          aria-label="标记完成"
        >
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button type="button" class="btn-delete" aria-label="删除任务">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </li>`
      )
      .join("");
  }

  const active = getActiveCount();
  todoCount.textContent = `${active} 项待办`;
  footer.hidden = todos.length === 0;
  clearCompleted.hidden = !todos.some((t) => t.completed);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: createId(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompletedTodos() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;

  if (e.target.closest(".btn-delete")) {
    deleteTodo(id);
  } else if (e.target.closest(".todo-checkbox")) {
    toggleTodo(id);
  }
});

clearCompleted.addEventListener("click", clearCompletedTodos);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

render();
