// ============================================================
// STUDYTRACK - REMINDERS PAGE
// File: Public/reminders.js
// ============================================================


// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const reminderTitle =
    document.getElementById("reminderTitle");

const reminderDescription =
    document.getElementById("reminderDescription");

const reminderDate =
    document.getElementById("reminderDate");

const reminderTime =
    document.getElementById("reminderTime");

const createReminderButton =
    document.getElementById("createReminderButton");

const reminderMessage =
    document.getElementById("reminderMessage");

const remindersContainer =
    document.getElementById("remindersContainer");

const dayModeButton =
    document.getElementById("dayModeButton");

const nightModeButton =
    document.getElementById("nightModeButton");

const logoutButton =
    document.getElementById("logoutButton");


// ------------------------------------------------------------
// MOBILE MENU ELEMENTS
// ------------------------------------------------------------

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const studyTrackSidebar =
    document.getElementById("studyTrackSidebar");

const mobileMenuOverlay =
    document.getElementById("mobileMenuOverlay");


// ------------------------------------------------------------
// MOBILE MENU MANAGEMENT
// ------------------------------------------------------------

function setMobileMenu(open) {

    if (!mobileMenuButton || !studyTrackSidebar) {
        return;
    }

    studyTrackSidebar.classList.toggle(
        "mobile-menu-open",
        open
    );

    mobileMenuButton.classList.toggle(
        "menu-open",
        open
    );

    mobileMenuButton.setAttribute(
        "aria-expanded",
        String(open)
    );

    mobileMenuButton.setAttribute(
        "aria-label",
        open
            ? "Close navigation menu"
            : "Open navigation menu"
    );

    if (mobileMenuOverlay) {

        mobileMenuOverlay.classList.toggle(
            "active",
            open
        );

        mobileMenuOverlay.setAttribute(
            "aria-hidden",
            String(!open)
        );
    }

    document.body.classList.toggle(
        "mobile-menu-active",
        open
    );
}


if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        function () {

            const isOpen =
                mobileMenuButton.classList.contains(
                    "menu-open"
                );

            setMobileMenu(!isOpen);
        }
    );
}


if (mobileMenuOverlay) {

    mobileMenuOverlay.addEventListener(
        "click",
        function () {

            setMobileMenu(false);
        }
    );
}


document
    .querySelectorAll(".sidebar-nav-link")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                setMobileMenu(false);
            }
        );
    });


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            setMobileMenu(false);
        }
    }
);


window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 720) {

            setMobileMenu(false);
        }
    }
);


// ------------------------------------------------------------
// THEME MANAGEMENT
// ------------------------------------------------------------

function applyTheme(theme) {

    const isNight =
        theme === "night";

    document.body.classList.toggle(
        "night-mode",
        isNight
    );

    if (dayModeButton) {

        dayModeButton.disabled = false;

        dayModeButton.classList.toggle(
            "active",
            !isNight
        );

        dayModeButton.setAttribute(
            "aria-pressed",
            String(!isNight)
        );
    }

    if (nightModeButton) {

        nightModeButton.disabled = false;

        nightModeButton.classList.toggle(
            "active",
            isNight
        );

        nightModeButton.setAttribute(
            "aria-pressed",
            String(isNight)
        );
    }
}


function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "studytrack-theme"
        );

    if (savedTheme === "night") {

        applyTheme("night");

    } else {

        applyTheme("day");
    }
}


if (dayModeButton) {

    dayModeButton.disabled = false;

    dayModeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.setItem(
                "studytrack-theme",
                "day"
            );

            applyTheme("day");
        }
    );
}


if (nightModeButton) {

    nightModeButton.disabled = false;

    nightModeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.setItem(
                "studytrack-theme",
                "night"
            );

            applyTheme("night");
        }
    );
}


// ------------------------------------------------------------
// LOAD CURRENT USER
// ------------------------------------------------------------

async function loadUser() {

    try {

        const response =
            await fetch(
                "/api/me",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        if (!response.ok) {

            console.error(
                "User session request failed:",
                response.status
            );

            window.location.href =
                "/login.html";

            return null;
        }

        const data =
            await response.json();

        if (!data || !data.user) {

            console.error(
                "No authenticated user returned from /api/me."
            );

            window.location.href =
                "/login.html";

            return null;
        }

        const currentUser =
            data.user;

        if (userName) {

            userName.textContent =
                currentUser.full_name ||
                "User";
        }

        if (userEmail) {

            userEmail.textContent =
                currentUser.email ||
                "";
        }

        return currentUser;

    } catch (error) {

        console.error(
            "Failed to load user:",
            error
        );

        window.location.href =
            "/login.html";

        return null;
    }
}


// ------------------------------------------------------------
// SECURITY - ESCAPE HTML
// ------------------------------------------------------------

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

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
// STATUS NORMALIZATION
// ------------------------------------------------------------

function normalizeStatus(status) {

    const value =
        String(
            status || "pending"
        )
            .trim()
            .toLowerCase();

    if (value === "completed") {

        return "completed";
    }

    return "pending";
}


// ------------------------------------------------------------
// DATE HELPERS
// ------------------------------------------------------------

function getDateValue(dateValue) {

    if (!dateValue) {
        return "";
    }

    if (typeof dateValue === "string") {

        return dateValue.substring(
            0,
            10
        );
    }

    return "";
}


function formatDateForDisplay(
    dateValue
) {

    const cleanDate =
        getDateValue(
            dateValue
        );

    if (!cleanDate) {

        return "No date";
    }

    const parts =
        cleanDate.split("-");

    if (parts.length !== 3) {

        return cleanDate;
    }

    return `${parts[2]} /${parts[1]}/${parts[0]}`;
}


function formatTimeForDisplay(
    timeValue
) {

    if (!timeValue) {

        return "No time";
    }

    const cleanTime =
        String(timeValue).substring(
            0,
            5
        );

    const parts =
        cleanTime.split(":");

    if (parts.length !== 2) {

        return cleanTime;
    }

    let hour =
        parseInt(
            parts[0],
            10
        );

    const minute =
        parts[1];

    if (Number.isNaN(hour)) {

        return cleanTime;
    }

    const period =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12;

    if (hour === 0) {

        hour = 12;
    }

    return `${hour}:${minute} ${period}`;
}


// ------------------------------------------------------------
// CHECK WHETHER REMINDER IS OVERDUE
// ------------------------------------------------------------

function isReminderOverdue(
    reminderDateValue,
    reminderTimeValue,
    status
) {

    const normalizedStatus =
        normalizeStatus(
            status
        );

    if (
        normalizedStatus ===
        "completed"
    ) {

        return false;
    }

    const dateValue =
        getDateValue(
            reminderDateValue
        );

    if (!dateValue) {

        return false;
    }

    let timeValue =
        "23:59";

    if (reminderTimeValue) {

        timeValue =
            String(
                reminderTimeValue
            ).substring(
                0,
                5
            );
    }

    const reminderDateTime =
        new Date(
            `${dateValue}T${timeValue}:00`
        );

    if (
        Number.isNaN(
            reminderDateTime.getTime()
        )
    ) {

        return false;
    }

    return (
        reminderDateTime.getTime() <
        Date.now()
    );
}


// ------------------------------------------------------------
// GET REMINDER DATE/TIME FOR SORTING
// ------------------------------------------------------------

function getReminderDateTime(
    reminder
) {

    const dateValue =
        getDateValue(
            reminder.reminder_date ||
            reminder.date
        );

    if (!dateValue) {

        return Number.MAX_SAFE_INTEGER;
    }

    let timeValue =
        reminder.reminder_time ||
        reminder.time ||
        "23:59";

    timeValue =
        String(timeValue).substring(
            0,
            5
        );

    const dateTime =
        new Date(
            `${dateValue}T${timeValue}:00`
        );

    const timestamp =
        dateTime.getTime();

    if (Number.isNaN(timestamp)) {

        return Number.MAX_SAFE_INTEGER;
    }

    return timestamp;
}


// ------------------------------------------------------------
// GET REMINDER BY ID
// ------------------------------------------------------------

function getReminderById(id) {

    const reminders =
        window.studyTrackReminders ||
        [];

    const reminder =
        reminders.find(
            item =>
                String(item.id) ===
                String(id)
        );

    return reminder || null;
}


// ------------------------------------------------------------
// DISPLAY FORM MESSAGE
// ------------------------------------------------------------

function showMessage(
    message,
    type = ""
) {

    if (!reminderMessage) {
        return;
    }

    reminderMessage.textContent =
        message;

    reminderMessage.className =
        "form-message";

    if (message) {

        reminderMessage.classList.add(
            "show"
        );
    }

    if (type) {

        reminderMessage.classList.add(
            type
        );
    }
}


// ------------------------------------------------------------
// CREATE REMINDER
// ------------------------------------------------------------

async function createReminder() {

    const title =
        reminderTitle?.value.trim() ||
        "";

    const description =
        reminderDescription?.value.trim() ||
        "";

    const date =
        reminderDate?.value ||
        "";

    const time =
        reminderTime?.value ||
        "";

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

        if (createReminderButton) {

            createReminderButton.disabled =
                true;
        }

        showMessage(
            "Creating reminder..."
        );

        const response =
            await fetch(
                "/api/reminders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        title,
                        description,
                        reminder_date:
                            date,
                        reminder_time:
                            time
                    })
                }
            );

        const data =
            await response.json();

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

        if (createReminderButton) {

            createReminderButton.disabled =
                false;
        }
    }
}


if (createReminderButton) {

    createReminderButton.addEventListener(
        "click",
        createReminder
    );
}


// ------------------------------------------------------------
// EDIT REMINDER
// ------------------------------------------------------------

async function editReminder(id) {

    const reminder =
        getReminderById(id);

    if (!reminder) {

        showMessage(
            "The selected reminder could not be found.",
            "error"
        );

        return;
    }

    const newTitle =
        window.prompt(
            "Edit reminder title:",
            reminder.title || ""
        );

    if (newTitle === null) {
        return;
    }

    const trimmedTitle =
        newTitle.trim();

    if (!trimmedTitle) {

        window.alert(
            "Reminder title cannot be empty."
        );

        return;
    }

    const newDescription =
        window.prompt(
            "Edit reminder description:",
            reminder.description || ""
        );

    if (newDescription === null) {
        return;
    }

    const currentDate =
        getDateValue(
            reminder.reminder_date ||
            reminder.date
        );

    const newDate =
        window.prompt(
            "Edit reminder date (YYYY-MM-DD):",
            currentDate
        );

    if (newDate === null) {
        return;
    }

    const currentTime =
        String(
            reminder.reminder_time ||
            reminder.time ||
            ""
        ).substring(
            0,
            5
        );

    const newTime =
        window.prompt(
            "Edit reminder time (HH:MM):",
            currentTime
        );

    if (newTime === null) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/reminders/${encodeURIComponent(id)}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        title:
                            trimmedTitle,

                        description:
                            newDescription.trim(),

                        reminder_date:
                            newDate.trim(),

                        reminder_time:
                            newTime.trim()
                    })
                }
            );

        const data =
            await response.json();

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


// ------------------------------------------------------------
// DELETE REMINDER
// ------------------------------------------------------------

async function deleteReminder(id) {

    const reminder =
        getReminderById(id);

    if (!reminder) {

        showMessage(
            "The selected reminder could not be found.",
            "error"
        );

        return;
    }

    const confirmed =
        window.confirm(
            `Delete the reminder "${reminder.title}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/reminders/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

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


// ------------------------------------------------------------
// UPDATE REMINDER STATUS
// ------------------------------------------------------------

async function updateReminderStatus(
    id,
    status
) {

    const normalizedStatus =
        normalizeStatus(status);

    try {

        const response =
            await fetch(
                `/api/reminders/${encodeURIComponent(id)}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        status:
                            normalizedStatus
                    })
                }
            );

        const data =
            await response.json();

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


// ------------------------------------------------------------
// REMINDER ICON
// ------------------------------------------------------------

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

            <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            ></path>

            <path
                d="M10 21h4"
            ></path>

        </svg>
    `;
}


// ------------------------------------------------------------
// CREATE REMINDER CARD
// ------------------------------------------------------------

function createReminderCard(
    reminder
) {

    const id =
        reminder.id;

    const title =
        escapeHtml(
            reminder.title ||
            "Untitled Reminder"
        );

    const description =
        escapeHtml(
            reminder.description ||
            "No description provided."
        );

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
        ).substring(
            0,
            5
        );

    const displayDate =
        formatDateForDisplay(
            dateValue
        );

    const displayTime =
        formatTimeForDisplay(
            timeValue
        );

    const normalizedStatus =
        normalizeStatus(
            reminder.status
        );

    const overdue =
        isReminderOverdue(
            dateValue,
            timeValue,
            normalizedStatus
        );

    let displayStatus =
        "Pending";

    if (
        normalizedStatus ===
        "completed"
    ) {

        displayStatus =
            "Completed";

    } else if (overdue) {

        displayStatus =
            "Overdue";
    }

    const statusClass =
        normalizedStatus ===
            "completed"
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
                            ${normalizedStatus ===
            "pending"
            ? "selected"
            : ""
        }
                        >
                            Pending
                        </option>

                        <option
                            value="completed"
                            ${normalizedStatus ===
            "completed"
            ? "selected"
            : ""
        }
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


// ------------------------------------------------------------
// CREATE REMINDER GROUP
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// LOAD AND ORGANIZE REMINDERS
// ------------------------------------------------------------

async function loadReminders() {

    if (!remindersContainer) {
        return;
    }

    remindersContainer.innerHTML = `
        <div class="empty-state">

            <p>
                Loading reminders...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(
                "/api/reminders",
                {
                    credentials: "include"
                }
            );

        if (response.status === 401) {

            window.location.href =
                "/login.html";

            return;
        }

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load reminders."
            );
        }

        const reminders =
            Array.isArray(data)
                ? data
                : Array.isArray(data.reminders)
                    ? data.reminders
                    : [];

        window.studyTrackReminders =
            reminders;

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

        const overdueReminders = [];
        const upcomingReminders = [];
        const completedReminders = [];

        reminders.forEach(
            reminder => {

                const status =
                    normalizeStatus(
                        reminder.status
                    );

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
                    ).substring(
                        0,
                        5
                    );

                if (
                    status ===
                    "completed"
                ) {

                    completedReminders.push(
                        reminder
                    );

                } else if (
                    isReminderOverdue(
                        dateValue,
                        timeValue,
                        status
                    )
                ) {

                    overdueReminders.push(
                        reminder
                    );

                } else {

                    upcomingReminders.push(
                        reminder
                    );
                }
            }
        );

        overdueReminders.sort(
            (a, b) =>
                getReminderDateTime(a) -
                getReminderDateTime(b)
        );

        upcomingReminders.sort(
            (a, b) =>
                getReminderDateTime(a) -
                getReminderDateTime(b)
        );

        completedReminders.sort(
            (a, b) =>
                getReminderDateTime(b) -
                getReminderDateTime(a)
        );

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

        remindersContainer.innerHTML =
            html;

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


// ------------------------------------------------------------
// REMINDER EVENT DELEGATION
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/logout",
                    {
                        method: "POST",
                        credentials: "include"
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


// ------------------------------------------------------------
// STARTUP
// ------------------------------------------------------------

loadSavedTheme();

loadUser();

loadReminders();