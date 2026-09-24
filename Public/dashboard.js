let goals = [];


// ========================================
// GET PAGE ELEMENTS
// ========================================

const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const goalForm = document.getElementById('goalForm');
const goalMessage = document.getElementById('goalMessage');
const goalsContainer = document.getElementById('goalsContainer');
const logoutButton = document.getElementById('logoutButton');


// ========================================
// DAY / NIGHT THEME
// ========================================

const dayModeButton =
    document.getElementById('dayModeButton');

const nightModeButton =
    document.getElementById('nightModeButton');


function applyTheme(theme) {

    if (theme === 'night') {

        document.body.classList.add('night-mode');

        if (dayModeButton) {
            dayModeButton.classList.remove('active');
        }

        if (nightModeButton) {
            nightModeButton.classList.add('active');
        }

    } else {

        document.body.classList.remove('night-mode');

        if (nightModeButton) {
            nightModeButton.classList.remove('active');
        }

        if (dayModeButton) {
            dayModeButton.classList.add('active');
        }

    }

    localStorage.setItem(
        'studytrack-theme',
        theme
    );
}


// ========================================
// DAY MODE BUTTON
// ========================================

if (dayModeButton) {

    dayModeButton.addEventListener(
        'click',
        function () {

            applyTheme('day');

        }
    );

}


// ========================================
// NIGHT MODE BUTTON
// ========================================

if (nightModeButton) {

    nightModeButton.addEventListener(
        'click',
        function () {

            applyTheme('night');

        }
    );

}


// ========================================
// LOAD SAVED THEME
// ========================================

const savedTheme =
    localStorage.getItem('studytrack-theme');


if (savedTheme === 'night') {

    applyTheme('night');

} else {

    applyTheme('day');

}


// ========================================
// LOAD CURRENT USER
// ========================================

async function loadUser() {

    try {

        const response = await fetch('/api/me', {
            credentials: 'include'
        });


        if (!response.ok) {

            window.location.href = '/login.html';

            return;

        }


        const data = await response.json();


        userName.textContent =
            data.user.full_name;

        userEmail.textContent =
            data.user.email;


    } catch (error) {

        console.error(
            'Load user error:',
            error
        );


        window.location.href =
            '/login.html';

    }

}


// ========================================
// CREATE GOAL
// ========================================

goalForm.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const title =
            document
                .getElementById('goalTitle')
                .value
                .trim();


        const description =
            document
                .getElementById('goalDescription')
                .value
                .trim();


        const deadline =
            document
                .getElementById('goalDeadline')
                .value;


        const currentValue =
            document
                .getElementById('goalCurrent')
                .value;


        const targetValue =
            document
                .getElementById('goalTarget')
                .value;


        const unit =
            document
                .getElementById('goalUnit')
                .value
                .trim();


        if (!title) {

            goalMessage.textContent =
                'Goal title is required.';

            return;

        }


        try {

            const response =
                await fetch(
                    '/api/goals',
                    {

                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        credentials: 'include',

                        body: JSON.stringify({

                            title: title,

                            description: description,

                            deadline: deadline,

                            current_value:
                                Number(
                                    currentValue || 0
                                ),

                            target_value:
                                Number(
                                    targetValue || 100
                                ),

                            unit: unit

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                goalMessage.textContent =
                    data.message ||
                    'Could not create goal.';

                return;

            }


            goalMessage.textContent =
                'Goal created successfully.';


            goalForm.reset();


            document.getElementById(
                'goalCurrent'
            ).value = 0;


            document.getElementById(
                'goalTarget'
            ).value = 100;


            await loadGoals();

            await loadDashboardSummary();


        } catch (error) {

            console.error(
                'Create goal error:',
                error
            );


            goalMessage.textContent =
                'Could not connect to the server.';

        }

    }
);


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return 'No deadline';

    }


    return String(dateValue).substring(
        0,
        10
    );

}


// ========================================
// UPDATE GOAL PROGRESS
// ========================================

async function updateGoalProgress(
    goalId,
    currentValue
) {

    try {

        const response =
            await fetch(
                '/api/goals/' +
                goalId +
                '/progress',
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        current_value:
                            Number(currentValue)

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                'Could not update progress.'
            );

            return;

        }


        await loadGoals();

        await loadDashboardSummary();


    } catch (error) {

        console.error(
            'Update goal progress error:',
            error
        );


        alert(
            'Could not connect to the server.'
        );

    }

}


// ========================================
// EDIT GOAL
// ========================================

async function editGoal(goal) {

    const newTitle =
        prompt(
            'Enter the new goal title:',
            goal.title
        );


    if (newTitle === null) {

        return;

    }


    if (!newTitle.trim()) {

        alert(
            'Goal title cannot be empty.'
        );

        return;

    }


    const newDescription =
        prompt(
            'Enter the new description:',
            goal.description || ''
        );


    if (newDescription === null) {

        return;

    }


    const newDeadline =
        prompt(
            'Enter the deadline (YYYY-MM-DD):',
            formatDate(goal.deadline)
        );


    if (newDeadline === null) {

        return;

    }


    const newTarget =
        prompt(
            'Enter the target value:',
            goal.target_value
        );


    if (newTarget === null) {

        return;

    }


    const newUnit =
        prompt(
            'Enter the unit:',
            goal.unit || ''
        );


    if (newUnit === null) {

        return;

    }


    try {

        const response =
            await fetch(
                '/api/goals/' +
                goal.id,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        title:
                            newTitle.trim(),

                        description:
                            newDescription.trim(),

                        deadline:
                            newDeadline,

                        target_value:
                            Number(newTarget),

                        unit:
                            newUnit.trim()

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                'Could not update goal.'
            );

            return;

        }


        await loadGoals();

        await loadDashboardSummary();


    } catch (error) {

        console.error(
            'Edit goal error:',
            error
        );


        alert(
            'Could not connect to the server.'
        );

    }

}


// ========================================
// DELETE GOAL
// ========================================

async function deleteGoal(goalId) {

    const confirmed =
        confirm(
            'Are you sure you want to delete this goal?'
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                '/api/goals/' +
                goalId,
                {

                    method: 'DELETE',

                    credentials: 'include'

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                'Could not delete goal.'
            );

            return;

        }


        await loadGoals();

        await loadDashboardSummary();


    } catch (error) {

        console.error(
            'Delete goal error:',
            error
        );


        alert(
            'Could not connect to the server.'
        );

    }

}


// ========================================
// DISPLAY GOALS
// ========================================

function displayGoals() {

    // ========================================
    // NO GOALS
    // ========================================

    if (!goals || goals.length === 0) {

        goalsContainer.innerHTML =
            '<div class="empty-state">' +
            '<p>You have no goals yet.</p>' +
            '</div>';

        return;

    }


    // Clear previous content
    goalsContainer.innerHTML = '';


    // ========================================
    // DISPLAY EVERY GOAL
    // ========================================

    goals.forEach(
        function (goal) {

            // ========================================
            // MAIN GOAL CARD
            // ========================================

            const goalItem =
                document.createElement('div');


            goalItem.className =
                'goal-card';


            // ========================================
            // GOAL CARD HEADER
            // ========================================

            const goalHeader =
                document.createElement('div');


            goalHeader.className =
                'goal-card-header';


            // ========================================
            // TITLE AREA
            // ========================================

            const titleArea =
                document.createElement('div');


            titleArea.className =
                'goal-card-title';


            const title =
                document.createElement('h3');


            title.textContent =
                goal.title;


            const description =
                document.createElement('p');


            description.textContent =
                goal.description || '';


            titleArea.appendChild(
                title
            );


            titleArea.appendChild(
                description
            );


            // ========================================
            // STATUS
            // ========================================

            const status =
                document.createElement('span');


            status.className =
                'goal-status';


            status.textContent =
                goal.status;


            goalHeader.appendChild(
                titleArea
            );


            goalHeader.appendChild(
                status
            );


            goalItem.appendChild(
                goalHeader
            );


            // ========================================
            // PROGRESS AREA
            // ========================================

            const progressArea =
                document.createElement('div');


            progressArea.className =
                'goal-progress-area';


            const progressHeader =
                document.createElement('div');


            progressHeader.className =
                'goal-progress-header';


            const progressLabel =
                document.createElement('span');


            progressLabel.textContent =
                'Progress';


            const progressValue =
                document.createElement('strong');


            const currentValue =
                Number(
                    goal.current_value || 0
                );


            const targetValue =
                Number(
                    goal.target_value || 0
                );


            progressValue.textContent =
                currentValue +
                ' / ' +
                targetValue +
                ' ' +
                (goal.unit || '');


            progressHeader.appendChild(
                progressLabel
            );


            progressHeader.appendChild(
                progressValue
            );


            // ========================================
            // PROGRESS PERCENTAGE
            // ========================================

            let progressPercentage = 0;


            if (targetValue > 0) {

                progressPercentage =
                    (
                        currentValue /
                        targetValue
                    ) *
                    100;

            }


            progressPercentage =
                Math.max(
                    0,
                    Math.min(
                        100,
                        progressPercentage
                    )
                );


            // ========================================
            // PROGRESS BAR
            // ========================================

            const progressBar =
                document.createElement('div');


            progressBar.className =
                'goal-progress-bar';


            const progressFill =
                document.createElement('div');


            progressFill.className =
                'goal-progress-fill';


            progressFill.style.width =
                progressPercentage + '%';


            progressBar.appendChild(
                progressFill
            );


            progressArea.appendChild(
                progressHeader
            );


            progressArea.appendChild(
                progressBar
            );


            goalItem.appendChild(
                progressArea
            );


            // ========================================
            // GOAL META INFORMATION
            // ========================================

            const goalMeta =
                document.createElement('div');


            goalMeta.className =
                'goal-meta';


            // Deadline
            const deadline =
                document.createElement('span');


            deadline.innerHTML =
                'Deadline: <strong>' +
                formatDate(goal.deadline) +
                '</strong>';


            // Current progress
            const currentMeta =
                document.createElement('span');


            currentMeta.innerHTML =
                'Current: <strong>' +
                currentValue +
                '</strong>';


            // Target
            const targetMeta =
                document.createElement('span');


            targetMeta.innerHTML =
                'Target: <strong>' +
                targetValue +
                '</strong>';


            goalMeta.appendChild(
                deadline
            );


            goalMeta.appendChild(
                currentMeta
            );


            goalMeta.appendChild(
                targetMeta
            );


            goalItem.appendChild(
                goalMeta
            );


            // ========================================
            // GOAL ACTIONS CONTAINER
            // ========================================

            const goalActions =
                document.createElement('div');


            goalActions.className =
                'goal-actions';


            // ========================================
            // UPDATE PROGRESS BUTTON
            // ========================================

            const progressButton =
                document.createElement('button');


            progressButton.type =
                'button';


            progressButton.className =
                'goal-action-button primary';


            progressButton.textContent =
                'Update Progress';


            progressButton.addEventListener(
                'click',
                function () {

                    const newProgress =
                        prompt(
                            'Enter the new progress value:',
                            goal.current_value
                        );


                    if (newProgress === null) {

                        return;

                    }


                    updateGoalProgress(
                        goal.id,
                        newProgress
                    );

                }
            );


            // ========================================
            // EDIT BUTTON
            // ========================================

            const editButton =
                document.createElement('button');


            editButton.type =
                'button';


            editButton.className =
                'goal-action-button';


            editButton.textContent =
                'Edit Goal';


            editButton.addEventListener(
                'click',
                function () {

                    editGoal(goal);

                }
            );


            // ========================================
            // DELETE BUTTON
            // ========================================

            const deleteButton =
                document.createElement('button');


            deleteButton.type =
                'button';


            deleteButton.className =
                'goal-action-button danger';


            deleteButton.textContent =
                'Delete Goal';


            deleteButton.addEventListener(
                'click',
                function () {

                    deleteGoal(
                        goal.id
                    );

                }
            );


            // ========================================
            // ADD BUTTONS TO ACTIONS CONTAINER
            // ========================================

            goalActions.appendChild(
                progressButton
            );


            goalActions.appendChild(
                editButton
            );


            goalActions.appendChild(
                deleteButton
            );


            // ========================================
            // ADD ACTIONS TO GOAL CARD
            // ========================================

            goalItem.appendChild(
                goalActions
            );


            // ========================================
            // ADD GOAL CARD TO PAGE
            // ========================================

            goalsContainer.appendChild(
                goalItem
            );

        }
    );

}


// ========================================
// LOAD GOALS
// ========================================

async function loadGoals() {

    // Show loading state
    goalsContainer.innerHTML =
        '<p>Loading goals...</p>';


    try {

        const response =
            await fetch(
                '/api/goals',
                {
                    credentials: 'include'
                }
            );


        // Try to read server response
        let data;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            console.error(
                'Invalid goals response:',
                jsonError
            );


            goalsContainer.innerHTML =
                '<p>Could not load goals.</p>';

            return;

        }


        // Server rejected request
        if (!response.ok) {

            console.error(
                'Goals request failed:',
                response.status,
                data
            );


            goalsContainer.innerHTML =
                '<p>' +
                (
                    data.message ||
                    'Could not load goals.'
                ) +
                '</p>';


            return;

        }


        // Get goals from server
        goals =
            Array.isArray(data.goals)
                ? data.goals
                : [];


        // Display goals
        displayGoals();


    } catch (error) {

        console.error(
            'Load goals error:',
            error
        );


        goalsContainer.innerHTML =
            '<p>Could not connect to the server.</p>';

    }

}


// ========================================
// CREATE REMINDER BELL ICON
// ========================================

function createReminderBellIcon() {

    const svg =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );


    svg.setAttribute(
        'viewBox',
        '0 0 24 24'
    );


    svg.setAttribute(
        'fill',
        'none'
    );


    svg.setAttribute(
        'stroke',
        'currentColor'
    );


    svg.setAttribute(
        'stroke-width',
        '1.8'
    );


    svg.setAttribute(
        'stroke-linecap',
        'round'
    );


    svg.setAttribute(
        'stroke-linejoin',
        'round'
    );


    const bellBody =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );


    bellBody.setAttribute(
        'd',
        'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9'
    );


    const bellClapper =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );


    bellClapper.setAttribute(
        'd',
        'M10 21h4'
    );


    svg.appendChild(
        bellBody
    );


    svg.appendChild(
        bellClapper
    );


    return svg;

}


// ========================================
// LOAD DASHBOARD SUMMARY
// ========================================

async function loadDashboardSummary() {

    try {

        const results =
            await Promise.all([

                fetch(
                    '/api/goals',
                    {
                        credentials: 'include'
                    }
                ),

                fetch(
                    '/api/tasks',
                    {
                        credentials: 'include'
                    }
                ),

                fetch(
                    '/api/habits',
                    {
                        credentials: 'include'
                    }
                ),

                fetch(
                    '/api/reminders',
                    {
                        credentials: 'include'
                    }
                ),

                fetch(
                    '/api/focus',
                    {
                        credentials: 'include'
                    }
                )

            ]);


        const goalsResponse =
            results[0];

        const tasksResponse =
            results[1];

        const habitsResponse =
            results[2];

        const remindersResponse =
            results[3];

        const focusResponse =
            results[4];


        const goalsData =
            await goalsResponse.json();

        const tasksData =
            await tasksResponse.json();

        const habitsData =
            await habitsResponse.json();

        const remindersData =
            await remindersResponse.json();

        const focusData =
            await focusResponse.json();


        // ========================================
        // GOALS SUMMARY
        // ========================================

        const dashboardGoals =
            goalsData.goals || [];


        document.getElementById(
            'totalGoals'
        ).textContent =
            dashboardGoals.length;


        document.getElementById(
            'completedGoals'
        ).textContent =
            dashboardGoals.filter(
                function (goal) {

                    return goal.status ===
                        'Completed';

                }
            ).length;


        document.getElementById(
            'inProgressGoals'
        ).textContent =
            dashboardGoals.filter(
                function (goal) {

                    return goal.status ===
                        'In Progress';

                }
            ).length;


        // ========================================
        // TASKS SUMMARY
        // ========================================

        const dashboardTasks =
            tasksData.tasks || [];


        document.getElementById(
            'totalTasks'
        ).textContent =
            dashboardTasks.length;


        document.getElementById(
            'pendingTasks'
        ).textContent =
            dashboardTasks.filter(
                function (task) {

                    return task.status !==
                        'Completed';

                }
            ).length;


        document.getElementById(
            'completedTasks'
        ).textContent =
            dashboardTasks.filter(
                function (task) {

                    return task.status ===
                        'Completed';

                }
            ).length;


        // ========================================
        // HABITS SUMMARY
        // ========================================

        const dashboardHabits =
            habitsData.habits || [];


        document.getElementById(
            'totalHabits'
        ).textContent =
            dashboardHabits.length;


        document.getElementById(
            'activeHabits'
        ).textContent =
            dashboardHabits.filter(
                function (habit) {

                    return habit.status ===
                        'Active';

                }
            ).length;


        // ========================================
        // FOCUS SUMMARY
        // ========================================

        const dashboardFocus =
            focusData.focus_sessions || [];


        const completedFocus =
            dashboardFocus.filter(
                function (session) {

                    return session.status ===
                        'Completed';

                }
            );


        document.getElementById(
            'completedFocusSessions'
        ).textContent =
            completedFocus.length;


        const totalFocusMinutes =
            completedFocus.reduce(
                function (
                    total,
                    session
                ) {

                    return total +
                        Number(
                            session.duration_minutes ||
                            0
                        );

                },
                0
            );


        document.getElementById(
            'focusMinutes'
        ).textContent =
            totalFocusMinutes;


        // ========================================
        // UPCOMING REMINDERS
        // ========================================

        const dashboardReminders =
            remindersData.reminders || [];


        const now =
            new Date();


        const upcomingReminders =
            dashboardReminders

                .filter(
                    function (reminder) {

                        if (
                            reminder.status ===
                            'Completed'
                        ) {

                            return false;

                        }


                        if (
                            !reminder.reminder_date
                        ) {

                            return false;

                        }


                        const date =
                            formatDate(
                                reminder.reminder_date
                            );


                        const time =
                            String(
                                reminder.reminder_time ||
                                '00:00'
                            ).substring(
                                0,
                                5
                            );


                        const reminderDateTime =
                            new Date(
                                date +
                                'T' +
                                time
                            );


                        return (
                            reminderDateTime >=
                            now
                        );

                    }
                )

                .sort(
                    function (a, b) {

                        const aDate =
                            new Date(
                                formatDate(
                                    a.reminder_date
                                ) +
                                'T' +
                                String(
                                    a.reminder_time ||
                                    '00:00'
                                ).substring(
                                    0,
                                    5
                                )
                            );


                        const bDate =
                            new Date(
                                formatDate(
                                    b.reminder_date
                                ) +
                                'T' +
                                String(
                                    b.reminder_time ||
                                    '00:00'
                                ).substring(
                                    0,
                                    5
                                )
                            );


                        return aDate - bDate;

                    }
                )

                .slice(
                    0,
                    5
                );


        const remindersContainer =
            document.getElementById(
                'upcomingReminders'
            );


        // ========================================
        // DISPLAY REMINDERS
        // ========================================

        if (
            upcomingReminders.length === 0
        ) {

            remindersContainer.innerHTML =
                '<div class="empty-state">' +
                '<p>No upcoming reminders.</p>' +
                '</div>';

        } else {

            remindersContainer.innerHTML =
                '';


            upcomingReminders.forEach(
                function (reminder) {

                    const reminderItem =
                        document.createElement(
                            'div'
                        );


                    reminderItem.className =
                        'reminder-card';


                    // ========================================
                    // HEADER
                    // ========================================

                    const header =
                        document.createElement(
                            'div'
                        );


                    header.className =
                        'reminder-card-header';


                    // ========================================
                    // REMINDER BELL ICON
                    // ========================================

                    const icon =
                        document.createElement(
                            'div'
                        );


                    icon.className =
                        'reminder-icon';


                    icon.setAttribute(
                        'aria-hidden',
                        'true'
                    );


                    const bellIcon =
                        createReminderBellIcon();


                    icon.appendChild(
                        bellIcon
                    );


                    const titleArea =
                        document.createElement(
                            'div'
                        );


                    titleArea.className =
                        'reminder-title';


                    const title =
                        document.createElement(
                            'h3'
                        );


                    title.textContent =
                        reminder.title;


                    const status =
                        document.createElement(
                            'span'
                        );


                    status.textContent =
                        reminder.status;


                    titleArea.appendChild(
                        title
                    );


                    titleArea.appendChild(
                        status
                    );


                    header.appendChild(
                        icon
                    );


                    header.appendChild(
                        titleArea
                    );


                    reminderItem.appendChild(
                        header
                    );


                    // ========================================
                    // DESCRIPTION
                    // ========================================

                    const content =
                        document.createElement(
                            'div'
                        );


                    content.className =
                        'reminder-card-content';


                    const description =
                        document.createElement(
                            'p'
                        );


                    description.textContent =
                        reminder.description ||
                        'No description provided.';


                    content.appendChild(
                        description
                    );


                    reminderItem.appendChild(
                        content
                    );


                    // ========================================
                    // DETAILS
                    // ========================================

                    const details =
                        document.createElement(
                            'div'
                        );


                    details.className =
                        'reminder-card-details';


                    // ========================================
                    // DATE
                    // ========================================

                    const dateDetail =
                        document.createElement(
                            'div'
                        );


                    dateDetail.className =
                        'reminder-detail';


                    const dateLabel =
                        document.createElement(
                            'span'
                        );


                    dateLabel.className =
                        'detail-label';


                    dateLabel.textContent =
                        'DATE';


                    const dateValue =
                        document.createElement(
                            'strong'
                        );


                    dateValue.textContent =
                        formatDate(
                            reminder.reminder_date
                        );


                    dateDetail.appendChild(
                        dateLabel
                    );


                    dateDetail.appendChild(
                        dateValue
                    );


                    // ========================================
                    // TIME
                    // ========================================

                    const timeDetail =
                        document.createElement(
                            'div'
                        );


                    timeDetail.className =
                        'reminder-detail';


                    const timeLabel =
                        document.createElement(
                            'span'
                        );


                    timeLabel.className =
                        'detail-label';


                    timeLabel.textContent =
                        'TIME';


                    const timeValue =
                        document.createElement(
                            'strong'
                        );


                    timeValue.textContent =
                        String(
                            reminder.reminder_time ||
                            ''
                        ).substring(
                            0,
                            5
                        );


                    timeDetail.appendChild(
                        timeLabel
                    );


                    timeDetail.appendChild(
                        timeValue
                    );


                    details.appendChild(
                        dateDetail
                    );


                    details.appendChild(
                        timeDetail
                    );


                    reminderItem.appendChild(
                        details
                    );


                    remindersContainer.appendChild(
                        reminderItem
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            'Dashboard summary error:',
            error
        );

    }

}


// ========================================
// LOGOUT
// ========================================

async function logout() {

    try {

        await fetch(
            '/api/logout',
            {
                method: 'POST',
                credentials: 'include'
            }
        );


    } catch (error) {

        console.error(
            'Logout error:',
            error
        );

    }


    window.location.href =
        '/login.html';

}


// ========================================
// LOGOUT BUTTON
// ========================================

logoutButton.addEventListener(
    'click',
    logout
);


// ========================================
// INITIAL PAGE LOAD
// ========================================

loadUser();

loadGoals();

loadDashboardSummary();