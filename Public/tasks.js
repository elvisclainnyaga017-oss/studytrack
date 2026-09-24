// ============================================================
// STUDYTRACK - TASK MANAGEMENT
// File: Public/tasks.js
// ============================================================


// ------------------------------------------------------------
// GET HTML ELEMENTS
// ------------------------------------------------------------

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const taskForm = document.getElementById("taskForm");
const taskMessage = document.getElementById("taskMessage");
const tasksContainer = document.getElementById("tasksContainer");

const logoutButton = document.getElementById("logoutButton");

const dayModeButton = document.getElementById("dayModeButton");
const nightModeButton = document.getElementById("nightModeButton");


// ------------------------------------------------------------
// THEME MANAGEMENT
// ------------------------------------------------------------

function applyTheme(theme) {
    if (theme === "night") {
        document.body.classList.add("night-mode");

        if (nightModeButton) {
            nightModeButton.classList.add("active");
        }

        if (dayModeButton) {
            dayModeButton.classList.remove("active");
        }
    } else {
        document.body.classList.remove("night-mode");

        if (dayModeButton) {
            dayModeButton.classList.add("active");
        }

        if (nightModeButton) {
            nightModeButton.classList.remove("active");
        }
    }
}


function loadSavedTheme() {
    const savedTheme = localStorage.getItem("studytrack-theme");

    if (savedTheme === "night") {
        applyTheme("night");
    } else {
        applyTheme("day");
    }
}


if (dayModeButton) {
    dayModeButton.addEventListener("click", function () {
        localStorage.setItem("studytrack-theme", "day");
        applyTheme("day");
    });
}


if (nightModeButton) {
    nightModeButton.addEventListener("click", function () {
        localStorage.setItem("studytrack-theme", "night");
        applyTheme("night");
    });
}


// ------------------------------------------------------------
// ESCAPE HTML
// ------------------------------------------------------------

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ------------------------------------------------------------
// SHOW FORM MESSAGE
// ------------------------------------------------------------

function showTaskMessage(message, type) {
    if (!taskMessage) {
        return;
    }

    taskMessage.textContent = message;
    taskMessage.className = "form-message";

    if (type) {
        taskMessage.classList.add(type);
    }
}


// ------------------------------------------------------------
// LOAD LOGGED-IN USER
// ------------------------------------------------------------

async function loadUser() {
    try {
        const response = await fetch("/api/me", {
            credentials: "include"
        });

        if (!response.ok) {
            window.location.href = "/login.html";
            return;
        }

        const data = await response.json();

        if (data.user) {
            userName.textContent = data.user.full_name;
            userEmail.textContent = data.user.email;
        }
    } catch (error) {
        console.error("Error loading user:", error);
        window.location.href = "/login.html";
    }
}


// ------------------------------------------------------------
// FORMAT DATE
// ------------------------------------------------------------

function formatDateForDisplay(dateValue) {
    if (!dateValue) {
        return "No due date";
    }

    const dateText = String(dateValue).split("T")[0];
    const parts = dateText.split("-");

    if (parts.length !== 3) {
        return "No due date";
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// ------------------------------------------------------------
// STATUS CLASS
// ------------------------------------------------------------

function getStatusClass(status) {
    const normalizedStatus = String(status || "Pending").toLowerCase();

    if (normalizedStatus === "completed") {
        return "completed";
    }

    if (normalizedStatus === "in progress") {
        return "in-progress";
    }

    return "pending";
}


// ------------------------------------------------------------
// PRIORITY CLASS
// ------------------------------------------------------------

function getPriorityClass(priority) {
    const normalizedPriority = String(priority || "Medium").toLowerCase();

    if (normalizedPriority === "high") {
        return "high";
    }

    if (normalizedPriority === "low") {
        return "low";
    }

    return "medium";
}


// ------------------------------------------------------------
// CREATE TASK
// ------------------------------------------------------------

if (taskForm) {
    taskForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const titleInput = document.getElementById("taskTitle");
        const descriptionInput = document.getElementById("taskDescription");
        const dueDateInput = document.getElementById("taskDueDate");
        const priorityInput = document.getElementById("taskPriority");
        const taskButton = document.getElementById("taskButton");

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (!title) {
            showTaskMessage("Please enter a task title.", "error");
            return;
        }

        taskButton.disabled = true;
        taskButton.textContent = "Creating...";

        showTaskMessage("Creating task...");

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    title: title,
                    description: description,
                    due_date: dueDate || null,
                    priority: priority
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showTaskMessage(
                    data.message || "Could not create task.",
                    "error"
                );
                return;
            }

            showTaskMessage(
                "Task created successfully!",
                "success"
            );

            taskForm.reset();

            priorityInput.value = "Medium";

            await loadTasks();

        } catch (error) {
            console.error("Error creating task:", error);

            showTaskMessage(
                "Something went wrong while creating the task.",
                "error"
            );
        } finally {
            taskButton.disabled = false;
            taskButton.textContent = "Create Task";
        }
    });
}


// ------------------------------------------------------------
// EDIT TASK
// ------------------------------------------------------------

async function editTask(taskId) {
    try {
        const response = await fetch("/api/tasks", {
            credentials: "include"
        });

        if (!response.ok) {
            alert("Could not load the task.");
            return;
        }

        const data = await response.json();

        const task = data.tasks.find(function (item) {
            return Number(item.id) === Number(taskId);
        });

        if (!task) {
            alert("Task not found.");
            return;
        }

        const newTitle = prompt(
            "Task title:",
            task.title || ""
        );

        if (newTitle === null) {
            return;
        }

        const newDescription = prompt(
            "Task description:",
            task.description || ""
        );

        if (newDescription === null) {
            return;
        }

        const newDueDate = prompt(
            "Due date (YYYY-MM-DD):",
            task.due_date
                ? String(task.due_date).split("T")[0]
                : ""
        );

        if (newDueDate === null) {
            return;
        }

        const newPriority = prompt(
            "Priority (Low, Medium, High):",
            task.priority || "Medium"
        );

        if (newPriority === null) {
            return;
        }

        const newStatus = prompt(
            "Status (Pending, In Progress, Completed):",
            task.status || "Pending"
        );

        if (newStatus === null) {
            return;
        }

        const updateResponse = await fetch(
            `/api/tasks/${taskId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    title: newTitle.trim(),
                    description: newDescription.trim(),
                    due_date: newDueDate || null,
                    priority: newPriority.trim(),
                    status: newStatus.trim()
                })
            }
        );

        const result = await updateResponse.json();

        if (!updateResponse.ok) {
            alert(
                result.message || "Could not update the task."
            );
            return;
        }

        await loadTasks();

    } catch (error) {
        console.error("Error editing task:", error);
        alert("Something went wrong while editing the task.");
    }
}


// ------------------------------------------------------------
// DELETE TASK
// ------------------------------------------------------------

async function deleteTask(taskId) {
    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/api/tasks/${taskId}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.message || "Could not delete the task."
            );
            return;
        }

        await loadTasks();

    } catch (error) {
        console.error("Error deleting task:", error);
        alert("Something went wrong while deleting the task.");
    }
}


// ------------------------------------------------------------
// UPDATE TASK STATUS
// ------------------------------------------------------------

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch("/api/tasks", {
            credentials: "include"
        });

        if (!response.ok) {
            alert("Could not load the task.");
            return;
        }

        const data = await response.json();

        const task = data.tasks.find(function (item) {
            return Number(item.id) === Number(taskId);
        });

        if (!task) {
            alert("Task not found.");
            return;
        }

        const updateResponse = await fetch(
            `/api/tasks/${taskId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    title: task.title,
                    description: task.description || "",
                    due_date: task.due_date || null,
                    priority: task.priority || "Medium",
                    status: newStatus
                })
            }
        );

        const result = await updateResponse.json();

        if (!updateResponse.ok) {
            alert(
                result.message || "Could not update task status."
            );
            return;
        }

        await loadTasks();

    } catch (error) {
        console.error("Error updating task status:", error);
        alert(
            "Something went wrong while updating the task."
        );
    }
}


// ------------------------------------------------------------
// RENDER TASKS
// ------------------------------------------------------------

function renderTasks(tasks) {
    if (!tasksContainer) {
        return;
    }

    if (!tasks || tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon" aria-hidden="true">

                    <svg
                        viewBox="0 0 24 24"
                        width="28"
                        height="28"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <rect
                            x="4"
                            y="3"
                            width="16"
                            height="18"
                            rx="2"
                        ></rect>

                        <path d="M8 8h8"></path>
                        <path d="M8 12h8"></path>
                        <path d="M8 16h5"></path>
                    </svg>

                </div>

                <h3>No tasks yet</h3>

                <p>
                    Create your first task above to start
                    organizing your workload.
                </p>

            </div>
        `;

        return;
    }

    tasksContainer.innerHTML = tasks.map(function (task) {

        const status = task.status || "Pending";
        const priority = task.priority || "Medium";

        const statusClass = getStatusClass(status);
        const priorityClass = getPriorityClass(priority);

        const safeTitle = escapeHtml(
            task.title || "Untitled Task"
        );

        const safeDescription = escapeHtml(
            task.description || "No description provided."
        );

        const formattedDueDate = formatDateForDisplay(
            task.due_date
        );

        return `
            <article class="goal-card task-card">

                <div class="goal-card-header">

                    <div>

                        <h3 class="goal-card-title">
                            ${safeTitle}
                        </h3>

                        <span class="goal-status task-status ${statusClass}">
                            ${escapeHtml(status)}
                        </span>

                    </div>

                </div>


                <div class="task-card-description">

                    <p>
                        ${safeDescription}
                    </p>

                </div>


                <div class="goal-meta task-meta">

                    <span>
                        <strong>Due:</strong>
                        ${escapeHtml(formattedDueDate)}
                    </span>

                    <span class="task-priority ${priorityClass}">
                        <strong>Priority:</strong>
                        ${escapeHtml(priority)}
                    </span>

                </div>


                <div class="task-status-control">

                    <label for="status-${task.id}">
                        Update status
                    </label>

                    <select
                        id="status-${task.id}"
                        class="task-status-select"
                        data-task-id="${task.id}"
                    >

                        <option
                            value="Pending"
                            ${status === "Pending" ? "selected" : ""}
                        >
                            Pending
                        </option>

                        <option
                            value="In Progress"
                            ${status === "In Progress" ? "selected" : ""}
                        >
                            In Progress
                        </option>

                        <option
                            value="Completed"
                            ${status === "Completed" ? "selected" : ""}
                        >
                            Completed
                        </option>

                    </select>

                </div>


                <div class="goal-actions">

                    <button
                        type="button"
                        class="goal-action-button edit"
                        data-action="edit"
                        data-task-id="${task.id}"
                    >
                        Edit Task
                    </button>

                    <button
                        type="button"
                        class="goal-action-button delete"
                        data-action="delete"
                        data-task-id="${task.id}"
                    >
                        Delete Task
                    </button>

                </div>

            </article>
        `;
    }).join("");

    attachTaskEventListeners();
}


// ------------------------------------------------------------
// ATTACH TASK EVENT LISTENERS
// ------------------------------------------------------------

function attachTaskEventListeners() {

    const statusSelects = document.querySelectorAll(
        ".task-status-select"
    );

    statusSelects.forEach(function (select) {

        select.addEventListener("change", function () {

            const taskId = select.dataset.taskId;
            const newStatus = select.value;

            updateTaskStatus(
                taskId,
                newStatus
            );
        });
    });


    const editButtons = document.querySelectorAll(
        '[data-action="edit"]'
    );

    editButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const taskId = button.dataset.taskId;

            editTask(taskId);
        });
    });


    const deleteButtons = document.querySelectorAll(
        '[data-action="delete"]'
    );

    deleteButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const taskId = button.dataset.taskId;

            deleteTask(taskId);
        });
    });
}


// ------------------------------------------------------------
// LOAD TASKS
// ------------------------------------------------------------

async function loadTasks() {

    if (!tasksContainer) {
        return;
    }

    tasksContainer.innerHTML = `
        <div class="empty-state">

            <p>
                Loading your tasks...
            </p>

        </div>
    `;

    try {

        const response = await fetch("/api/tasks", {
            credentials: "include"
        });

        if (response.status === 401) {
            window.location.href = "/login.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load tasks.");
        }

        const data = await response.json();

        renderTasks(data.tasks || []);

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        tasksContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Could not load tasks
                </h3>

                <p>
                    Something went wrong while loading your
                    tasks. Please refresh the page and try again.
                </p>

            </div>
        `;
    }
}


// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                const response = await fetch(
                    "/api/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                if (response.ok) {
                    window.location.href = "/login.html";
                } else {
                    alert("Could not log out.");
                }

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Something went wrong while logging out."
                );
            }
        }
    );
}


// ------------------------------------------------------------
// START TASK PAGE
// ------------------------------------------------------------

loadSavedTheme();
loadUser();
loadTasks();