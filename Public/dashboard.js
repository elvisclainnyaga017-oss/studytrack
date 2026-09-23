let goals = [];


// ========================================
// GET PAGE ELEMENTS
// ========================================

const userName =
    document.getElementById('userName');

const userEmail =
    document.getElementById('userEmail');

const goalForm =
    document.getElementById('goalForm');

const goalMessage =
    document.getElementById('goalMessage');

const goalsContainer =
    document.getElementById('goalsContainer');

const logoutButton =
    document.getElementById('logoutButton');


// ========================================
// LOAD CURRENT USER
// ========================================

async function loadUser() {

    try {

        const response =
            await fetch(

                '/api/me',

                {
                    credentials:
                        'include'
                }

            );


        if (!response.ok) {

            window.location.href =
                '/login.html';

            return;

        }


        const data =
            await response.json();


        userName.textContent =
            data.user.full_name;

        userEmail.textContent =
            data.user.email;

    } catch (error) {

        console.error(error);

        window.location.href =
            '/login.html';

    }

}


// ========================================
// CREATE GOAL
// ========================================

goalForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        const title =
            document.getElementById(
                'goalTitle'
            ).value.trim();


        const description =
            document.getElementById(
                'goalDescription'
            ).value.trim();


        const deadline =
            document.getElementById(
                'goalDeadline'
            ).value;


        const current_value =
            document.getElementById(
                'goalCurrent'
            ).value;


        const target_value =
            document.getElementById(
                'goalTarget'
            ).value;


        const unit =
            document.getElementById(
                'goalUnit'
            ).value.trim();


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

                        credentials:
                            'include',

                        body:
                            JSON.stringify({

                                title,
                                description,
                                deadline,
                                current_value:
                                    Number(
                                        current_value || 0
                                    ),
                                target_value:
                                    Number(
                                        target_value || 100
                                    ),
                                unit

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

            console.error(error);

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


    return String(
        dateValue
    ).substring(0, 10);

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

                `/api/goals/${goalId}/progress`,

                {

                    method: 'PUT',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    credentials:
                        'include',

                    body:
                        JSON.stringify({

                            current_value:
                                Number(
                                    currentValue
                                )

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

        console.error(error);

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

                `/api/goals/${goal.id}`,

                {

                    method: 'PUT',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    credentials:
                        'include',

                    body:
                        JSON.stringify({

                            title:
                                newTitle.trim(),

                            description:
                                newDescription.trim(),

                            deadline:
                                newDeadline,

                            target_value:
                                Number(
                                    newTarget
                                ),

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

        console.error(error);

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

                `/api/goals/${goalId}`,

                {

                    method: 'DELETE',

                    credentials:
                        'include'

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

        console.error(error);

        alert(
            'Could not connect to the server.'
        );

    }

}


// ========================================
// DISPLAY GOALS
// ========================================

function displayGoals() {

    if (
        !goals ||
        goals.length === 0
    ) {

        goalsContainer.innerHTML =

            '<p>You have no goals yet.</p>';

        return;

    }


    goalsContainer.innerHTML = '';


    goals.forEach(
        (goal) => {

            const goalItem =
                document.createElement('div');


            goalItem.innerHTML = `

                <hr>

                <h3>
                    ${goal.title}
                </h3>

                <p>
                    ${goal.description || ''}
                </p>

                <p>
                    Progress:
                    ${goal.current_value}
                    /
                    ${goal.target_value}
                    ${goal.unit || ''}
                </p>

                <p>
                    Deadline:
                    ${formatDate(goal.deadline)}
                </p>

                <p>
                    Status:
                    ${goal.status}
                </p>

                <button
                    data-action="progress"
                >
                    Update Progress
                </button>

                <button
                    data-action="edit"
                >
                    Edit Goal
                </button>

                <button
                    data-action="delete"
                >
                    Delete Goal
                </button>

            `;


            const progressButton =
                goalItem.querySelector(
                    '[data-action="progress"]'
                );


            progressButton.addEventListener(
                'click',
                () => {

                    const newProgress =
                        prompt(

                            'Enter the new progress value:',

                            goal.current_value

                        );


                    if (
                        newProgress === null
                    ) {

                        return;

                    }


                    updateGoalProgress(

                        goal.id,

                        newProgress

                    );

                }
            );


            const editButton =
                goalItem.querySelector(
                    '[data-action="edit"]'
                );


            editButton.addEventListener(
                'click',
                () => {

                    editGoal(goal);

                }
            );


            const deleteButton =
                goalItem.querySelector(
                    '[data-action="delete"]'
                );


            deleteButton.addEventListener(
                'click',
                () => {

                    deleteGoal(goal.id);

                }
            );


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

    try {

        const response =
            await fetch(

                '/api/goals',

                {

                    credentials:
                        'include'

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            goalsContainer.innerHTML =

                `<p>
                    ${data.message}
                </p>`;

            return;

        }


        goals =
            data.goals;


        displayGoals();

    } catch (error) {

        console.error(error);

        goalsContainer.innerHTML =

            '<p>Could not load goals.</p>';

    }

}


// ========================================
// LOAD DASHBOARD SUMMARY
// ========================================

async function loadDashboardSummary() {

    try {

        const [
            goalsResponse,
            tasksResponse,
            habitsResponse,
            remindersResponse,
            focusResponse
        ] = await Promise.all([

            fetch(
                '/api/goals',
                {
                    credentials:
                        'include'
                }
            ),

            fetch(
                '/api/tasks',
                {
                    credentials:
                        'include'
                }
            ),

            fetch(
                '/api/habits',
                {
                    credentials:
                        'include'
                }
            ),

            fetch(
                '/api/reminders',
                {
                    credentials:
                        'include'
                }
            ),

            fetch(
                '/api/focus',
                {
                    credentials:
                        'include'
                }
            )

        ]);


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
                goal =>
                    goal.status === 'Completed'
            ).length;


        document.getElementById(
            'inProgressGoals'
        ).textContent =

            dashboardGoals.filter(
                goal =>
                    goal.status === 'In Progress'
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
                task =>
                    task.status !== 'Completed'
            ).length;


        document.getElementById(
            'completedTasks'
        ).textContent =

            dashboardTasks.filter(
                task =>
                    task.status === 'Completed'
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
                habit =>
                    habit.status === 'Active'
            ).length;


        // ========================================
        // FOCUS SUMMARY
        // ========================================

        const dashboardFocus =
            focusData.focus_sessions || [];


        const completedFocus =
            dashboardFocus.filter(
                session =>
                    session.status === 'Completed'
            );


        document.getElementById(
            'completedFocusSessions'
        ).textContent =
            completedFocus.length;


        const totalFocusMinutes =
            completedFocus.reduce(

                (
                    total,
                    session
                ) => {

                    return total +
                        Number(
                            session.duration_minutes || 0
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
                    (reminder) => {

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
                            ).substring(0, 5);


                        const reminderDateTime =
                            new Date(
                                `${date}T${time}`
                            );


                        return (
                            reminderDateTime >= now
                        );

                    }
                )

                .sort(
                    (a, b) => {

                        const aDate =
                            new Date(
                                `${formatDate(
                                    a.reminder_date
                                )}T${String(
                                    a.reminder_time ||
                                    '00:00'
                                ).substring(0, 5)}`
                            );


                        const bDate =
                            new Date(
                                `${formatDate(
                                    b.reminder_date
                                )}T${String(
                                    b.reminder_time ||
                                    '00:00'
                                ).substring(0, 5)}`
                            );


                        return (
                            aDate - bDate
                        );

                    }
                )

                .slice(0, 5);


        const remindersContainer =
            document.getElementById(
                'upcomingReminders'
            );


        if (
            upcomingReminders.length === 0
        ) {

            remindersContainer.innerHTML =
                '<p>No upcoming reminders.</p>';

        } else {

            remindersContainer.innerHTML =
                '';


            upcomingReminders.forEach(
                (reminder) => {

                    const reminderItem =
                        document.createElement(
                            'div'
                        );


                    reminderItem.innerHTML = `

                        <hr>

                        <h3>
                            ${reminder.title}
                        </h3>

                        <p>
                            ${reminder.description || ''}
                        </p>

                        <p>
                            Date:
                            ${formatDate(
                        reminder.reminder_date
                    )}
                        </p>

                        <p>
                            Time:
                            ${String(
                        reminder.reminder_time ||
                        ''
                    ).substring(0, 5)}
                        </p>

                        <p>
                            Status:
                            ${reminder.status}
                        </p>

                    `;


                    remindersContainer.appendChild(
                        reminderItem
                    );

                }
            );

        }

    } catch (error) {

        console.error(error);

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

                credentials:
                    'include'

            }

        );

    } catch (error) {

        console.error(error);

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