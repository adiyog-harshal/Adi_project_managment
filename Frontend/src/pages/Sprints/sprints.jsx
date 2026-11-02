import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, CalendarDays, Layers, Users, Clock3, Play, Square } from "lucide-react";
import api from "../../services/api";
import "./sprints.css";

const Sprints = () => {
const { id, sprintId } = useParams();
const navigate = useNavigate();

const [sprints, setSprints] = useState([]);
const [tasks, setTasks] = useState([]);
const [selectedSprint, setSelectedSprint] = useState(null);
const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);

const [saving, setSaving] = useState(false);
const [showAddTasks, setShowAddTasks] = useState(false);
const [selectedTaskIds, setSelectedTaskIds] = useState([]);
const [selectedTask, setSelectedTask] = useState(null);

const [formTaskIds, setFormTaskIds] = useState([]);
const [assigningTasks, setAssigningTasks] = useState(false);
const [editingSprintId, setEditingSprintId] = useState(null);

const [duration, setDuration] = useState("7");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const [activeTimer, setActiveTimer] = useState(null);
const [timerSeconds, setTimerSeconds] = useState(0);

const [error, setError] = useState("");
const [taskAssignees, setTaskAssignees] = useState({});
const [showCompleteSprintModal, setShowCompleteSprintModal] = useState(false);
const [completingSprint, setCompletingSprint] = useState(false);
const [unfinishedTaskAction, setUnfinishedTaskAction] = useState("backlog");
const [nextSprintId, setNextSprintId] = useState("");
const [startingSprint, setStartingSprint] = useState(false);

const [showStartSprintModal, setShowStartSprintModal] = useState(false);
const [sprintStartChoice, setSprintStartChoice] = useState("today");
const [users, setUsers] = useState([]);
useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await api.get("users/");
            const data = response.data;

            setUsers(
                Array.isArray(data)
                    ? data
                    : data.results || data.data || []
            );
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    fetchUsers();
}, []);

const [toast, setToast] = useState({
    message: "",
    type: "success",
});

const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
        setToast({ message: "", type: "success" });
    }, 3000);
};

const [carryOverTargets, setCarryOverTargets] = useState({});
const [timeSummary, setTimeSummary] = useState({
    total_hours: 0,
    by_task: [],
    by_user: []
});

const [showTimeLog, setShowTimeLog] = useState(false);
const [activeTimeTask, setActiveTimeTask] = useState(null);
const [timeSaving, setTimeSaving] = useState(false);
const [timeError, setTimeError] = useState("");

const [timeForm, setTimeForm] = useState({
    hours: "1",
    minutes: "0",
    work_date: new Date().toLocaleDateString("en-CA"),
    description: ""
});

const [sprintForm, setSprintForm] = useState({
    sprint_name: "",
    goal: "",
    milestone: "",
    start_date: "",
    end_date: "",
    status: "Planned"
});
// TIME SCHEDULEING
const [scheduleForm, setScheduleForm] = useState({
    start_date: "",
    due_date: "",
    actual_start_date: "",
    actual_end_date: "",
    estimated_time: "",
    actual_time: "",
    
});

const [savingSchedule, setSavingSchedule] = useState(false);
const [scheduleMessage, setScheduleMessage] = useState("");

const [taskScheduleForm, setTaskScheduleForm] = useState({
    start_date: "",
    due_date: "",
    actual_start_date: "",
    actual_end_date: "",
    estimated_hours: "0",
    estimated_minutes: "0",
    actual_hours: "0",
    actual_minutes: "0",
});


const splitMinutes = (totalMinutes = 0) => {
    const total = Number(totalMinutes) || 0;

    return {
        hours: String(Math.floor(total / 60)),
        minutes: String(total % 60),
    };
};

const formatTimerDisplay = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(value => String(value).padStart(2, "0"))
        .join(":");
};

// Convert total minutes into a readable format, e.g. 150 -> "2h 30m"
const minutesToTimeText = (value = 0) => {
    const total = Number(value) || 0;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    return `${hours}h ${minutes}m`;
};


// Convert "2h 30m" into total minutes, e.g. 150
const timeTextToMinutes = (value) => {
    const match = value.trim().match(
        /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/i
    );

    if (!match || (!match[1] && !match[2])) {
        return null;
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);

    // Minutes must be between 0 and 59
    if (minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
};

// Handle date and time inputs
const handleScheduleChange = (e) => {
    const { name, value } = e.target;

    setScheduleForm((previous) => ({
        ...previous,
        [name]: value,
    }));
};

const parseTimeToMinutes = (value) => {
    const text = (value || "").trim();

    if (!text) return 0;

    const match = text.match(
        /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/i
    );

    if (!match || (!match[1] && !match[2])) {
        return null;
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);

    if (minutes > 59) return null;

    return hours * 60 + minutes;
};

const formatMinutes = (value) => {
    const total = Number(value || 0);
    const hours = Math.floor(total / 60);
    const minutes = total % 60;

    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
};

const handleSaveSchedule = async () => {
    if (!selectedTask) return;

    const estimatedTime = parseTimeToMinutes(
        scheduleForm.estimated_time
    );
    const actualTime = parseTimeToMinutes(
        scheduleForm.actual_time
    );

    if (estimatedTime === null || actualTime === null) {
        setScheduleMessage(
            "Enter time like 2h 30m, 2h, or 30m."
        );
        return;
    }

    if (
        scheduleForm.start_date &&
        scheduleForm.due_date &&
        scheduleForm.due_date < scheduleForm.start_date
    ) {
        setScheduleMessage(
            "Estimated End Date must be on or after Estimated Start Date."
        );
        return;
    }

    if (
        scheduleForm.actual_start_date &&
        scheduleForm.actual_end_date &&
        scheduleForm.actual_end_date < scheduleForm.actual_start_date
    ) {
        setScheduleMessage(
            "Actual End Date must be on or after Actual Start Date."
        );
        return;
    }

    const payload = {
        start_date: scheduleForm.start_date || null,
        due_date: scheduleForm.due_date || null,
        actual_start_date: scheduleForm.actual_start_date || null,
        actual_end_date: scheduleForm.actual_end_date || null,
        estimated_time_minutes: estimatedTime,
        actual_time_minutes: actualTime,
    };

    try {
        setSavingSchedule(true);
        setScheduleMessage("");

        const response = await api.patch(
            `tasks/${selectedTask.id}/`,
            payload
        );

        const updatedTask = {
            ...selectedTask,
            ...response.data,
        };
        // updated the selected task details 
        setSelectedTask(updatedTask);

        setSprintTasks((previous) => 
            previous.map((task) => 
                String(task.id) === String(updatedTask.id)
                    ? {...task, ...response.data }
                    : task   
        ));

        setScheduleForm((previous) => ({
            ...previous,
            start_date: response.data.start_date || "",
            due_date: response.data.due_date || "",
            actual_start_date: response.data.actual_start_date || "",
            actual_end_date: response.data.actual_end_date || "",
            estimated_time: formatMinutes(
                response.data.estimated_time_minutes
            ),
            actual_time: formatMinutes(
                response.data.actual_time_minutes
            ),
        }));

        setScheduleMessage("Task schedule saved successfully.");
    } catch (error) {
        console.error(
            "Failed to save task schedule:",
            error.response?.data || error
        );

        setScheduleMessage(
            Object.values(error.response?.data || {})
                .flat()
                .join(" ") ||
            "Failed to save. Please check the backend API and try again."
        );
    } finally {
        setSavingSchedule(false);
    }
};

const calculateEndDate = (start, days) => {
    if (!start || !days) return "";

    const date = new Date(start + "T12:00:00");
    date.setDate(date.getDate() + Number(days) - 1);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
};



const handleStartDateChange = (value) => {
    setStartDate(value);
    setEndDate(calculateEndDate(value, duration));
};

const handleDurationChange = (value) => {
    setDuration(value);
    setEndDate(calculateEndDate(startDate, value));
};


const getNextSprintSuggestion = (sprints) => {
    // Find the highest numbered sprint
    const getNumber = (name) => {
        const match = name?.match(/Sprint\s+(\d+)/i);
        return match ? Number(match[1]) : 0;
    };
    // Find the highest sprint number, even if some numbers are missing
    const nextNumber =
        Math.max(0, ...sprints.map((sprint) => 
            getNumber(sprint.sprint_name)
        )) + 1;

    // Find the latest sprint end date
    const latestSprint = [...sprints]
        .filter((sprint) => sprint.end_date)
        .sort((a, b) =>
                b.end_date.localeCompare(a.end_date)
        )[0];

    const start = latestSprint
        ? new Date(`${latestSprint.end_date}T12:00:00`)
        : new Date();

    if (latestSprint) {
        start.setDate(start.getDate() + 1);
    }

    const formatDate = (date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // Reuse the latest sprint's duration, or default to 15 days
    const duration = latestSprint?.start_date
        ? Math.max(
              1,
              Math.round(
                    (new Date(`${latestSprint.end_date}T12:00:00`) -
                    new Date(`${latestSprint.start_date}T12:00:00`)) /
                    86400000
              ) + 1
          )
        : 15;

    const end = new Date(start);
    end.setDate(end.getDate() + duration - 1);

    return {
        sprint_name: `Sprint ${nextNumber}`,
        start_date: formatDate(start),
        end_date: formatDate(end),
        duration,
    };
};


const loadData = async () => {
    try {
        setLoading(true);
        setError("");

        const [sprintResponse, taskResponse, usersResponse] =
            await Promise.all([
                api.get("sprints/"),
                api.get("tasks/"),
                api.get("users/")
            ]);

        const sprintData = Array.isArray(sprintResponse.data)
            ? sprintResponse.data
            : sprintResponse.data.results || [];

        const taskData = Array.isArray(taskResponse.data)
            ? taskResponse.data
            : taskResponse.data.results || [];

        const usersData = Array.isArray(usersResponse.data)
            ? usersResponse.data
            : usersResponse.data.results || [];

        // Get ALL sprints belonging to this project,
        // including future/planned sprints.
        const allProjectSprints = sprintData.filter(sprint => {
            const projectId =
                typeof sprint.project === "object"
                    ? sprint.project?.id
                    : sprint.project;

            return String(projectId) === String(id);
        });

        // Get all tasks belonging to this project.
        const projectTasks = taskData.filter(task => {
            const projectId =
                typeof task.project === "object"
                    ? task.project?.id
                    : task.project;

            return String(projectId) === String(id);
        });

        setUsers(usersData);
        setSprints(allProjectSprints);
        setTasks(projectTasks);

        // Load time summary before returning.
        await loadTimeSummary();

        // Select the sprint clicked on the Overview page.
        const clickedSprint = allProjectSprints.find(
            sprint => String(sprint.id) === String(sprintId)
        );

        const activeSprint = allProjectSprints.find(
            sprint => (sprint.status || "").toLowerCase() === "in progress"
        );

        const plannedSprint = allProjectSprints.find(
            sprint => (sprint.status || "").toLowerCase() === "planned"
        );

        const defaultSprint = 
            clickedSprint || activeSprint || plannedSprint || null;

        setSelectedSprint(defaultSprint);
        
        return allProjectSprints;

    } catch (err) {
        console.error(
            "Failed to load sprints:",
            err.response?.data || err
        );

        setError(
            err.response?.status === 401
                ? "Your session may have expired. Please log in again."
                : "Could not load sprints. Check the backend and API routes."
        );
    } finally {
        setLoading(false);
    }
};

// FETCH ACTUAL TIME SUMMARIES
const loadTimeSummary = async () => {
    try {
        const response = await api.get("tasks/time-summary/");

        setTimeSummary({
            total_hours: response.data.total_hours || 0,
            by_task: response.data.by_task || [],
            by_user: response.data.by_user || []
        });
    } catch (err) {
        console.error(
            "Failed to load time summary:",
            err.response?.data || err
        );
    }
};

useEffect(() => {
    loadData();
}, [id]);

useEffect(() => {
    if (!selectedTask) {
        setScheduleMessage("");
        return;
    }

    const estimated = minutesToTimeText(
    selectedTask.estimated_time_minutes || 0
    );

    const actual = minutesToTimeText(
        selectedTask.actual_time_minutes || 0
    );

    setScheduleForm({
        start_date: selectedTask.start_date || "",
        due_date: selectedTask.due_date || "",
        actual_start_date: selectedTask.actual_start_date || "",
        actual_end_date: selectedTask.actual_end_date || "",
        estimated_time: formatMinutes(
        selectedTask.estimated_time_minutes
        ),
        actual_time: formatMinutes(
            selectedTask.actual_time_minutes
        ),
    });

    setScheduleMessage("");
}, [selectedTask]);


const handleCreateSprint = async (e) => {
    e.preventDefault();
    setError("");

    if (sprintForm.end_date < sprintForm.start_date) {
        setError("End date cannot be earlier than start date.");
        return;
    }

    try {
        setSaving(true);

        const payload = {
            sprint_name: sprintForm.sprint_name.trim(),
            goal: sprintForm.goal.trim(),
            project: Number(id),
            milestone: sprintForm.milestone
                ? Number(sprintForm.milestone)
                : null,
            start_date: sprintForm.start_date,
            end_date: sprintForm.end_date,
            status: sprintForm.status,
        };

        if (editingSprintId !== null) {
            await api.put(
                `sprints/${editingSprintId}/`,
                payload
            );

            setToast({
                message: "Sprint updated sucessfully!",
                type: "success"
            });
        } else {
            await api.post("sprints/", payload);

            setToast({
                message: "Sprint created successfully!",
                type: "success"
            });
        }

        setShowForm(false);
        setEditingSprintId(null);

        setSprintForm({
            sprint_name: "",
            goal: "",
            milestone: "",
            start_date: "",
            end_date: "",
            status: "Planned",
        });

        await loadData();

    } catch (err) {
        console.error(
            "Save sprint error:",
            err.response?.data || err
        );

        setError(
            JSON.stringify(
                err.response?.data || "Failed to save sprint."
            )
        );
    } finally {
        setSaving(false);
    }
};


const handleAssignTasks = async () => {
    if (!selectedSprint) {
        setError("Please select a sprint first.");
        return;
    }

    if (selectedTaskIds.length === 0) {
        setError("Please select at least one task.");
        return;
    }

    try {
        setAssigningTasks(true);
        setError("");

        // Assign selected tasks to the sprint first
        await api.post(
            `sprints/${selectedSprint.id}/tasks/`,
            {
                task_ids: selectedTaskIds
            }
        );

        // Save the selected user for each task
        for (const taskId of selectedTaskIds) {
            const assignedUser = taskAssignees[taskId];

            if (assignedUser) {
                await api.patch(`tasks/${taskId}/`, {
                    assigned_to: assignedUser
                });
            }
        }

        setShowAddTasks(false);
        setSelectedTaskIds([]);
        setTaskAssignees({});

        await loadData();
    } catch (err) {
        console.error(
            "Failed to assign tasks:",
            err.response?.data || err
        );

        const data = err.response?.data;

        setError(
            typeof data === "string"
                ? data
                : data
                    ? JSON.stringify(data)
                    : "Failed to add tasks to this sprint."
        );
    } finally {
        setAssigningTasks(false);
    }
};




const handleStartSprint = async (sprintId, startChoice) => {
    if (getSprintTaskCount(sprintId) === 0) {
        setShowStartSprintModal(false);
        setToast({
            message: "Please assign at least one task before starting the sprint.",
            type: "error",
        });
        return;
    }

    try {
        setStartingSprint(true);

        const response = await api.post(
            `sprints/${sprintId}/start/`,
            { start_choice: startChoice }
        );

        const updatedSprint = response.data.sprint;

        if (updatedSprint) {
            setSelectedSprint(updatedSprint);

            setSprints((previousSprints) =>
                previousSprints.map((sprint) =>
                    String(sprint.id) === String(updatedSprint.id)
                        ? updatedSprint
                        : sprint
                )
            );
        }

        setShowStartSprintModal(false);

        setToast({
            message: response.data.message || "Sprint started successfully!",
            type: "success",
        });
    } catch (error) {
        console.error(
            "Sprint start error:",
            error.response?.data || error
        );

        setToast({
            message:
                error.response?.data?.detail ||
                "Unable to start sprint.",
            type: "error",
        });
    } finally {
        setStartingSprint(false);
    }
};


   
const sprintTasks = tasks.filter(task =>
    String(
        typeof task.sprint === "object"
            ? task.sprint?.id
            : task.sprint
    ) === String(selectedSprint?.id)
);


const getTaskStatus = (task) => {
    const status = (task.status || "")
        .toLowerCase()
        .replace(/_/g, " ")
        .trim();

    if (status === "completed" || status === "done") {
        return "Completed";
    }

    if (
        status === "in progress" ||
        status === "in review"
    ) {
        return "In Progress";
    }

    if (status === "on hold") {
        return "On Hold";
    }

    return "To Do";
};


const getTaskEstimatedMinutes = (task) => {
    // Supports common estimated-time field names.
    const minutes = Number(
        task?.estimated_minutes ??
        task?.estimated_time_minutes ??
        task?.estimate_minutes
    );

    if (Number.isFinite(minutes) && minutes > 0) {
        return minutes;
    }

    const hours = Number(
        task?.estimated_hours ??
        task?.estimated_time ??
        0
    );

    return Number.isFinite(hours) && hours > 0
        ? hours * 60
        : 0;
};

const loadActiveTimer = async () => {
    try {
        const response = await api.get("tasks/timers/active/");
        const data = response.data;

        if (data.active) {
            setActiveTimer(data);
            setTimerSeconds(data.elapsed_seconds || 0);
        } else {
            setActiveTimer(null);
            setTimerSeconds(0);
        }
    } catch (error) {
        console.error("Failed to load active timer:", error);
    }
};

const handleStartTimer = async (task) => {
    try {
        const response = await api.post("tasks/timers/start/", {
            task_id: task.id,
        });

        await loadActiveTimer();
    } catch (error) {
        console.error(
            "Failed to start timer:",
            error.response?.data || error
        );
    }
};

const handleStopTimer = async () => {
    try {
        await api.post("tasks/timers/stop/");

        setActiveTimer(null);
        setTimerSeconds(0);

        await loadActiveTimer();

        // Refresh saved time entries after stopping
        await loadTimeSummary();
        await loadData();
    } catch (error) {
        console.error(
            "Failed to stop timer:",
            error.response?.data || error
        );
    }
};

useEffect(() => {
    loadActiveTimer();
}, []);

useEffect(() => {
    if (!activeTimer?.started_at) return;

    const interval = setInterval(() => {
        const startedAt = new Date(activeTimer.started_at).getTime();

        const elapsed = Math.max(
            0,
            Math.floor((Date.now() - startedAt) / 1000)
        );

        setTimerSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
}, [activeTimer?.started_at]);


// PROGRESS STATUS OF TASK
const columns = ["To Do", "In Progress", "Completed"];

if (loading) {
    return (
        <div className="sprints-page">
            <p>Loading sprints...</p>
        </div>
    );
}


const handleMoveToBacklog = async (task) => {
    try {
        setError("");

        await api.patch(`tasks/${task.id}/`, {
            sprint: null
        });

        // REFRESH SPRINT AND TASK DATA
        await loadData();
    } catch (err) {
        console.error(
            "Failed to move task to backlog:",
            err.response?.data || err
        );

        setError("Failed to move task to backlog.");
    }
};

const handleCompleteSprint = async () => {
    if (!selectedSprint) return;

    const unfinishedTasks = sprintTasks.filter(
        (task) => getTaskStatus(task) !== "Completed"
    );

    if (
        unfinishedTaskAction === "carryover" &&
        unfinishedTasks.length > 0 &&
        !nextSprintId
    ) {
        setError("Please select the next sprint.");
        return;
    }

    try {
        setCompletingSprint(true);
        setError("");

        // Move unfinished tasks to the selected destination.
        for (const task of unfinishedTasks) {
            await api.patch(`tasks/${task.id}/`, {
                sprint:
                    unfinishedTaskAction === "carryover"
                        ? Number(nextSprintId)
                        : null,
            });
        }

        // Mark the current sprint as completed.
        await api.patch(`sprints/${selectedSprint.id}/`, {
            status: "Completed",
        });

        setShowCompleteSprintModal(false);
        setUnfinishedTaskAction("backlog");
        setNextSprintId("");

        await loadData();
    } catch (error) {
        console.error(
            "Complete sprint error:",
            error.response?.data || error
        );

        setError("Failed to complete sprint. Please try again.");
    } finally {
        setCompletingSprint(false);
    }
};

const handleCarryOver = async (task, targetSprintId) => {
    if (!targetSprintId) {
        alert("Please select the next sprint.");
        return;
    }

    try {
        await api.post(`tasks/${task.id}/carry-over/`, {
            target_sprint_id: Number(targetSprintId),
            reason: "Task carried over because it was not completed"
        });

        await loadData();
        alert("Task carried over successfully.");
    } catch (error) {
        console.error(
            "Carryover failed:",
            error.response?.data || error
        );

        setError(
            error.response?.data?.detail || 
            "Unable to carry over this task."
        );
    }
};

const openTimeLog = (task) => {
    setActiveTimeTask(task);
    setTimeError("");

    setTimeForm({
        hours: "1",
        minutes: "0",
        work_date: new Date().toLocaleDateString("en-CA"),
        description: ""
    });

    setShowTimeLog(true);
};

const handleSaveTimeLog = async (e) => {
    e.preventDefault();
    setTimeError("");

    const hours = Number(timeForm.hours);
    const minutes = Number(timeForm.minutes);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        minutes < 0 ||
        minutes > 59 ||
        hours * 60 + minutes <= 0
    ) {
        setTimeError("Enter a valid work duration.");
        return;
    }

    if (!timeForm.description.trim()) {
        setTimeError("Please describe the work completed.");
        return;
    }

    try {
        setTimeSaving(true);

        await api.post("tasks/time-logs/", {
            task: activeTimeTask.id,
            hours,
            minutes,
            work_date: timeForm.work_date,
            description: timeForm.description.trim()
        });

        setShowTimeLog(false);
        setActiveTimeTask(null);

        await loadTimeSummary();
        await loadData();
    } catch (err) {
        console.error(
            "Failed to save time entry:",
            err.response?.data || err
        );

        setTimeError(
            typeof err.response?.data === "string"
                ? err.response.data
                : JSON.stringify(
                    err.response?.data || "Could not save time entry."
                )
        );
    } finally {
        setTimeSaving(false);
    }
};

const handleTaskStatusChange = async (task, newStatus) => {
    try {
        setError("");

        await api.patch(`tasks/${task.id}/`, {
            status: newStatus
        });

        // Update the task list immediately
        setTasks(prev =>
            prev.map(item =>
                String(item.id) === String(task.id)
                    ? { ...item, status: newStatus }
                    : item
            )
        );

        // Update the selected task details
        setSelectedTask(prev =>
            prev && String(prev.id) === String(task.id)
                ? { ...prev, status: newStatus }
                : prev
        );
    } catch (err) {
        console.error(
            "Failed to update task status:",
            err.response?.data || err
        );

        setError("Failed to update task status. Please try again.");
    }
};

const handleTaskAssigneeChange = async (task, userId) => {
    if (!userId) return;

    try {
        const response = await api.patch(`tasks/${task.id}/`, {
            assigned_to: Number(userId),
        });

        setSelectedTask((prev) => ({
            ...prev,
            ...response.data,
        }));
    } catch (error) {
        console.error(
            "Assignment error:",
            error.response?.data || error
        );

        alert("Failed to assign user. Check the Console for details.");
    }
};

const getSprintTaskCount = (sprintId) => {
    return tasks.filter((task) => {
        const taskSprintId = 
            typeof task.sprint === "object"
                ? task.sprint?.id
                : task.sprint;

        return String(taskSprintId) === String(sprintId);
    }).length;
};

return (
    <div className="sprints-page">
        <button
            type="button"
            className="backlog-back-button"
            onClick={() =>
                navigate(`/projects/${id}`)
            }
        >
            <ArrowLeft size={16} />

            Back to Project
        </button>

        <div className="sprints-header">
            <div>
                <span className="sprints-eyebrow">PROJECT WORKSPACE</span>
                <h1>Sprint Management</h1>
                <p>Plan your sprints and track task progress.</p>
            </div>

            <button
                type="button"
                className="sprints-create-button"
                onClick={async () => {
                    setError("");
                    setShowAddTasks(false);
                    setEditingSprintId(null);

                    try {
                        const latestSprints = await loadData();

                        const suggestion = getNextSprintSuggestion(
                            latestSprints || []
                        );
                        setDuration(String(suggestion.duration));
                        setStartDate(suggestion.start_date);
                        setEndDate(suggestion.end_date); 

                        setSprintForm({
                        sprint_name: suggestion.sprint_name,
                        goal: "",
                        start_date: suggestion.start_date,
                        end_date: suggestion.end_date,
                        status: "Planned",
                    });

                    setShowForm(true);
                } catch (err) {
                    console.error("Unable to prepare sprint form:", err);
                    setError("Unable to load sprint data. Please try again.");
                }
            }}
            >
                <Plus size={18} />
                Create Sprint
            </button>     
        </div>
        {toast.message && (
    <div
        className={`pms-toast pms-toast-${toast.type}`}
        role="status"
    >
        <span>{toast.message}</span>

        <button
            type="button"
            onClick={() =>
                setToast({ message: "", type: "success" })
            }
            aria-label="Close notification"
        >
            ×
        </button>
    </div>
)}

        {error && <div className="sprints-error">{error}</div>}

        
{showForm && (
    <div
        className="sprint-modal-overlay"
        onClick={() => setShowForm(false)}
    >
        <form
            className="sprint-form sprint-create-modal"
            onSubmit={handleCreateSprint}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="sprint-create-modal-header">
                <div>
                    <h2>
                        {editingSprintId !== null
                            ? "Edit Sprint"
                            : "Create New Sprint"}
                    </h2>
                    <p>
                        Configure your sprint duration, dates, status, and goal.
                    </p>

                    {editingSprintId === null && (
                        <small className="sprint-suggestion-node">
                            Suggested sprint name and dates are based on your previous sprint.
                            You can change them before saving.
                        </small>
                    )}
                </div>

                <button
                    type="button"
                    className="sprint-modal-close"
                    aria-label="Close form"
                    onClick={() => setShowForm(false)}
                >
                    &times;
                </button>
            </div>

            <div className="sprint-form-grid">
                <div className="sprint-duration-field">
                    <label htmlFor="sprint-duration">
                        <span className="duration-icon">
                            <CalendarDays size={15} />
                        </span>
                        Sprint Duration
                    </label>

                    <select
                        id="sprint-duration"
                        value={duration}
                        onChange={(e) => {
                            const value = e.target.value;
                            setDuration(value);

                            const newEndDate = calculateEndDate(
                                sprintForm.start_date,
                                value
                            );

                            setEndDate(newEndDate);

                            setSprintForm((prev) => ({
                                ...prev,
                                end_date: newEndDate,
                            }));
                        }}
                    >
                        {![7, 15, 30]. includes(Number(duration)) && (
                            <option value={duration}>
                                {duration} Days
                            </option>
                        )}
                        <option value="7">7 Days</option>
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                    </select>
                </div>

                <label>
                    Sprint Name *
                    <input
                        required
                        value={sprintForm.sprint_name}
                        placeholder="e.g. Sprint 1"
                        onChange={(e) =>
                            setSprintForm({
                                ...sprintForm,
                                sprint_name: e.target.value,
                            })
                        }
                    />
                </label>

                <label>
                    Status
                    <select
                        value={sprintForm.status}
                        onChange={(e) =>
                            setSprintForm({
                                ...sprintForm,
                                status: e.target.value,
                            })
                        }
                    >
                        <option value="Planned">Planned</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                    </select>
                </label>

                <label>
                    Start Date *
                    <input
                        required
                        type="date"
                        value={sprintForm.start_date}
                        onChange={(e) => {
                            const value = e.target.value;
                            const newEndDate = calculateEndDate(
                                value,
                                duration
                            );

                            setStartDate(value);
                            setEndDate(newEndDate);

                            setSprintForm((prev) => ({
                                ...prev,
                                start_date: value,
                                end_date: newEndDate,
                            }));
                        }}
                    />
                </label>

                <label>
                    End Date *
                    <input
                        required
                        type="date"
                        min={sprintForm.start_date || undefined}
                        value={sprintForm.end_date}
                        onChange={(e) =>
                            setSprintForm({
                                ...sprintForm,
                                end_date: e.target.value,
                            })
                        }
                    />
                </label>

                <label className="sprint-form-full">
                    Sprint Goal *
                    <textarea
                        required
                        rows="3"
                        value={sprintForm.goal}
                        placeholder="What should this sprint achieve?"
                        onChange={(e) =>
                            setSprintForm({
                                ...sprintForm,
                                goal: e.target.value,
                            })
                        }
                    />
                </label>
            </div>

            <div className="sprint-form-actions">
                <button
                    type="button"
                    className="sprint-cancel-button"
                    onClick={() => setShowForm(false)}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="sprints-create-button"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : editingSprintId !== null
                            ? "Update Sprint"
                            : "Save Sprint"}
                </button>
            </div>
        </form>
    </div>
)}


        <div className="sprint-list-heading">
            <div>
                <h2>Your Sprints</h2>
                <p>{sprints.length} sprint{sprints.length !== 1 ? "s" : ""} in this project</p>
            </div>
        </div>

        {sprints.length === 0 ? (
            <div className="sprints-empty">
                <Layers size={36} />
                <h3>No sprints created yet</h3>
                <p>Create your first sprint to start planning project tasks.</p>
            </div>
        ) : (
            <div className="sprint-cards">
                {sprints
                    .filter(sprint => {
                    const status = sprint.status?.toLowerCase();

                    const isActive =
                        status === "in progress" || status === "active";

                    const isClickedSprint =
                        String(sprint.id) === String(sprintId);

                    // Always show active sprints and only the
                    // future sprint clicked from Project Overview.
                    return isActive || isClickedSprint;
                }).map(sprint => (
                    <div
                        key={sprint.id}
                        className={`sprint-card ${
                            selectedSprint?.id === sprint.id ? "selected" : ""
                        } ${
                            sprint.status?.toLowerCase() === "in progress" ? "active-card" : ""
                        }`}
                        onClick={() => {
                            setSelectedSprint(sprint);
                            setSelectedTask(null);
                            setShowAddTasks(false);
                        }}
                    >
                        <div className="sprint-card-top">
                            <span className="sprint-card-icon"><Layers size={19} /></span>

                            <span className="sprint-card-actions">
                                <span
                                    className={`sprint-status ${
                                        (sprint.status || "").toLowerCase() === "in progress"
                                            ? "active"
                                            : (sprint.status || "").toLowerCase().replace(/\s+/g, "-")
                                    }`}
                                >
                                    {(sprint.status || ""). toLowerCase() === "in progress"
                                        ? "Active"
                                        : sprint.status}
                                </span>

                                {/* Start sprint Button */}
                                
                                <button
                                    type="button"
                                    className="edit-sprint-button"
                                    title="Edit Sprint"
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        setError("");
                                        setEditingSprintId(sprint.id);

                                        setSprintForm({
                                            sprint_name: sprint.sprint_name || "",
                                            goal: sprint.goal || "",
                                            milestone:
                                                typeof sprint.milestone === "object"
                                                    ? sprint.milestone?.id || ""
                                                    : sprint.milestone || "",
                                            start_date: sprint.start_date || "",
                                            end_date: sprint.end_date || "",
                                            status: sprint.status || "Planned",
                                        });

                                        setShowForm(true);
                                    }}
                                >
                                    <Pencil size={16} />
                                </button>
                            </span>
                            
                        </div>

                        <h3>{sprint.sprint_name}</h3>
                        

                        <div className="sprint-card-dates">
                            <CalendarDays size={15} />
                            {sprint.start_date} – {sprint.end_date}
                        </div>

                        <button
                            type="button"
                            className="sprint-task-count"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSprint(sprint);
                                setSelectedTask(null);
                                setShowAddTasks(false);
                            }}
                        >
                            {(sprint.task_ids || []).length} assigned tasks
                        </button>

                        
                    </div>
                ))}
            </div>
        )}

        {selectedSprint && (
            <section className="sprint-board-section">
                <div className="sprint-board-header">
                    <div>
                        <span className="sprints-eyebrow">SELECTED SPRINT</span>
                        <h2>{selectedSprint.sprint_name} — Board</h2>
                        <p>{selectedSprint.goal}</p>
                    </div>

                    <div className="sprint-board-actions">
                        <button
                            type="button"
                            className="sprints-create-button"
                            onClick={() => {
                                setError("");
                                setShowForm(false);
                                setSelectedTaskIds([]);
                                setShowAddTasks(true);
                            }}
                            disabled={
                                (selectedSprint.status || "").toLowerCase() === "completed"
                            }
                        >
                            <Plus size={18} />
                            Add Tasks
                        </button>

                        {selectedSprint && (
                            <button
                                type="button"
                                className="start-sprint-button"
                                onClick={() => {
                                    if (getSprintTaskCount(selectedSprint.id) === 0) {
                                        alert(
                                            "Please assign at least one task before starting this sprint."
                                        );
                                        return;
                                    }

                                    setSprintStartChoice("today");
                                    setShowStartSprintModal(true);
                                }}
                                disabled={startingSprint || assigningTasks}
                            >
                                <Play size={16} />
                                Start Sprint
                            </button>
                        )}

                        {selectedSprint &&
                            !["completed", "cancelled"].includes(
                                (selectedSprint.status || "").toLowerCase()
                            ) && (
                                <button
                                    type="button"
                                    className="complete-sprint-button"
                                    onClick={() => setShowCompleteSprintModal(true)}
                                >
                                    End Sprint
                                </button>
                            )}
                    </div>
               
                </div>
                
                {showAddTasks && selectedSprint && (
                    <div
                        className="sprint-modal-overlay"
                        onClick={() => {
                            setShowAddTasks(false);
                            setSelectedTaskIds([]);
                        }}
                    >
                        <div
                            className="add-sprint-tasks sprint-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sprint-modal-header">
                                <div>
                                    <h3>
                                        Add Backlog Tasks to {selectedSprint.sprint_name}
                                    </h3>
                                    <p>Select multiple tasks to include in this sprint.</p>
                                </div>

                                <button
                                    type="button"
                                    className="sprint-modal-close"
                                    onClick={() => {
                                        setShowAddTasks(false);
                                        setSelectedTaskIds([]);
                                    }}
                                    aria-label="Close popup"
                                >
                                    &times;
                                </button>
                            </div>

                            {tasks.filter(task => {
                                const sprintId =
                                    typeof task.sprint === "object"
                                        ? task.sprint?.id
                                        : task.sprint;

                                return !sprintId;
                            }).length === 0 ? (
                                <p className="no-sprint-tasks">
                                    No unassigned backlog tasks are available.
                                </p>
                            ) : (
                                <div className="availabe-sprint-tasks">
                                    {tasks
                                        .filter(task => {
                                            const sprintId =
                                                typeof task.sprint === "object"
                                                    ? task.sprint?.id
                                                    : task.sprint;

                                            return !sprintId;
                                        })
                                        .map(task => (
                                            <label
                                                key={task.id}
                                                className="available-sprint-task"
                                                htmlFor={`sprint-task-${task.id}`}
                                            >
                                                <input
                                                    id={`sprint-task-${task.id}`}
                                                    type="checkbox"
                                                    checked={selectedTaskIds.includes(
                                                        Number(task.id)
                                                    )}
                                                    onChange={(e) => {
                                                        const taskId = Number(task.id);

                                                        setSelectedTaskIds(previous => {
                                                            if (e.target.checked) {
                                                                return previous.includes(taskId)
                                                                    ? previous
                                                                    : [...previous, taskId];
                                                            }

                                                            return previous.filter(
                                                                id => id !== taskId
                                                            );
                                                        });
                                                    }}
                                                />

                                                <span>
                                                    <strong>
                                                        {task.task_name ||
                                                            task.title ||
                                                            `Task ${task.id}`}
                                                    </strong>

                                                    <small>
                                                        TASK-{task.id} · {task.status || "To Do"}
                                                    </small>
                                                </span>
                                            </label>
                                        ))}
                                </div>
                            )}

                            <div className="add-sprint-tasks-actions">
                                <span>{selectedTaskIds.length} selected</span>

                                <button
                                    type="button"
                                    className="sprint-cancel-button"
                                    onClick={() => {
                                        setShowAddTasks(false);
                                        setSelectedTaskIds([]);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="sprint-create-button"
                                    onClick={handleAssignTasks}
                                    disabled={
                                        assigningTasks || selectedTaskIds.length === 0
                                    }
                                >
                                    {assigningTasks
                                        ? "Adding..."
                                        : "Add Selected Tasks"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}             
                <div className={`sprint-content-layout ${!selectedTask ? "no-task-selected" : ""}`}>

                {/* LEFT: TASK TABLE */}
                <div className="sprint-task-list">
                    <div className="sprint-list-header">
                        <div>
                            <h3>Sprint Tasks</h3>
                            <p>{sprintTasks.length} assigned tasks</p>
                        </div>
                    </div>

                    {sprintTasks.length === 0 ? (
                        <div className="kanban-empty">
                            No tasks assigned to this sprint yet.
                        </div>
                    ) : (
                        <div className="sprint-task-table-wrapper">
                            <table className="sprint-task-table">
                                <thead>
                                    <tr>
                                        <th>Task Name</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Progress</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sprintTasks.map(task => {
                                        const isSelected =
                                            String(selectedTask?.id) === String(task.id);

                                        const status = getTaskStatus(task);

                                        const assignedUserId =
                                            typeof task.assigned_to === "object"
                                                ? task.assigned_to?.id
                                                : task.assigned_to;

                                        const matchedUser = users.find(
                                            user => String(user.id) === String(assignedUserId)
                                        );

                                        const assignedUser =
                                            task.assigned_to_name ||
                                            task.assigned_to_username ||
                                            matchedUser?.username ||
                                            `${matchedUser?.first_name || ""} ${matchedUser?.last_name || ""}`.trim() ||
                                            "Unassigned";

                                        const progress =
                                            status.toLowerCase() === "completed"
                                                ? 100
                                                : status.toLowerCase() === "in progress"
                                                ? 50
                                                : 0;

                                        return (
                                            <tr
                                                key={task.id}
                                                className={isSelected ? "selected" : ""}
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                }}
                                            >
                                                <td>
                                                    <strong>
                                                        {task.task_name ||
                                                            task.title ||
                                                            `Task ${task.id}`}
                                                    </strong>
                                                    <small>TASK-{task.id}</small>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`task-status ${
                                                            status.toLowerCase()
                                                                .replace(/\s+/g, "-")
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>{assignedUser}</td>

                                                <td>
                                                    <div className="sprint-progress-cell">
                                                        <div className="sprint-progress-track">
                                                            <div
                                                                className="sprint-progress-fill"
                                                                style={{
                                                                    width: `${progress}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <small>{progress}%</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                   {/* RIGHT: TASK DETAILS */}
                   {selectedTask && (
                        <>
                            <div
                                className="task-details-backdrop"
                                onClick={() => setSelectedTask(null)}
                            />
                        
                            <aside className="task-details-panel task-details-drawer">
                                {!selectedTask ? (
                                    <div className="task-details-empty">
                                        <Layers size={30} />
                                        <h4>Select a task</h4>
                                        <p>
                                            Click any task from the list to see its details here.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {(() => {
                                            const selectedTimeEntry = timeSummary.by_task.find(
                                                row =>
                                                    String(row.task_id) ===
                                                    String(selectedTask.id)
                                            );

                                            const timerRunning =
                                                String(activeTimer?.task_id) === String(selectedTask.id);


                                            const savedMinutes = Number(
                                                selectedTimeEntry?.total_minutes || 0
                                            );

                                            const estimatedMinutes =
                                                getTaskEstimatedMinutes(selectedTask);

                                            // Timer values will be connected to backend state
                                            const actualMinutes =
                                                savedMinutes +
                                                (timerRunning ? Math.floor(timerSeconds / 60) : 0);

                                        
                                            return (
                                                <>
                                                    {/* HEADER */}
                                                    <div className="task-details-header">
                                                        <div>
                                                            <span className="task-id">
                                                                TASK-{selectedTask.id}
                                                            </span>
                                                            <h2>
                                                                {selectedTask.task_name ||
                                                                    selectedTask.title ||
                                                                    `Task ${selectedTask.id}`}
                                                            </h2>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="task-details-close"
                                                            aria-label="Close task details"
                                                            onClick={() => setSelectedTask(null)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>

                                                    <div className="task-details-content">

                                                        {/* DESCRIPTION */}
                                                        <section className="task-info-section">
                                                            <h4>Description</h4>
                                                            <p className="task-description">
                                                                {selectedTask.description ||
                                                                    "No description provided."}
                                                            </p>
                                                        </section>

                                                        <div className="task-priority-assignee-row">                                          

                                                        {/* STATUS */}
                                                            <section className="task-info-section">
                                                                <h4>Status</h4>

                                                                <select
                                                                    className="task-status-select"
                                                                    value={selectedTask.status || "To Do"}
                                                                    onChange={e =>
                                                                        handleTaskStatusChange(
                                                                            selectedTask,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="To Do">To Do</option>
                                                                    <option value="In Progress">In Progress</option>
                                                                    <option value="Completed">Completed</option>
                                                                    <option value="On Hold">On Hold</option>
                                                                </select>
                                                            </section>

                                                            {/* ASSIGN USER - NEXT TO STATUS */}
                                                            <section className="task-info-section">
                                                                <h4>Assign User</h4>

                                                                <select
                                                                    className="task-status-select"
                                                                    value={
                                                                        selectedTask.assigned_to?.id ??
                                                                        selectedTask.assigned_to ??
                                                                        ""
                                                                    }
                                                                    onChange={(e) => {
                                                                        if (e.target.value) {
                                                                            handleTaskAssigneeChange(
                                                                                selectedTask,
                                                                                e.target.value
                                                                            );
                                                                        }
                                                                    }}     
                                                                >
                                                                    <option value="">Select user</option>

                                                                    {users.map((user) => (
                                                                        <option key={user.id} value={user.id}>
                                                                            {user.first_name
                                                                                ? `${user.first_name} ${user.last_name || ""}`.trim()
                                                                                : user.username}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </section>
                                                        </div>
                                                        
                                                        <div className="task-priority-assignee-row">

                                                            {/* PRIORITY */}
                                                            <section className="task-info-section">
                                                                <h4>Priority</h4>
                                                                <span className={`task-priority priority-${(
                                                                    selectedTask.priority || "medium"
                                                                ).toLowerCase()}`}>
                                                                    {selectedTask.priority || "Medium"}
                                                                </span>
                                                            </section>

                                                            {/* ASSIGNEE */}
                                                            <section className="task-info-section">
                                                                <h4>Assigned To</h4>
                                                                <p className="task-assignee">
                                                                    <Users size={15} />
                                                                    {selectedTask.assigned_to_name ||
                                                                        selectedTask.assigned_to_username ||
                                                                        (typeof selectedTask.assigned_to === "object"
                                                                            ? selectedTask.assigned_to?.username ||
                                                                            selectedTask.assigned_to?.first_name ||
                                                                            "Assigned user"
                                                                            : users.find(
                                                                                (user) => 
                                                                                    String(user.id) ===
                                                                                    String(selectedTask.assigned_to)
                                                                            )
                                                                                ? (() => {
                                                                                    const user = users.find(
                                                                                        (user) =>
                                                                                            String(user.id) ===
                                                                                            String(selectedTask.assigned_to)
                                                                                
                                                                                    );

                                                                                    return user.first_name
                                                                                        ? `${user.first_name} ${user.last_name || ""}`.trim()
                                                                                        : user.username;
                                                                                })()
                                                                                : "Unassigned")}
                                                                </p>
                                                            </section>
                                                        </div>

                                                        {/* TIME SUMMARY */}
                                                                                                
                                                    
                                                    {/* TASK SCHEDULE AND MANUAL TIME */}
            <section className="task-info-section task-schedule-section">
                <h4>Task Schedule</h4>

                <div className="schedule-date-grid">
                    <div className="schedule-field">
                        <label htmlFor="estimated-start-date">
                            Estimated Start Date
                        </label>

                        <input
                            id="estimated-start-date"
                            type="date"
                            name="start_date"
                            value={scheduleForm.start_date}
                            onChange={handleScheduleChange}
                        />
                    </div>

                    <div className="schedule-field">
                        <label htmlFor="estimated-end-date">
                            Estimated End Date
                        </label>

                        <input
                            id="estimated-end-date"
                            type="date"
                            name="due_date"
                            min={scheduleForm.start_date || undefined}
                            value={scheduleForm.due_date}
                            onChange={handleScheduleChange}
                        />
                    </div>

                    <div className="schedule-field">
                        <label htmlFor="actual-start-date">
                            Actual Start Date
                        </label>

                        <input
                            id="actual-start-date"
                            type="date"
                            name="actual_start_date"
                            value={scheduleForm.actual_start_date}
                            onChange={handleScheduleChange}
                        />
                    </div>

                    <div className="schedule-field">
                        <label htmlFor="actual-end-date">
                            Actual End Date
                        </label>

                        <input
                            id="actual-end-date"
                            type="date"
                            name="actual_end_date"
                            min={scheduleForm.actual_start_date || undefined}
                            value={scheduleForm.actual_end_date}
                            onChange={handleScheduleChange}
                        />
                    </div>
                </div>

                {/* ESTIMATED TIME */}
            <div className="schedule-time-group estimated-time-group">
                <label htmlFor="estimated-time">
                    Estimated Time
                </label>

                <input
                    id="estimated-time"
                    type="text"
                    value={scheduleForm.estimated_time}
                    onChange={(e) =>
                        setScheduleForm({
                            ...scheduleForm,
                            estimated_time: e.target.value
                        }) 
                    }
                    placeholder="e.g. 2h 30m"
                />

                <small>Planned effort</small>
            </div>

            {/* ACTUAL TIME */}
            <div className="schedule-time-group actual-time-group">
                <label htmlFor="actual-time">
                    Actual Time Taken
                </label>

                <input
                    id="actual-time"
                    type="text"
                    
                    value={scheduleForm.actual_time}
                    onChange={(e) =>
                        setScheduleForm({
                            ...scheduleForm,
                            actual_time: e.target.value
                        }) 
                    }
                    placeholder="e.g. 1h 45m"
                />

                <small>Actual effort</small>
            </div>

            <button
                type="button"
                className="save-schedule-button"
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
            >
                {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>

            {scheduleMessage && (
                <p className="schedule-message" role="status">
                    {scheduleMessage}
                </p>
            )}
            {scheduleMessage && (
                    <p className="schedule-message" role="status">
                        {scheduleMessage}
                    </p>
                )}
            </section>                                                        
                                                        
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </aside>
                        </>
                    )}

                </div>

                {showTimeLog && activeTimeTask && (
                <div
                    className="time-modal-overlay"
                    onClick={() => setShowTimeLog(false)}
                >
                    <form
                        className="time-modal"
                        onSubmit={handleSaveTimeLog}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="time-modal-header">
                            <div>
                                <span className="sprints-eyebrow">TIME TRACKING</span>
                                <h2>Log Work</h2>
                                <p>
                                    TASK-{activeTimeTask.id} ·{" "}
                                    {activeTimeTask.task_name ||
                                        activeTimeTask.title ||
                                        `Task ${activeTimeTask.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="time-modal-close"
                                onClick={() => setShowTimeLog(false)}
                            >
                                ×
                            </button>
                        </div>

                        {timeError && (
                            <div className="sprints-error">{timeError}</div>
                        )}

                        <div className="time-form-grid">
                            <label>
                                Hours
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={timeForm.hours}
                                    onChange={(e) =>
                                        setTimeForm(prev => ({
                                            ...prev,
                                            hours: e.target.value
                                        }))
                                    }
                                />
                            </label>

                            <label>
                                Minutes
                                <select
                                    value={timeForm.minutes}
                                    onChange={(e) =>
                                        setTimeForm(prev => ({
                                            ...prev,
                                            minutes: e.target.value
                                        }))
                                    }
                                >
                                    <option value="0">00 minutes</option>
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                </select>
                            </label>

                            <label className="time-form-full">
                                Work date
                                <input
                                    type="date"
                                    required
                                    max={new Date().toLocaleDateString("en-CA")}
                                    value={timeForm.work_date}
                                    onChange={(e) =>
                                        setTimeForm(prev => ({
                                            ...prev,
                                            work_date: e.target.value
                                        }))
                                    }
                                />
                            </label>

                            <label className="time-form-full">
                                Work description
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="What did you work on?"
                                    value={timeForm.description}
                                    onChange={(e) =>
                                        setTimeForm(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <div className="time-modal-actions">
                            <button
                                type="button"
                                className="sprint-cancel-button"
                                onClick={() => setShowTimeLog(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="sprints-create-button"
                                disabled={timeSaving}
                            >
                                {timeSaving ? "Saving..." : "Save Time Entry"}
                            </button>
                        </div>
                    </form>
                </div>
                )}

            </section>
        )}
        {/* COMPLETE SPRINT BUTTON  */}
        {showCompleteSprintModal && selectedSprint && (
            <div
                className="sprint-modal-overlay"
                onClick={() => {
                    if (!completingSprint) {
                        setShowCompleteSprintModal(false);
                    }
                }}
            >
                <div
                    className="complete-sprint-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>End Sprint</h2>

                    <p>
                        Finish <strong>{selectedSprint.sprint_name}</strong>?
                        Choose what to do with unfinished tasks below .
                    </p>

                    <div className="complete-sprint-summary">
                        <div>
                            <span>Completed tasks</span>
                            <strong>
                                {
                                    sprintTasks.filter(
                                        (task) =>
                                            getTaskStatus(task) === "Completed"
                                    ).length
                                }
                            </strong>
                        </div>

                        <div>
                            <span>Unfinished tasks</span>
                            <strong>
                                {
                                    sprintTasks.filter(
                                        (task) =>
                                            getTaskStatus(task) !== "Completed"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="unfinished-task-options">
                        <h4>What should happen to unfinished tasks?</h4>

                            <label className="unfinished-task-option">
                                    <input
                                        type="radio"
                                        name="unfinishedTaskAction"
                                        value="backlog"
                                        checked={unfinishedTaskAction === "backlog"}
                                        onChange={() => setUnfinishedTaskAction("backlog")}
                                    />

                                    <span>
                                        <strong>Move to Backlog</strong>
                                        <small>
                                            Remove unfinished tasks from this sprint.
                                        </small>
                                    </span>
                            </label>

                            <label className="unfinished-task-option">
                                <input
                                    type="radio"
                                    name="unfinishedTaskAction"
                                    value="carryover"
                                    checked={unfinishedTaskAction === ("carryover")}
                                    onChange={() => setUnfinishedTaskAction("carryover")}
                                />

                                <span>
                                    <strong>Carry Over to Next Sprint</strong>
                                    <small>Transfer unfinished tasks to another sprint.</small>
                                </span>
                            </label>

                            {unfinishedTaskAction === "carryover" && (
        <div className="next-sprint-select">
            <label htmlFor="nextSprint">Select destination sprint</label>

            <select
                id="nextSprint"
                value={nextSprintId}
                onChange={(e) => setNextSprintId(e.target.value)}
            >
                <option value="">-- Select Sprint --</option>

                {sprints
                    .filter(
                        (sprint) =>
                            String(sprint.id) !==
                                String(selectedSprint.id) &&
                            !["completed", "cancelled"].includes(
                                (sprint.status || "").toLowerCase()
                            )
                    )
                    .map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                            {sprint.sprint_name}
                        </option>
                    ))}
            </select>
        </div>
    )}
                        
                    </div>

                    {sprintTasks.filter(
                        (task) => getTaskStatus(task) !== "Completed"
                    ).length === 0 ? (
                        <p>All tasks are completed. No tasks need to move.</p>
                    ) : (
                        <ul className="unfinished-task-list">
                            {sprintTasks
                                .filter(
                                    (task) =>
                                        getTaskStatus(task) !== "Completed"
                                )
                                .map((task) => (
                                    <li key={task.id}>
                                        <span>
                                            {task.task_name ||
                                                task.title ||
                                                `Task ${task.id}`}
                                        </span>

                                        <small>
                                            {getTaskStatus(task)}
                                        </small>
                                    </li>
                                ))}
                        </ul>
                    )}

                    <div className="complete-sprint-actions">
                        <button
                            type="button"
                            className="sprint-cancel-button"
                            disabled={completingSprint}
                            onClick={() =>
                                setShowCompleteSprintModal(false)
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="complete-sprint-button"
                            disabled={
                                completingSprint ||
                                (
                                    unfinishedTaskAction === "carryover" &&
                                    !nextSprintId &&
                                    sprintTasks.some(
                                        (task) => getTaskStatus(task) !== "Completed"
                                    )
                                )
                            }
                            onClick={handleCompleteSprint}
                        >
                            {completingSprint
                                ? "Completing..."
                                : unfinishedTaskAction === "carryover"
                                    ? "Complete & Carry Over"
                                    : "Complete & Move to Backlog"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showStartSprintModal && selectedSprint && (
    <div className="sprint-modal-overlay">
        <div className="sprint-start-modal">
            <h2>Start Sprint</h2>
            <p>When would you like to start this sprint?</p>

            <label className="sprint-start-option">
                <input
                    type="checkbox"
                    checked={sprintStartChoice === "today"}
                    onChange={() => setSprintStartChoice("today")}
                />
                <span>
                    <strong>Today</strong>
                    <small>Start the sprint today.</small>
                </span>
            </label>

            <label className="sprint-start-option">
                <input
                    type="checkbox"
                    checked={sprintStartChoice === "tomorrow"}
                    onChange={() => setSprintStartChoice("tomorrow")}
                />
                <span>
                    <strong>Tomorrow</strong>
                    <small>Schedule the sprint for tomorrow.</small>
                </span>
            </label>

            <div className="sprint-modal-actions">
                <button
                    type="button"
                    className="sprint-cancel-button"
                    onClick={() => setShowStartSprintModal(false)}
                    disabled={startingSprint}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className="start-sprint-button"
                    onClick={() =>
                        handleStartSprint(
                            selectedSprint.id,
                            sprintStartChoice
                        )
                    }
                    disabled={startingSprint}
                >
                    {startingSprint ? "Processing..." : "Confirm"}
                </button>
            </div>
        </div>
    </div>
)}
    </div>
);
};
export default Sprints;
