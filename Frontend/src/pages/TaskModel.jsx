
import { useEffect, useState } from "react";
import { X, ClipboardList } from "lucide-react";
import "./Tasks.css";

const initialForm = {
  task_name: "",
  description: "",
  project: "",
  assigned_to: "",
  start_date: "",
  due_date: "",
  status: "To Do",
  priority: "Medium",
};

function TaskModal({ isOpen, onClose, onSave, task }) {
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(task);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          task_name: task.task_name || "",
          description: task.description || "",
          project: task.project?.id ?? task.project ?? "",
          assigned_to:
            task.assigned_to?.id ?? task.assigned_to ?? "",
          start_date: task.start_date || "",
          due_date: task.due_date || "",
          status: task.status || "To Do",
          priority: task.priority || "Medium",
        });
      } else {
        setFormData(initialForm);
      }

      setError("");
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.task_name.trim()) {
      setError("Please enter a task name.");
      return;
    }

    if (!formData.project) {
      setError("Please enter a valid Project ID.");
      return;
    }

    if (
      formData.start_date &&
      formData.due_date &&
      formData.due_date < formData.start_date
    ) {
      setError("Due date cannot be before start date.");
      return;
    }

    const payload = {
      task_name: formData.task_name.trim(),
      description: formData.description,
      project: Number(formData.project),
      assigned_to: formData.assigned_to
        ? Number(formData.assigned_to)
        : null,
      start_date: formData.start_date || null,
      due_date: formData.due_date || null,
      status: formData.status,
      priority: formData.priority,
    };

    try {
      setSaving(true);
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Unable to save task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div
        className="task-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="task-modal-header">
          <div className="task-modal-title">
            <div className="task-modal-icon">
              <ClipboardList size={23} />
            </div>

            <div>
              <h2>{isEdit ? "Edit Task" : "Add New Task"}</h2>
              <p>
                {isEdit
                  ? "Update the task information"
                  : "Fill in the details to create a task"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="task-close-btn"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="task-modal-body">
            {error && (
              <div className="task-form-error">
                {error}
              </div>
            )}

            <div className="task-form-grid">
              <div className="task-field full-width">
                <label>
                  Task Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="task_name"
                  placeholder="Enter task name"
                  value={formData.task_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="task-field">
                <label>
                  Project ID <span>*</span>
                </label>

                <input
                  type="number"
                  name="project"
                  placeholder="Enter project ID"
                  value={formData.project}
                  onChange={handleChange}
                  min="1"
                  required
                />

                <small>
                  Enter an existing project's database ID.
                </small>
              </div>

              <div className="task-field">
                <label>Assigned User ID</label>

                <input
                  type="number"
                  name="assigned_to"
                  placeholder="Enter user ID"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  min="1"
                />

                <small>
                  Leave empty if the task is unassigned.
                </small>
              </div>

              <div className="task-field full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Describe the task..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="task-field">
                <label>Start Date</label>

                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>

              <div className="task-field">
                <label>Due Date</label>

                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  min={formData.start_date || undefined}
                />
              </div>

              <div className="task-field">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="task-field">
                <label>Priority</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="task-modal-footer">
            <button
              type="button"
              className="task-btn task-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="task-btn task-btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEdit
                ? "Update Task"
                : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;