// ========================================
// STUDYTRACK FOCUS PAGE
// ========================================


// ========================================
// TIMER VARIABLES
// ========================================

let timerSeconds = 25 * 60;

let timerInterval = null;

let focusSessionId = null;

let timerRunning = false;

let timerEndTime = null;


// ========================================
// GET HTML ELEMENTS
// ========================================

const timerDisplay =
    document.getElementById("timer");

const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const completeButton =
    document.getElementById("completeButton");

const resetButton =
    document.getElementById("resetButton");

const focusMessage =
    document.getElementById("focusMessage");

const focusHistory =
    document.getElementById("focusHistory");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// MOBILE / DESKTOP SIDEBAR ELEMENTS
// ========================================

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const studyTrackSidebar =
    document.getElementById("studyTrackSidebar");

const mobileMenuOverlay =
    document.getElementById("mobileMenuOverlay");


// ========================================
// SIDEBAR TOOLTIPS
// ========================================

function setupSidebarTooltips() {

    const sidebarLinks =
        document.querySelectorAll(
            ".sidebar-nav-link"
        );


    sidebarLinks.forEach(
        (link) => {

            const label =
                link.querySelector(
                    ":scope > span:not(.nav-icon)"
                );


            if (label) {

                const tooltipText =
                    label.textContent.trim();


                link.setAttribute(
                    "data-tooltip",
                    tooltipText
                );


                link.setAttribute(
                    "title",
                    tooltipText
                );
            }
        }
    );


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


// ========================================
// DESKTOP SIDEBAR COLLAPSE
// ========================================

function setDesktopSidebarCollapsed(
    collapsed
) {

    if (window.innerWidth <= 720) {

        return;
    }


    document.body.classList.toggle(
        "desktop-sidebar-collapsed",
        collapsed
    );


    localStorage.setItem(
        "studytrack-sidebar-collapsed",
        String(collapsed)
    );


    if (mobileMenuButton) {

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
}


// ========================================
// MOBILE SIDEBAR
// ========================================

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


// ========================================
// SIDEBAR TOGGLE
// ========================================

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            if (window.innerWidth <= 720) {

                const isOpen =
                    mobileMenuButton.classList.contains(
                        "menu-open"
                    );


                setMobileMenu(!isOpen);

                return;
            }


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


// ========================================
// MOBILE OVERLAY
// ========================================

if (mobileMenuOverlay) {

    mobileMenuOverlay.addEventListener(
        "click",
        () => {

            setMobileMenu(false);
        }
    );
}


// ========================================
// CLOSE MOBILE MENU AFTER NAVIGATION
// ========================================

document
    .querySelectorAll(".sidebar-nav-link")
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    setMobileMenu(false);
                }
            );
        }
    );


// ========================================
// ESCAPE KEY
// ========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            setMobileMenu(false);
        }
    }
);


// ========================================
// RESTORE SIDEBAR STATE ON RESIZE
// ========================================

window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth <= 720) {

            document.body.classList.remove(
                "desktop-sidebar-collapsed"
            );


            setMobileMenu(false);

            return;
        }


        setMobileMenu(false);


        const savedState =
            localStorage.getItem(
                "studytrack-sidebar-collapsed"
            );


        if (savedState === "true") {

            document.body.classList.add(
                "desktop-sidebar-collapsed"
            );

        } else {

            document.body.classList.remove(
                "desktop-sidebar-collapsed"
            );
        }
    }
);


// ========================================
// RESTORE DESKTOP SIDEBAR STATE
// ========================================

function restoreSidebarState() {

    if (window.innerWidth <= 720) {

        document.body.classList.remove(
            "desktop-sidebar-collapsed"
        );

        return;
    }


    const savedState =
        localStorage.getItem(
            "studytrack-sidebar-collapsed"
        );


    if (savedState === "true") {

        document.body.classList.add(
            "desktop-sidebar-collapsed"
        );

    } else {

        document.body.classList.remove(
            "desktop-sidebar-collapsed"
        );
    }
}


// ========================================
// DAY / NIGHT MODE ELEMENTS
// ========================================

const dayModeButton =
    document.getElementById("dayModeButton");

const nightModeButton =
    document.getElementById("nightModeButton");


// ========================================
// APPLY SAVED THEME
// ========================================

function applySavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "studytrack-theme"
        );


    if (savedTheme === "night") {

        document.body.classList.add(
            "night-mode"
        );

    } else {

        document.body.classList.remove(
            "night-mode"
        );
    }


    updateThemeButtons();
}


// ========================================
// UPDATE THEME BUTTONS
// ========================================

function updateThemeButtons() {

    const nightModeActive =
        document.body.classList.contains(
            "night-mode"
        );


    if (dayModeButton) {

        dayModeButton.classList.toggle(
            "active",
            !nightModeActive
        );


        dayModeButton.setAttribute(
            "aria-pressed",
            String(!nightModeActive)
        );
    }


    if (nightModeButton) {

        nightModeButton.classList.toggle(
            "active",
            nightModeActive
        );


        nightModeButton.setAttribute(
            "aria-pressed",
            String(nightModeActive)
        );
    }
}


// ========================================
// SWITCH TO DAY MODE
// ========================================

function enableDayMode() {

    document.body.classList.remove(
        "night-mode"
    );


    localStorage.setItem(
        "studytrack-theme",
        "day"
    );


    updateThemeButtons();
}


// ========================================
// SWITCH TO NIGHT MODE
// ========================================

function enableNightMode() {

    document.body.classList.add(
        "night-mode"
    );


    localStorage.setItem(
        "studytrack-theme",
        "night"
    );


    updateThemeButtons();
}


// ========================================
// FORMAT TIMER
// ========================================

function updateTimerDisplay() {

    if (!timerDisplay) {

        return;
    }


    const minutes =
        Math.floor(
            timerSeconds / 60
        );


    const seconds =
        timerSeconds % 60;


    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// ========================================
// START FOCUS SESSION
// ========================================

async function startFocusSession() {

    try {

        const response =
            await fetch(
                "/api/focus/start",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        session_type: "Focus",

                        duration_minutes: 25

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            focusMessage.textContent =
                data.message ||
                "Could not start the focus session.";

            return;
        }


        focusSessionId =
            data.session_id;


        timerSeconds =
            25 * 60;


        timerEndTime =
            Date.now() +
            (timerSeconds * 1000);


        timerRunning =
            true;


        startButton.disabled =
            true;


        pauseButton.disabled =
            false;


        pauseButton.textContent =
            "Pause";


        completeButton.disabled =
            false;


        resetButton.disabled =
            true;


        focusMessage.textContent =
            "Focus session started.";


        updateTimerDisplay();

        startTimerInterval();

    } catch (error) {

        console.error(
            "Start Focus error:",
            error
        );


        focusMessage.textContent =
            "Could not connect to the server.";
    }
}


// ========================================
// START TIMER
// ========================================

function startTimerInterval() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        setInterval(
            runTimer,
            250
        );
}


// ========================================
// RUN TIMER
// ========================================

function runTimer() {

    if (
        !timerRunning ||
        !timerEndTime
    ) {

        return;
    }


    const remainingMilliseconds =
        timerEndTime -
        Date.now();


    timerSeconds =
        Math.max(
            0,
            Math.ceil(
                remainingMilliseconds /
                1000
            )
        );


    updateTimerDisplay();


    if (timerSeconds <= 0) {

        clearInterval(
            timerInterval
        );


        timerInterval =
            null;


        timerRunning =
            false;


        timerEndTime =
            null;


        completeFocusSession();
    }
}


// ========================================
// PAUSE TIMER
// ========================================

function pauseTimer() {

    if (
        !focusSessionId ||
        !timerRunning
    ) {

        return;
    }


    if (timerEndTime) {

        const remainingMilliseconds =
            timerEndTime -
            Date.now();


        timerSeconds =
            Math.max(
                0,
                Math.ceil(
                    remainingMilliseconds /
                    1000
                )
            );
    }


    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    timerRunning =
        false;


    timerEndTime =
        null;


    updateTimerDisplay();


    pauseButton.textContent =
        "Resume";


    focusMessage.textContent =
        "Focus session paused.";
}


// ========================================
// RESUME TIMER
// ========================================

function resumeTimer() {

    if (
        !focusSessionId ||
        timerRunning
    ) {

        return;
    }


    if (timerSeconds <= 0) {

        return;
    }


    timerEndTime =
        Date.now() +
        (timerSeconds * 1000);


    timerRunning =
        true;


    pauseButton.textContent =
        "Pause";


    focusMessage.textContent =
        "Focus session resumed.";


    startTimerInterval();
}


// ========================================
// COMPLETE FOCUS SESSION
// ========================================

async function completeFocusSession() {

    if (!focusSessionId) {

        return;
    }


    const sessionId =
        focusSessionId;


    try {

        const response =
            await fetch(
                `/api/focus/${sessionId}/complete`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            focusMessage.textContent =
                data.message ||
                "Could not complete the session.";

            return;
        }


        clearInterval(
            timerInterval
        );


        timerInterval =
            null;


        timerRunning =
            false;


        timerEndTime =
            null;


        focusSessionId =
            null;


        timerSeconds =
            25 * 60;


        updateTimerDisplay();


        startButton.disabled =
            false;


        pauseButton.disabled =
            true;


        pauseButton.textContent =
            "Pause";


        completeButton.disabled =
            true;


        resetButton.disabled =
            false;


        focusMessage.textContent =
            "Focus session completed successfully.";


        loadFocusHistory();

    } catch (error) {

        console.error(
            "Complete Focus error:",
            error
        );


        focusMessage.textContent =
            "Could not connect to the server.";
    }
}


// ========================================
// RESET TIMER
// ========================================

function resetTimer() {

    if (focusSessionId) {

        focusMessage.textContent =
            "Complete or cancel the current session before resetting.";

        return;
    }


    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    timerRunning =
        false;


    timerEndTime =
        null;


    timerSeconds =
        25 * 60;


    updateTimerDisplay();


    startButton.disabled =
        false;


    pauseButton.disabled =
        true;


    pauseButton.textContent =
        "Pause";


    completeButton.disabled =
        true;


    resetButton.disabled =
        false;


    focusMessage.textContent =
        "Timer reset.";
}


// ========================================
// LOAD USER
// ========================================

async function loadUser() {

    try {

        const response =
            await fetch(
                "/api/me",
                {
                    credentials:
                        "include"
                }
            );


        if (!response.ok) {

            window.location.href =
                "/login.html";

            return;
        }


        const data =
            await response.json();


        // The /api/me endpoint returns the
        // logged-in user object directly.
        if (data) {

            if (userName) {

                userName.textContent =
                    data.full_name ||
                    "User";
            }


            if (userEmail) {

                userEmail.textContent =
                    data.email ||
                    "";
            }
        }

    } catch (error) {

        console.error(
            "Load user error:",
            error
        );
    }
}


// ========================================
// DELETE FOCUS SESSION
// ========================================

async function deleteFocusSession(
    sessionId
) {

    if (!sessionId) {

        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this focus session?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/focus/${sessionId}`,
                {
                    method: "DELETE",

                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            focusMessage.textContent =
                data.message ||
                "Could not delete the focus session.";

            return;
        }


        focusMessage.textContent =
            "Focus session deleted successfully.";


        loadFocusHistory();

    } catch (error) {

        console.error(
            "Delete Focus session error:",
            error
        );


        focusMessage.textContent =
            "Could not connect to the server.";
    }
}


// ========================================
// LOAD FOCUS HISTORY
// ========================================

async function loadFocusHistory() {

    if (!focusHistory) {

        return;
    }


    try {

        focusHistory.innerHTML =
            "<p>Loading focus sessions...</p>";


        const response =
            await fetch(
                "/api/focus",
                {
                    method: "GET",

                    credentials: "include",

                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            focusHistory.innerHTML =
                `<p>${data.message ||
                "Could not load focus sessions."
                }</p>`;

            return;
        }


        const sessions =
            Array.isArray(
                data.focus_sessions
            )
                ? data.focus_sessions
                : [];


        if (sessions.length === 0) {

            focusHistory.innerHTML =
                "<p>No focus sessions yet.</p>";

            return;
        }


        focusHistory.innerHTML =
            "";


        sessions.forEach(
            (session) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "focus-history-item";


                const startTime =
                    session.start_time
                        ? String(
                            session.start_time
                        )
                        : "Not available";


                const endTime =
                    session.end_time
                        ? String(
                            session.end_time
                        )
                        : "";


                const rawDuration =
                    session.duration_minutes;


                const duration =
                    rawDuration === null ||
                        rawDuration === undefined ||
                        rawDuration === ""
                        ? null
                        : Number(
                            rawDuration
                        );


                let durationDisplay =
                    "Not available";


                if (
                    Number.isFinite(
                        duration
                    )
                ) {

                    if (duration === 0) {

                        durationDisplay =
                            "Less than 1 minute";

                    } else {

                        durationDisplay =
                            `${duration} minute${duration === 1
                                ? ""
                                : "s"
                            }`;
                    }
                }


                const status =
                    session.status ||
                    "Completed";


                item.innerHTML = `

                    <strong>
                        ${session.session_type || "Focus"}
                    </strong>

                    <p>
                        Duration:
                        ${durationDisplay}
                    </p>

                    <p>
                        Status:
                        ${status}
                    </p>

                    <p>
                        Started:
                        ${startTime}
                    </p>

                    ${endTime
                        ? `
                                <p>
                                    Completed:
                                    ${endTime}
                                </p>
                              `
                        : ""
                    }

                `;


                // ========================================
                // DELETE BUTTON
                // ========================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.type =
                    "button";


                deleteButton.className =
                    "delete-focus-button";


                deleteButton.textContent =
                    "Delete";


                deleteButton.setAttribute(
                    "aria-label",
                    "Delete focus session"
                );


                deleteButton.addEventListener(
                    "click",
                    () => {

                        deleteFocusSession(
                            session.id
                        );
                    }
                );


                item.appendChild(
                    deleteButton
                );


                focusHistory.appendChild(
                    item
                );

            }
        );

    } catch (error) {

        console.error(
            "Load focus history error:",
            error
        );


        focusHistory.innerHTML =
            "<p>Could not connect to the server.</p>";
    }
}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    try {

        await fetch(
            "/api/logout",
            {
                method: "POST",

                credentials:
                    "include"
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


// ========================================
// BUTTON EVENTS
// ========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        startFocusSession
    );
}


if (pauseButton) {

    pauseButton.addEventListener(
        "click",
        () => {

            if (timerRunning) {

                pauseTimer();

            } else {

                resumeTimer();
            }

        }
    );
}


if (completeButton) {

    completeButton.addEventListener(
        "click",
        completeFocusSession
    );
}


if (resetButton) {

    resetButton.addEventListener(
        "click",
        resetTimer
    );
}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}


// ========================================
// DAY / NIGHT BUTTON EVENTS
// ========================================

if (dayModeButton) {

    dayModeButton.addEventListener(
        "click",
        enableDayMode
    );
}


if (nightModeButton) {

    nightModeButton.addEventListener(
        "click",
        enableNightMode
    );
}


// ========================================
// INITIAL PAGE LOAD
// ========================================

setupSidebarTooltips();

restoreSidebarState();

applySavedTheme();

updateTimerDisplay();

loadUser();

loadFocusHistory();