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
// DAY / NIGHT THEME
// ========================================

const dayModeButton =
    document.getElementById('dayModeButton');

const nightModeButton =
    document.getElementById('nightModeButton');


function applyTheme(theme) {

    if (theme === 'night') {

        document.body.classList.add(
            'night-mode'
        );

        if (dayModeButton) {

            dayModeButton.classList.remove(
                'active'
            );

        }

        if (nightModeButton) {

            nightModeButton.classList.add(
                'active'
            );

        }

    } else {

        document.body.classList.remove(
            'night-mode'
        );

        if (nightModeButton) {

            nightModeButton.classList.remove(
                'active'
            );

        }

        if (dayModeButton) {

            dayModeButton.classList.add(
                'active'
            );

        }

    }


    localStorage.setItem(
        'studytrack-theme',
        theme
    );

}


// ========================================
// DAY MODE
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
// NIGHT MODE
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
    localStorage.getItem(
        'studytrack-theme'
    );


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

        const response =
            await fetch(
                '/api/me',
                {
                    credentials: 'include'
                }
            );


        if (!response.ok) {

            window.location.href =
                '/login.html';

            return;

        }


        const data =
            await response.json();


        if (
            data.user &&
            userName &&
            userEmail
        ) {

            userName.textContent =
                data.user.full_name;

            userEmail.textContent =
                data.user.email;

        }

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
// CREATE GOAL
// ========================================

if (goalForm) {

    goalForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        'goalTitle'
                    )
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        'goalDescription'
                    )
                    .value
                    .trim();


            const deadline =
                document
                    .getElementById(
                        'goalDeadline'
                    )
                    .value;


            const currentValue =
                document
                    .getElementById(
                        'goalCurrent'
                    )
                    .value;


            const targetValue =
                document
                    .getElementById(
                        'goalTarget'
                    )
                    .value;


            const unit =
                document
                    .getElementById(
                        'goalUnit'
                    )
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

                                description:
                                    description,

                                deadline:
                                    deadline,

                                current_value:
                                    Number(
                                        currentValue || 0
                                    ),

                                target_value:
                                    Number(
                                        targetValue || 100
                                    ),

                                unit:
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

}


// ========================================
// UPDATE GOAL PROGRESS
// ========================================

async function updateGoalProgress(
    goalId,
    currentValue
) {

    const numericValue =
        Number(currentValue);


    if (
        Number.isNaN(numericValue) ||
        numericValue < 0
    ) {

        alert(
            'Please enter a valid progress value.'
        );

        return;

    }


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
                            numericValue

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


    if (
        Number.isNaN(
            Number(newTarget)
        ) ||
        Number(newTarget) <= 0
    ) {

        alert(
            'Target value must be greater than zero.'
        );

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

    if (
        !goals ||
        goals.length === 0
    ) {

        goalsContainer.innerHTML =
            '<div class="empty-state">' +
            '<p>You have no goals yet.</p>' +
            '<p>Create your first goal above to get started.</p>' +
            '</div>';

        return;

    }


    goalsContainer.innerHTML = '';


    goals.forEach(
        function (goal) {

            // ========================================
            // MAIN GOAL CARD
            // ========================================

            const goalItem =
                document.createElement(
                    'div'
                );


            goalItem.className =
                'goal-card';


            // ========================================
            // GOAL HEADER
            // ========================================

            const goalHeader =
                document.createElement(
                    'div'
                );


            goalHeader.className =
                'goal-card-header';


            const titleArea =
                document.createElement(
                    'div'
                );


            titleArea.className =
                'goal-card-title';


            const title =
                document.createElement(
                    'h3'
                );


            title.textContent =
                goal.title;


            const description =
                document.createElement(
                    'p'
                );


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
                document.createElement(
                    'span'
                );


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
            // PROGRESS
            // ========================================

            const progressArea =
                document.createElement(
                    'div'
                );


            progressArea.className =
                'goal-progress-area';


            const progressHeader =
                document.createElement(
                    'div'
                );


            progressHeader.className =
                'goal-progress-header';


            const progressLabel =
                document.createElement(
                    'span'
                );


            progressLabel.textContent =
                'Progress';


            const progressValue =
                document.createElement(
                    'strong'
                );


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
                (
                    goal.unit || ''
                );


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
                document.createElement(
                    'div'
                );


            progressBar.className =
                'goal-progress-bar';


            const progressFill =
                document.createElement(
                    'div'
                );


            progressFill.className =
                'goal-progress-fill';


            progressFill.style.width =
                progressPercentage +
                '%';


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
            // META INFORMATION
            // ========================================

            const goalMeta =
                document.createElement(
                    'div'
                );


            goalMeta.className =
                'goal-meta';


            const deadline =
                document.createElement(
                    'span'
                );


            deadline.innerHTML =
                'Deadline: <strong>' +
                formatDate(
                    goal.deadline
                ) +
                '</strong>';


            const currentMeta =
                document.createElement(
                    'span'
                );


            currentMeta.innerHTML =
                'Current: <strong>' +
                currentValue +
                '</strong>';


            const targetMeta =
                document.createElement(
                    'span'
                );


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
            // ACTIONS
            // ========================================

            const goalActions =
                document.createElement(
                    'div'
                );


            goalActions.className =
                'goal-actions';


            // UPDATE PROGRESS

            const progressButton =
                document.createElement(
                    'button'
                );


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


            // EDIT

            const editButton =
                document.createElement(
                    'button'
                );


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


            // DELETE

            const deleteButton =
                document.createElement(
                    'button'
                );


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


            goalActions.appendChild(
                progressButton
            );


            goalActions.appendChild(
                editButton
            );


            goalActions.appendChild(
                deleteButton
            );


            goalItem.appendChild(
                goalActions
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

    goalsContainer.innerHTML =
        '<div class="empty-state">' +
        '<p>Loading goals...</p>' +
        '</div>';


    try {

        const response =
            await fetch(
                '/api/goals',
                {
                    credentials: 'include'
                }
            );


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
                '<div class="empty-state">' +
                '<p>Could not load goals.</p>' +
                '</div>';

            return;

        }


        if (!response.ok) {

            console.error(
                'Goals request failed:',
                response.status,
                data
            );


            goalsContainer.innerHTML =
                '<div class="empty-state">' +
                '<p>' +
                (
                    data.message ||
                    'Could not load goals.'
                ) +
                '</p>' +
                '</div>';

            return;

        }


        goals =
            Array.isArray(data.goals)
                ? data.goals
                : [];


        displayGoals();


    } catch (error) {

        console.error(
            'Load goals error:',
            error
        );


        goalsContainer.innerHTML =
            '<div class="empty-state">' +
            '<p>Could not connect to the server.</p>' +
            '</div>';

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

if (logoutButton) {

    logoutButton.addEventListener(
        'click',
        logout
    );

}


// ========================================
// INITIAL PAGE LOAD
// ========================================

loadUser();

loadGoals();