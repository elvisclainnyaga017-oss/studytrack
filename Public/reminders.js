// ============================================================
// STUDYTRACK - REMINDERS PAGE
// File: Public/reminders.js
// ============================================================


// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const reminderForm =
    document.getElementById("reminderForm");

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
// NAVIGATION ELEMENTS
// ------------------------------------------------------------

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const studyTrackSidebar =
    document.getElementById("studyTrackSidebar");

const mobileMenuOverlay =
    document.getElementById("mobileMenuOverlay");


// ------------------------------------------------------------
// SIDEBAR COLLAPSED TOOLTIP LABELS
// ------------------------------------------------------------

function setupSidebarTooltips() {

    const sidebarItems =
        document.querySelectorAll(
            ".sidebar-nav-link"
        );

    sidebarItems.forEach(
        function (item) {

            const labelElement =
                item.querySelector(
                    ":scope > span:not(.nav-icon)"
                );

            if (!labelElement) {
                return;
            }

            const label =
                labelElement.textContent.trim();

            if (!label) {
                return;
            }

            /*
             * The CSS uses:
             *
             * content: attr(data-tooltip);
             *
             * Therefore every sidebar item needs
             * a data-tooltip attribute.
             */

            item.setAttribute(
                "data-tooltip",
                label
            );

            /*
             * The title attribute also provides a
             * native browser tooltip as a fallback.
             */

            item.setAttribute(
                "title",
                label
            );
        }
    );


    /*
     * Logout does not use the same navigation
     * structure, so give it its tooltip separately.
     */

    if (logoutButton) {

        logoutButton.setAttribute(
            "data-tooltip",
            "Logout"
        );

        logoutButton.setAttribute(
            "title",
            "Logout"
        );
    }
}


// Run tooltip setup after the page has loaded.
setupSidebarTooltips();


// ------------------------------------------------------------
// DESKTOP SIDEBAR COLLAPSE
// ------------------------------------------------------------

function setDesktopSidebarCollapsed(
    collapsed
) {

    if (!studyTrackSidebar) {
        return;
    }

    if (window.innerWidth <= 720) {
        return;
    }

    document.body.classList.toggle(
        "desktop-sidebar-collapsed",
        collapsed
    );

    if (mobileMenuButton) {

        mobileMenuButton.classList.toggle(
            "menu-open",
            !collapsed
        );

        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(!collapsed)
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            collapsed
                ? "Expand navigation menu"
                : "Collapse navigation menu"
        );

        mobileMenuButton.setAttribute(
            "title",
            collapsed
                ? "Expand navigation menu"
                : "Collapse navigation menu"
        );
    }

    localStorage.setItem(
        "studytrack-sidebar-collapsed",
        String(collapsed)
    );
}


// ------------------------------------------------------------
// MOBILE SIDEBAR MENU
// ------------------------------------------------------------

function setMobileMenu(open) {

    if (
        !mobileMenuButton ||
        !studyTrackSidebar
    ) {
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

    mobileMenuButton.setAttribute(
        "title",
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


// ------------------------------------------------------------
// SIDEBAR / HAMBURGER BUTTON
// ------------------------------------------------------------

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        function () {

            /*
             * MOBILE:
             * The button opens/closes the mobile drawer.
             */

            if (window.innerWidth <= 720) {

                const isOpen =
                    mobileMenuButton.classList.contains(
                        "menu-open"
                    );

                setMobileMenu(
                    !isOpen
                );

                return;
            }


            /*
             * DESKTOP:
             * The same button collapses/expands
             * the sidebar.
             */

            const isCollapsed =
                document.body.classList.contains(
                    "desktop-sidebar-collapsed"
                );

            setDesktopSidebarCollapsed(
                !isCollapsed
            );
        }
    );
}


// ------------------------------------------------------------
// MOBILE SIDEBAR OVERLAY
// ------------------------------------------------------------

if (mobileMenuOverlay) {

    mobileMenuOverlay.addEventListener(
        "click",
        function () {

            setMobileMenu(false);

        }
    );
}


// ------------------------------------------------------------
// CLOSE MOBILE MENU WHEN NAVIGATING
// ------------------------------------------------------------

if (studyTrackSidebar) {

    const sidebarLinks =
        studyTrackSidebar.querySelectorAll(
            ".sidebar-nav-link"
        );

    sidebarLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <= 720
                    ) {

                        setMobileMenu(false);
                    }
                }
            );
        }
    );
}


// ------------------------------------------------------------
// ESCAPE KEY
// ------------------------------------------------------------

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (
                window.innerWidth <= 720
            ) {

                setMobileMenu(false);
            }
        }
    }
);


// ------------------------------------------------------------
// WINDOW RESIZE
// ------------------------------------------------------------

window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth <= 720) {

            document.body.classList.remove(
                "desktop-sidebar-collapsed"
            );

            setMobileMenu(false);

            return;
        }

        /*
         * When returning to desktop,
         * restore the saved desktop sidebar state.
         */

        setMobileMenu(false);

        const savedCollapsedState =
            localStorage.getItem(
                "studytrack-sidebar-collapsed"
            );

        setDesktopSidebarCollapsed(
            savedCollapsedState === "true"
        );
    }
);


// ------------------------------------------------------------
// INITIAL SIDEBAR STATE
// ------------------------------------------------------------

function initializeSidebar() {

    if (
        !mobileMenuButton ||
        !studyTrackSidebar
    ) {
        return;
    }

    if (window.innerWidth <= 720) {

        document.body.classList.remove(
            "desktop-sidebar-collapsed"
        );

        setMobileMenu(false);

        return;
    }

    setMobileMenu(false);

    const savedCollapsedState =
        localStorage.getItem(
            "studytrack-sidebar-collapsed"
        );

    setDesktopSidebarCollapsed(
        savedCollapsedState === "true"
    );
}

initializeSidebar();


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

        /*
         * IMPORTANT:
         *
         * /api/me currently returns the user object
         * directly from server.js.
         *
         * Example:
         *
         * {
         *     id: 1,
         *     full_name: "Test User",
         *     email: "example@email.com"
         * }
         *
         * It does NOT currently return:
         *
         * {
         *     user: {
         *         ...
         *     }
         * }
         *
         * Therefore we use data directly.
         */

        if (!data || !data.id) {

            console.error(
                "No authenticated user returned from /api/me."
            );

            window.location.href =
                "/login.html";

            return null;
        }

        const currentUser =
            data;

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

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
// DATE PARTS FOR THE DATE BLOCK ON EACH CARD
// ------------------------------------------------------------

const MONTH_NAMES_SHORT = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const WEEKDAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
];


function getDateParts(dateValue) {

    const cleanDate =
        getDateValue(dateValue);

    if (!cleanDate) {

        return null;
    }

    const parts =
        cleanDate.split("-");

    if (parts.length !== 3) {

        return null;
    }

    const year =
        parseInt(parts[0], 10);

    const month =
        parseInt(parts[1], 10);

    const day =
        parseInt(parts[2], 10);

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day) ||
        month < 1 ||
        month > 12
    ) {

        return null;
    }

    const weekdayIndex =
        new Date(
            year,
            month - 1,
            day
        ).getDay();

    return {
        year: String(year),
        month: MONTH_NAMES_SHORT[month - 1],
        day: String(day),
        weekday: WEEKDAY_NAMES[weekdayIndex]
    };
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


/*
 * The Create button is a "submit" button inside a <form>.
 * We listen for the form's submit event and call
 * preventDefault() so the browser does not reload the page.
 * This also lets the Enter key submit the form.
 */

if (reminderForm) {

    reminderForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            createReminder();
        }
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
// ICONS
// ------------------------------------------------------------

const ICON_PATHS = {

    bell: [
        '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>',
        '<path d="M10 21h4"></path>'
    ],

    clock: [
        '<circle cx="12" cy="12" r="9"></circle>',
        '<path d="M12 7v5l3 2"></path>'
    ],

    calendar: [
        '<rect x="3" y="5" width="18" height="16" rx="2"></rect>',
        '<path d="M16 3v4"></path>',
        '<path d="M8 3v4"></path>',
        '<path d="M3 10h18"></path>'
    ],

    edit: [
        '<path d="M12 20h9"></path>',
        '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>'
    ],

    trash: [
        '<path d="M3 6h18"></path>',
        '<path d="M8 6V4h8v2"></path>',
        '<path d="M19 6l-1 14H6L5 6"></path>',
        '<path d="M10 11v6"></path>',
        '<path d="M14 11v6"></path>'
    ],

    check: [
        '<circle cx="12" cy="12" r="9"></circle>',
        '<path d="M8 12.5l3 3 5-6"></path>'
    ]
};


function getIcon(name) {

    const paths =
        ICON_PATHS[name] ||
        [];

    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.join("")}</svg>`;
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

    const hasDescription =
        Boolean(
            reminder.description &&
            String(reminder.description).trim()
        );

    const description =
        escapeHtml(
            hasDescription
                ? reminder.description
                : "No description provided."
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

    const dateParts =
        getDateParts(
            dateValue
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

    let cardState =
        "upcoming";

    let displayStatus =
        "Pending";

    let badgeClass =
        "pending";

    if (
        normalizedStatus ===
        "completed"
    ) {

        cardState =
            "completed";

        displayStatus =
            "Completed";

        badgeClass =
            "completed";

    } else if (overdue) {

        cardState =
            "overdue";

        displayStatus =
            "Overdue";

        badgeClass =
            "overdue";
    }

    const dateBlock =
        dateParts
            ? `
                <span class="reminder-date-month">${escapeHtml(dateParts.month)}</span>
                <span class="reminder-date-day">${escapeHtml(dateParts.day)}</span>
                <span class="reminder-date-year">${escapeHtml(dateParts.year)}</span>
            `
            : `
                <span class="reminder-date-none">No date</span>
            `;

    const weekdayItem =
        dateParts
            ? `
                <span class="reminder-meta-item">
                    ${getIcon("calendar")}
                    <span>${escapeHtml(dateParts.weekday)}</span>
                </span>
            `
            : "";

    return `
        <article
            class="reminder-card reminder-card--${cardState}"
            data-reminder-id="${escapeHtml(id)}"
        >

            <div
                class="reminder-date-block"
                title="${escapeHtml(displayDate)}"
            >
                ${dateBlock}
            </div>

            <div class="reminder-body">

                <div class="reminder-card-top">

                    <h4 class="reminder-card-title">
                        ${title}
                    </h4>

                    <span class="status-badge ${badgeClass}">
                        ${escapeHtml(displayStatus)}
                    </span>

                </div>

                <p class="reminder-card-description${hasDescription ? "" : " is-empty"}">
                    ${description}
                </p>

                <div class="reminder-card-meta">

                    <span class="reminder-meta-item">
                        ${getIcon("clock")}
                        <span>${escapeHtml(displayTime)}</span>
                    </span>

                    ${weekdayItem}

                </div>

                <div class="reminder-card-footer">

                    <div class="reminder-status-control">

                        <label for="reminderStatus-${escapeHtml(id)}">
                            Status
                        </label>

                        <select
                            id="reminderStatus-${escapeHtml(id)}"
                            class="reminder-status-select"
                            data-action="status"
                            data-id="${escapeHtml(id)}"
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

                    <div class="reminder-card-actions">

                        <button
                            type="button"
                            class="reminder-action-button edit"
                            data-action="edit"
                            data-id="${escapeHtml(id)}"
                        >
                            ${getIcon("edit")}
                            <span>Edit</span>
                        </button>

                        <button
                            type="button"
                            class="reminder-action-button danger"
                            data-action="delete"
                            data-id="${escapeHtml(id)}"
                        >
                            ${getIcon("trash")}
                            <span>Delete</span>
                        </button>

                    </div>

                </div>

            </div>

        </article>
    `;
}


// ------------------------------------------------------------
// CREATE REMINDER GROUP
// (always shown, with its own empty state when it has no items)
// ------------------------------------------------------------

function createReminderGroup(
    groupKey,
    eyebrow,
    title,
    description,
    reminders,
    emptyIcon,
    emptyTitle,
    emptyText
) {

    const count =
        reminders.length;

    const content =
        count > 0
            ? `
                <div class="reminder-list">
                    ${reminders.map(createReminderCard).join("")}
                </div>
            `
            : `
                <div class="reminder-empty">

                    <span class="reminder-empty-icon">
                        ${getIcon(emptyIcon)}
                    </span>

                    <div>

                        <p class="reminder-empty-title">
                            ${escapeHtml(emptyTitle)}
                        </p>

                        <p class="reminder-empty-text">
                            ${escapeHtml(emptyText)}
                        </p>

                    </div>

                </div>
            `;

    return `
        <section
            class="reminder-group reminder-group--${groupKey}"
            aria-labelledby="reminderGroup-${groupKey}"
        >

            <header class="reminder-group-header">

                <div class="reminder-group-heading">

                    <p class="section-eyebrow">
                        ${escapeHtml(eyebrow)}
                    </p>

                    <h3
                        id="reminderGroup-${groupKey}"
                        class="reminder-group-title"
                    >
                        ${escapeHtml(title)}
                    </h3>

                    <p class="reminder-group-description">
                        ${escapeHtml(description)}
                    </p>

                </div>

                <span
                    class="reminder-count"
                    aria-label="${count} reminders"
                >
                    ${count}
                </span>

            </header>

            ${content}

        </section>
    `;
}


// ------------------------------------------------------------
// PAGE-LEVEL EMPTY / LOADING / ERROR STATES
// ------------------------------------------------------------

function createPageState(
    iconName,
    title,
    text
) {

    return `
        <div class="empty-state">

            <div class="empty-state-icon">
                ${getIcon(iconName)}
            </div>

            <h3 class="empty-state-title">
                ${escapeHtml(title)}
            </h3>

            <p class="empty-state-text">
                ${escapeHtml(text)}
            </p>

        </div>
    `;
}


// ------------------------------------------------------------
// LOAD AND ORGANIZE REMINDERS
// ------------------------------------------------------------

async function loadReminders() {

    if (!remindersContainer) {
        return;
    }

    remindersContainer.innerHTML =
        createPageState(
            "bell",
            "Loading reminders...",
            "Please wait while your reminders are being loaded."
        );

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

            remindersContainer.innerHTML =
                createPageState(
                    "bell",
                    "No reminders yet",
                    "Use the form above to create your first reminder."
                );

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
            "overdue",
            "NEEDS ATTENTION",
            "Overdue",
            "These reminders have passed their scheduled date or time.",
            overdueReminders,
            "check",
            "Nothing is overdue",
            "You are all caught up. Great work!"
        );

        html += createReminderGroup(
            "upcoming",
            "COMING UP",
            "Upcoming",
            "Your next scheduled reminders, starting with the earliest.",
            upcomingReminders,
            "calendar",
            "No upcoming reminders",
            "Create a reminder above to plan something ahead."
        );

        html += createReminderGroup(
            "completed",
            "FINISHED",
            "Completed",
            "Reminders that you have already completed.",
            completedReminders,
            "check",
            "Nothing completed yet",
            "Reminders you mark as completed will appear here."
        );

        remindersContainer.innerHTML =
            html;

    } catch (error) {

        console.error(
            "Load reminders error:",
            error
        );

        remindersContainer.innerHTML =
            createPageState(
                "bell",
                "Could not load reminders",
                error.message ||
                "Failed to load reminders."
            );
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

async function initializeRemindersPage() {

    loadSavedTheme();

    /*
     * First confirm that the user is authenticated.
     * Only after authentication succeeds do we
     * request the user's reminders.
     */

    const currentUser =
        await loadUser();

    if (!currentUser) {
        return;
    }

    await loadReminders();
}


initializeRemindersPage();