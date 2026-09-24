/* =========================================================
   STUDYTRACK - REMINDERS PAGE
   Reminder Management
   ========================================================= */


/* =========================================================
   1. DOM ELEMENTS
   ========================================================= */

const reminderTitle = document.getElementById("reminderTitle");
const reminderDescription = document.getElementById("reminderDescription");
const reminderDate = document.getElementById("reminderDate");
const reminderTime = document.getElementById("reminderTime");

const createReminderButton = document.getElementById("createReminderButton");
const reminderMessage = document.getElementById("reminderMessage");
const remindersContainer = document.getElementById("remindersContainer");

const dayModeButton = document.getElementById("dayModeButton");
const nightModeButton = document.getElementById("nightModeButton");

const logoutButton = document.getElementById("logoutButton");


/* =========================================================
   2. THEME MANAGEMENT
   ========================================================= */

function applyTheme(theme) {
    if (theme === "night") {
        document.body.classList.add("night-mode");

        if (dayModeButton) {
            dayModeButton.classList.remove("active");
        }

        if (nightModeButton) {
            nightModeButton.classList.add("active");
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
    dayModeButton.addEventListener("click", () => {
        localStorage.setItem("studytrack-theme", "day");
        applyTheme("day");
    });
}


if (nightModeButton) {
    nightModeButton.addEventListener("click", () => {
        localStorage.setItem("studytrack-theme", "night");
        applyTheme("night");
    });
}


/* =========================================================
   3. LOAD CURRENT USER
   ========================================================= */

async function loadUser() {
    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            window.location.href = "/login.html";
            return null;
        }

        const data = await response.json();

        /*
           The StudyTrack API returns the authenticated
           user inside the "user" property.

           Example:
           {
               "user": {
                   "id": 3,
                   "full_name": "Elvis Test",
                   "email": "elvistest@studytrack.com"
               }
           }

           Therefore we check data.user instead of
           data.logged_in.
        */

        if (!data.user) {
            window.location.href = "/login.html";
            return null;
        }

        return data.user;
    } catch (error) {
        console.error("Failed to load user:", error);
        window.location.href = "/login.html";
        return null;
    }
}


/* =========================================================
   4. SECURITY - ESCAPE HTML
   ========================================================= */

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


/* =========================================================
   5. STATUS NORMALIZATION
   ========================================================= */

function normalizeStatus(status) {
    const value = String(status || "pending")
        .trim()
        .toLowerCase();

    if (value === "completed") {
        return "completed";
    }

    return "pending";
}


/* =========================================================
   6. DATE HELPERS
   ========================================================= */

function getDateValue(dateValue) {
    if (!dateValue) {
        return "";
    }

    if (typeof dateValue === "string") {
        return dateValue.substring(0, 10);
    }

    return "";
}


function formatDateForDisplay(dateValue) {
    const cleanDate = getDateValue(dateValue);

    if (!cleanDate) {
        return "No date";
    }

    const parts = cleanDate.split("-");

    if (parts.length !== 3) {
        return cleanDate;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function formatTimeForDisplay(timeValue) {
    if (!timeValue) {
        return "No time";
    }

    const cleanTime = String(timeValue).substring(0, 5);
    const parts = cleanTime.split(":");

    if (parts.length !== 2) {
        return cleanTime;
    }

    let hour = parseInt(parts[0], 10);
    const minute = parts[1];

    if (Number.isNaN(hour)) {
        return cleanTime;
    }

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${hour}:${minute} ${period}`;
}


/* =========================================================
   7. CHECK WHETHER A REMINDER IS OVERDUE
   ========================================================= */

function isReminderOverdue(
    reminderDateValue,
    reminderTimeValue,
    status
) {
    const normalizedStatus = normalizeStatus(status);

    /*
       Completed reminders are never shown as overdue.
    */

    if (normalizedStatus === "completed") {
        return false;
    }

    const dateValue = getDateValue(reminderDateValue);

    if (!dateValue) {
        return false;
    }

    let timeValue = "23:59";

    if (reminderTimeValue) {
        timeValue = String(reminderTimeValue).substring(0, 5);
    }

    const reminderDateTime = new Date(
        `${dateValue}T${timeValue}:00`
    );

    if (Number.isNaN(reminderDateTime.getTime())) {
        return false;
    }

    return reminderDateTime.getTime() < Date.now();
}


/* =========================================================
   8. GET REMINDER DATE/TIME VALUE
   Used for sorting reminders.
   ========================================================= */

function getReminderDateTime(reminder) {
    const dateValue = getDateValue(
        reminder.reminder_date || reminder.date
    );

    if (!dateValue) {
        return Number.MAX_SAFE_INTEGER;
    }

    let timeValue =
        reminder.reminder_time ||
        reminder.time ||
        "23:59";

    timeValue = String(timeValue).substring(0, 5);

    const dateTime = new Date(
        `${dateValue}T${timeValue}:00`
    );

    const timestamp = dateTime.getTime();

    if (Number.isNaN(timestamp)) {
        return Number.MAX_SAFE_INTEGER;
    }

    return timestamp;
}


/* =========================================================
   9. GET REMINDER BY ID
   ========================================================= */

function getReminderById(id) {
    const reminders = window.studyTrackReminders || [];

    const reminder = reminders.find(
        item => String(item.id) === String(id)
    );

    return reminder || null;
}


/* =========================================================
   10. DISPLAY FORM MESSAGE
   ========================================================= */

function showMessage(message, type = "") {
    if (!reminderMessage) {
        return;
    }

    reminderMessage.textContent = message;
    reminderMessage.className = "form-message";

    if (message) {
        reminderMessage.classList.add("show");
    }

    if (type) {
        reminderMessage.classList.add(type);
    }
}


/* =========================================================
   11. CREATE REMINDER
   ========================================================= */

async function createReminder() {
    const title = reminderTitle?.value.trim() || "";
    const description =
        reminderDescription?.value.trim() || "";
    const date = reminderDate?.value || "";
    const time = reminderTime?.value || "";

    if (!title) {
        showMessage(
            "Please enter a reminder title.",
            "error"
        );

        reminderTitle?.focus();
        return;
    }

    if (!date) {
        showMessage(
            "Please select a reminder date.",
            "error"
        );

        reminderDate?.focus();
        return;
    }

    if (!time) {
        showMessage(
            "Please select a reminder time.",
            "error"
        );

        reminderTime?.focus();
        return;
    }

    try {
        createReminderButton.disabled = true;

        showMessage("Creating reminder...");

        const response = await fetch(
            "/api/reminders",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    description,
                    reminder_date: date,
                    reminder_time: time
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to create reminder."
            );
        }

        showMessage(
            "Reminder created successfully.",
            "success"
        );

        if (reminderTitle) {
            reminderTitle.value = "";
        }

        if (reminderDescription) {
            reminderDescription.value = "";
        }

        if (reminderDate) {
            reminderDate.value = "";
        }

        if (reminderTime) {
            reminderTime.value = "";
        }

        await loadReminders();
    } catch (error) {
        console.error(
            "Create reminder error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to create reminder.",
            "error"
        );
    } finally {
        createReminderButton.disabled = false;
    }
}


if (createReminderButton) {
    createReminderButton.addEventListener(
        "click",
        createReminder
    );
}


/* =========================================================
   12. EDIT REMINDER
   ========================================================= */

async function editReminder(id) {
    const reminder = getReminderById(id);

    if (!reminder) {
        showMessage(
            "The selected reminder could not be found.",
            "error"
        );

        return;
    }

    const currentTitle = reminder.title || "";

    const newTitle = window.prompt(
        "Edit reminder title:",
        currentTitle
    );

    if (newTitle === null) {
        return;
    }

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
        window.alert(
            "Reminder title cannot be empty."
        );

        return;
    }

    const currentDescription =
        reminder.description || "";

    const newDescription = window.prompt(
        "Edit reminder description:",
        currentDescription
    );

    if (newDescription === null) {
        return;
    }

    const currentDate = getDateValue(
        reminder.reminder_date ||
        reminder.date
    );

    const newDate = window.prompt(
        "Edit reminder date (YYYY-MM-DD):",
        currentDate
    );

    if (newDate === null) {
        return;
    }

    const currentTime = String(
        reminder.reminder_time ||
        reminder.time ||
        ""
    ).substring(0, 5);

    const newTime = window.prompt(
        "Edit reminder time (HH:MM):",
        currentTime
    );

    if (newTime === null) {
        return;
    }

    try {
        const response = await fetch(
            `/api/reminders/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: newDescription.trim(),
                    reminder_date: newDate.trim(),
                    reminder_time: newTime.trim()
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to update reminder."
            );
        }

        showMessage(
            "Reminder updated successfully.",
            "success"
        );

        await loadReminders();
    } catch (error) {
        console.error(
            "Edit reminder error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to update reminder.",
            "error"
        );
    }
}


/* =========================================================
   13. DELETE REMINDER
   ========================================================= */

async function deleteReminder(id) {
    const reminder = getReminderById(id);

    if (!reminder) {
        showMessage(
            "The selected reminder could not be found.",
            "error"
        );

        return;
    }

    const confirmed = window.confirm(
        `Delete the reminder "${reminder.title}"?`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/api/reminders/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to delete reminder."
            );
        }

        showMessage(
            "Reminder deleted successfully.",
            "success"
        );

        await loadReminders();
    } catch (error) {
        console.error(
            "Delete reminder error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to delete reminder.",
            "error"
        );
    }
}


/* =========================================================
   14. UPDATE REMINDER STATUS
   ========================================================= */

async function updateReminderStatus(id, status) {
    const normalizedStatus =
        normalizeStatus(status);

    try {
        const response = await fetch(
            `/api/reminders/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: normalizedStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to update reminder status."
            );
        }

        await loadReminders();
    } catch (error) {
        console.error(
            "Update reminder status error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to update reminder status.",
            "error"
        );
    }
}


/* =========================================================
   15. REMINDER ICON
   ========================================================= */

function getReminderIcon() {
    return `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
            <path d="M10 21h4"></path>
        </svg>
    `;
}


/* =========================================================
   16. CREATE REMINDER CARD
   ========================================================= */

function createReminderCard(reminder) {
    const id = reminder.id;

    const title = escapeHtml(
        reminder.title ||
        "Untitled Reminder"
    );

    const description = escapeHtml(
        reminder.description ||
        "No description provided."
    );

    const dateValue = getDateValue(
        reminder.reminder_date ||
        reminder.date
    );

    const timeValue = String(
        reminder.reminder_time ||
        reminder.time ||
        ""
    ).substring(0, 5);

    const displayDate =
        formatDateForDisplay(dateValue);

    const displayTime =
        formatTimeForDisplay(timeValue);

    const normalizedStatus =
        normalizeStatus(reminder.status);

    const overdue = isReminderOverdue(
        dateValue,
        timeValue,
        normalizedStatus
    );

    let displayStatus = "Pending";

    if (normalizedStatus === "completed") {
        displayStatus = "Completed";
    } else if (overdue) {
        displayStatus = "Overdue";
    }

    const statusClass =
        normalizedStatus === "completed"
            ? "completed"
            : "pending";

    return `
        <article
            class="reminder-card"
            data-reminder-id="${escapeHtml(id)}"
        >

            <div class="reminder-icon">
                ${getReminderIcon()}
            </div>

            <div class="reminder-content">

                <h3>
                    ${title}
                </h3>

                <p>
                    ${description}
                </p>

                <div class="reminder-date">
                    Date:
                    ${escapeHtml(displayDate)}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    Time:
                    ${escapeHtml(displayTime)}
                </div>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        flex-wrap:wrap;
                        gap:10px;
                        margin-top:14px;
                    "
                >

                    <span
                        class="reminder-status ${statusClass}"
                    >
                        ${escapeHtml(displayStatus)}
                    </span>

                    <label
                        style="
                            color:var(--text-secondary);
                            font-size:10px;
                            font-weight:800;
                        "
                    >
                        Status
                    </label>

                    <select
                        class="reminder-status-select"
                        data-action="status"
                        data-id="${escapeHtml(id)}"
                        aria-label="Change reminder status"
                        style="
                            min-width:140px;
                            height:34px;
                            padding:0 10px;
                            border:1px solid var(--border);
                            border-radius:8px;
                            outline:none;
                            background:var(--surface);
                            color:var(--text-primary);
                            font-size:10px;
                            font-weight:600;
                        "
                    >

                        <option
                            value="pending"
                            ${normalizedStatus === "pending" ? "selected" : ""}
                        >
                            Pending
                        </option>

                        <option
                            value="completed"
                            ${normalizedStatus === "completed" ? "selected" : ""}
                        >
                            Completed
                        </option>

                    </select>

                </div>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        flex-wrap:wrap;
                        gap:10px;
                        margin-top:14px;
                    "
                >

                    <button
                        type="button"
                        class="goal-action-button"
                        data-action="edit"
                        data-id="${escapeHtml(id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="goal-action-button danger"
                        data-action="delete"
                        data-id="${escapeHtml(id)}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   17. CREATE REMINDER GROUP
   ========================================================= */

function createReminderGroup(
    eyebrow,
    title,
    description,
    reminders
) {
    if (!reminders.length) {
        return "";
    }

    return `
        <section
            class="reminder-group"
            style="margin-bottom:30px;"
        >

            <div
                class="panel-heading"
                style="
                    padding:0 24px;
                    margin-bottom:16px;
                "
            >

                <div>

                    <p class="section-eyebrow">
                        ${escapeHtml(eyebrow)}
                    </p>

                    <h3>
                        ${escapeHtml(title)}
                    </h3>

                    <p>
                        ${escapeHtml(description)}
                    </p>

                </div>

            </div>

            <div class="reminder-list">
                ${reminders
            .map(createReminderCard)
            .join("")}
            </div>

        </section>
    `;
}


/* =========================================================
   18. LOAD AND ORGANIZE REMINDERS
   ========================================================= */

async function loadReminders() {
    if (!remindersContainer) {
        return;
    }

    remindersContainer.innerHTML = `
        <div class="empty-state">
            <p>Loading reminders...</p>
        </div>
    `;

    try {
        const response = await fetch(
            "/api/reminders"
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load reminders."
            );
        }

        const reminders = Array.isArray(data)
            ? data
            : Array.isArray(data.reminders)
                ? data.reminders
                : [];

        /*
           Keep the current reminders available globally
           so Edit/Delete can find the selected reminder.
        */

        window.studyTrackReminders = reminders;

        if (reminders.length === 0) {
            remindersContainer.innerHTML = `
                <div class="empty-state">
                    <p>
                        You do not have any reminders yet.
                    </p>
                </div>
            `;

            return;
        }


        /* -----------------------------------------------------
           Separate reminders into three groups
           ----------------------------------------------------- */

        const overdueReminders = [];
        const upcomingReminders = [];
        const completedReminders = [];


        reminders.forEach(reminder => {
            const status =
                normalizeStatus(reminder.status);

            const dateValue =
                getDateValue(
                    reminder.reminder_date ||
                    reminder.date
                );

            const timeValue =
                String(
                    reminder.reminder_time ||
                    reminder.time ||
                    ""
                ).substring(0, 5);


            if (status === "completed") {
                completedReminders.push(reminder);

            } else if (
                isReminderOverdue(
                    dateValue,
                    timeValue,
                    status
                )
            ) {
                overdueReminders.push(reminder);

            } else {
                upcomingReminders.push(reminder);
            }
        });


        /* -----------------------------------------------------
           Sort overdue reminders

           Oldest overdue reminder first.
           ----------------------------------------------------- */

        overdueReminders.sort(
            (a, b) =>
                getReminderDateTime(a) -
                getReminderDateTime(b)
        );


        /* -----------------------------------------------------
           Sort upcoming reminders

           Earliest upcoming reminder first.
           ----------------------------------------------------- */

        upcomingReminders.sort(
            (a, b) =>
                getReminderDateTime(a) -
                getReminderDateTime(b)
        );


        /* -----------------------------------------------------
           Sort completed reminders

           Most recently scheduled completed reminder first.
           ----------------------------------------------------- */

        completedReminders.sort(
            (a, b) =>
                getReminderDateTime(b) -
                getReminderDateTime(a)
        );


        /* -----------------------------------------------------
           Build the three sections
           ----------------------------------------------------- */

        let html = "";

        html += createReminderGroup(
            "NEEDS ATTENTION",
            "Overdue",
            "These reminders have passed their scheduled date or time.",
            overdueReminders
        );

        html += createReminderGroup(
            "COMING UP",
            "Upcoming",
            "Your next scheduled reminders, starting with the earliest.",
            upcomingReminders
        );

        html += createReminderGroup(
            "FINISHED",
            "Completed",
            "Reminders that you have already completed.",
            completedReminders
        );


        remindersContainer.innerHTML = html;

    } catch (error) {
        console.error(
            "Load reminders error:",
            error
        );

        remindersContainer.innerHTML = `
            <div class="empty-state">
                <p>
                    ${escapeHtml(
            error.message ||
            "Failed to load reminders."
        )}
                </p>
            </div>
        `;
    }
}


/* =========================================================
   19. REMINDER EVENT DELEGATION
   ========================================================= */

if (remindersContainer) {

    remindersContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.action;

            const id =
                button.dataset.id;

            if (!id) {
                return;
            }

            if (action === "edit") {
                editReminder(id);
            }

            if (action === "delete") {
                deleteReminder(id);
            }
        }
    );


    remindersContainer.addEventListener(
        "change",
        event => {

            const select =
                event.target.closest(
                    '[data-action="status"]'
                );

            if (!select) {
                return;
            }

            const id =
                select.dataset.id;

            const status =
                select.value;

            if (!id) {
                return;
            }

            updateReminderStatus(
                id,
                status
            );
        }
    );
}


/* =========================================================
   20. LOGOUT
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/logout",
                    {
                        method: "POST"
                    }
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            } finally {

                window.location.href =
                    "/login.html";
            }
        }
    );
}


/* =========================================================
   21. STARTUP
   ========================================================= */

loadSavedTheme();

loadUser();

loadReminders();