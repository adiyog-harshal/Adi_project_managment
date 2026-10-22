import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import taskManagementLogo from "../assets/task-management-logo.svg";

const emptyTaskForm = {
  title: "",
  project: "",
  assignedTo: "",
  priority: "",
  status: "",
  startDate: "",
  endDate: "",
};

const getNextDate = (date) => {
  if (!date) return undefined;

  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
};

const Tasks = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [openActionTaskId, setOpenActionTaskId] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, right: 8 });
  const actionButtonRef = React.useRef(null);
  const actionMenuRef = React.useRef(null);
  const [dateError, setDateError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Login Page",
      project: "Project Management",
      assignedTo: "Sanket",
      priority: "High",
      status: "In Progress",
      startDate: "2026-09-20",
      endDate: "2026-09-30",
    },
    {
      id: 2,
      title: "Create Authentication API",
      project: "Backend System",
      assignedTo: "Rahul",
      priority: "Medium",
      status: "Completed",
      startDate: "2026-09-18",
      endDate: "2026-09-28",
    },
    {
      id: 3,
      title: "Database Configuration",
      project: "Backend System",
      assignedTo: "Amit",
      priority: "Low",
      status: "Pending",
      startDate: "2026-09-25",
      endDate: "2026-10-02",
    },
  ]);

  const [newTask, setNewTask] = useState(emptyTaskForm);

  const handleChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "startDate" || e.target.name === "endDate") {
      setDateError("");
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.startDate || !newTask.endDate || newTask.endDate <= newTask.startDate) {
      setDateError("End date must be after the start date.");
      return;
    }

    const task = {
      ...newTask,
      title: newTask.title.trim(),
      id: editingTaskId ?? Math.max(0, ...tasks.map((item) => item.id)) + 1,
    };
    setTasks((currentTasks) => editingTaskId
      ? currentTasks.map((item) => item.id === editingTaskId ? task : item)
      : [...currentTasks, task]);
    if (!editingTaskId) {
      setCurrentPage(Math.ceil((tasks.length + 1) / pageSize));
    }
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTaskId(null);
    setNewTask(emptyTaskForm);
    setDateError("");
  };

  const handleAddTask = () => {
    setOpenActionTaskId(null);
    setEditingTaskId(null);
    setNewTask(emptyTaskForm);
    setDateError("");
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setOpenActionTaskId(null);
    setEditingTaskId(task.id);
    setNewTask({
      ...emptyTaskForm,
      ...task,
      startDate: task.startDate || "",
      endDate: task.endDate || task.dueDate || "",
    });
    setShowForm(true);
  };

  const handleDeleteTask = (taskId) => {
    setOpenActionTaskId(null);
    if (window.confirm("Delete this task?")) {
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    }
  };

  const visibleTasks = tasks.filter((task) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = [task.title, task.project, task.assignedTo]
      .some((value) => value.toLowerCase().includes(query));
    const matchesProject = projectFilter === "All Projects" || task.project === projectFilter;
    const matchesStatus = statusFilter === "All Status" || task.status === statusFilter;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const pageCount = Math.max(1, Math.ceil(visibleTasks.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const firstTaskIndex = visibleTasks.length ? (activePage - 1) * pageSize + 1 : 0;
  const lastTaskIndex = Math.min(activePage * pageSize, visibleTasks.length);
  const pageTasks = visibleTasks.slice(firstTaskIndex - 1, lastTaskIndex);
  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  React.useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, pageCount));
  }, [pageCount]);

  React.useEffect(() => {
    if (openActionTaskId === null) return undefined;

    const closeMenu = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && (
        actionButtonRef.current?.contains(event.target) ||
        actionMenuRef.current?.contains(event.target)
      )) return;
      setOpenActionTaskId(null);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeMenu);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeMenu);
    };
  }, [openActionTaskId]);

  const toggleActionMenu = (taskId, event) => {
    if (openActionTaskId === taskId) {
      setOpenActionTaskId(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const menuHeight = 132;
    const menuWidth = 168;
    actionButtonRef.current = button;
    setActionMenuPosition({
      top: rect.bottom + menuHeight > window.innerHeight ? rect.top - menuHeight - 4 : rect.bottom + 4,
      right: Math.min(Math.max(8, window.innerWidth - rect.right), window.innerWidth - menuWidth - 8),
    });
    setOpenActionTaskId(taskId);
  };

  return (
    <div className="page-container">


      <div className="page-header">

        <div>
          <div className="task-page-title">
            <img src={taskManagementLogo} alt="Task management logo" />
            <h1>Task Management</h1>
          </div>
          <p>Create, assign and manage project tasks.</p>
        </div>

        <div className="task-header-actions">
          <button className="notification-button" type="button" aria-label="Notifications" title="Notifications">
            <Bell size={20} />
          </button>
          <button
            className="primary-button"
            onClick={handleAddTask}
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>

      </div>


      <div className="filter-card">

        <select className="filter-select" value={projectFilter} onChange={(event) => {
          setProjectFilter(event.target.value);
          setCurrentPage(1);
        }} aria-label="Filter by project">
          <option>All Projects</option>
          <option>Project Management</option>
          <option>Backend System</option>
        </select>

        <select className="filter-select" value={statusFilter} onChange={(event) => {
          setStatusFilter(event.target.value);
          setCurrentPage(1);
        }} aria-label="Filter by status">
          <option>All Status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

      </div>


      <div className="content-card">

        <div className="card-header">
          <div>
            <h2 className="all-tasks-title">
              <span className="all-tasks-first-letter">A</span>ll tasks
            </h2>
            <p>{visibleTasks.length} of {tasks.length} tasks shown</p>
          </div>
        </div>

        <div className="table-wrapper">

          <table className="task-table">

            <thead>
              <tr>
                <th><span className="table-head-capital">T</span>ask</th>
                <th><span className="table-head-capital">P</span>roject</th>
                <th><span className="table-head-capital">A</span>ssigned to</th>
                <th><span className="table-head-capital">P</span>riority</th>
                <th><span className="table-head-capital">S</span>tatus</th>
                <th><span className="table-head-capital">D</span>ue date</th>
                <th><spa className="table-head-capital">A</spa>ction</th>
              </tr>
            </thead>

            <tbody>

              {pageTasks.map((task) => (
                <tr key={task.id}>

                  <td>
                    <strong>{task.title}</strong>
                  </td>

                  <td>{task.project}</td>

                  <td>{task.assignedTo || "Unassigned"}</td>

                  <td>
                    <span
                      className={`priority ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status ${task.status
                        .toLowerCase()
                        .replace(" ", "-")
                        }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td>{task.endDate ? new Date(`${task.endDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not assigned"}</td>

                  <td>
                    <div className="task-action-menu">
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={`Actions for ${task.title}`}
                        aria-haspopup="menu"
                        aria-expanded={openActionTaskId === task.id}
                        title="Task actions"
                        onClick={(event) => toggleActionMenu(task.id, event)}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openActionTaskId === task.id && (
                        createPortal(<div
                          ref={actionMenuRef}
                          className="task-action-menu-list"
                          role="menu"
                          aria-label={`Actions for ${task.title}`}
                          style={{ top: actionMenuPosition.top, right: actionMenuPosition.right }}
                        >
                          <button type="button" role="menuitem" onClick={handleAddTask}>
                            <Plus size={16} /> Add Task
                          </button>
                          <button type="button" role="menuitem" onClick={() => handleEditTask(task)}>
                            <Pencil size={16} /> Edit Task
                          </button>
                          <button type="button" role="menuitem" className="delete-action" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 size={16} /> Delete Task
                          </button>
                        </div>, document.body)
                      )}
                    </div>
                  </td>

                </tr>
              ))}

              {visibleTasks.length === 0 && (
                <tr>
                  <td colSpan="7">No tasks match these filters.</td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <div className="task-pagination">
          <div className="pagination-summary">
            <label htmlFor="task-page-size">Rows per page</label>
            <select
              id="task-page-size"
              value={pageSize}
              onChange={(event) => {
                const nextPageSize = Number(event.target.value);
                setPageSize(nextPageSize);
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>{firstTaskIndex}-{lastTaskIndex} of {visibleTasks.length}</span>
          </div>

          <nav className="pagination-controls" aria-label="Task pages">
            <button
              type="button"
              className="pagination-button"
              aria-label="Previous page"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft size={17} />
            </button>
            {pageNumbers.map((page) => (
              <button
                type="button"
                key={page}
                className={`pagination-button${activePage === page ? " active" : ""}`}
                aria-label={`Page ${page}`}
                aria-current={activePage === page ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="pagination-button"
              aria-label="Next page"
              disabled={activePage === pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            >
              <ChevronRight size={17} />
            </button>
          </nav>
        </div>

      </div>


      {showForm && (
        <div className="modal-overlay">

          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">

            <div className="modal-header">
              <div>
                <h2 id="task-form-title">{editingTaskId ? "Edit Task" : "Create New Task"}</h2>
                <p>{editingTaskId ? "Update the task details." : "Add a new task to your project."}</p>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
                aria-label="Close task form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>

              {dateError && (
                <div role="alert" className="form-error">
                  {dateError}
                </div>
              )}

              <div className="form-group">
                <label>Task Name</label>

                <input
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Project</label>

                <select
                  name="project"
                  value={newTask.project}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select project</option>
                  <option value="Project Management">
                    Project Management
                  </option>
                  <option value="Backend System">
                    Backend System
                  </option>
                  <option value="Frontend System">
                    Frontend System
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign To</label>

                <input
                  type="text"
                  name="assignedTo"
                  value={newTask.assignedTo}
                  onChange={handleChange}
                  placeholder="Enter team member"
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={newTask.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Status</label>

                  <select
                    name="status"
                    value={newTask.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>

                  <input
                    type="date"
                    name="startDate"
                    value={newTask.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>

                  <input
                    type="date"
                    name="endDate"
                    value={newTask.endDate}
                    onChange={handleChange}
                    min={getNextDate(newTask.startDate)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingTaskId ? "Save Changes" : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Tasks;