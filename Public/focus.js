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
        localStorage.getItem("studytrack-theme");


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

    const minutes =
        Math.floor(timerSeconds / 60);

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

    clearInterval(timerInterval);


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

        clearInterval(timerInterval);

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


    clearInterval(timerInterval);

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


        clearInterval(timerInterval);

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


    clearInterval(timerInterval);

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


        if (data.user) {

            userName.textContent =
                data.user.full_name ||
                "User";


            userEmail.textContent =
                data.user.email ||
                "";
        }

    } catch (error) {

        console.error(
            "Load user error:",
            error
        );
    }
}


// ========================================
// LOAD FOCUS HISTORY
// ========================================

async function loadFocusHistory() {

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


                const duration =
                    session.duration_minutes ||
                    25;


                const status =
                    session.status ||
                    "Completed";


                item.innerHTML = `

                    <strong>
                        ${session.session_type || "Focus"}
                    </strong>

                    <p>
                        Duration:
                        ${duration}
                        minutes
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

startButton.addEventListener(
    "click",
    startFocusSession
);


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


completeButton.addEventListener(
    "click",
    completeFocusSession
);


resetButton.addEventListener(
    "click",
    resetTimer
);


logoutButton.addEventListener(
    "click",
    logout
);


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

applySavedTheme();

updateTimerDisplay();

loadUser();

loadFocusHistory();