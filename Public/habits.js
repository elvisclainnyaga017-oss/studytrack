// =========================================================
// STUDYTRACK - HABITS PAGE
// =========================================================


// =========================================================
// PAGE ELEMENTS
// =========================================================

const habitForm =
    document.getElementById('habitForm');

const habitMessage =
    document.getElementById('habitMessage');

const habitsContainer =
    document.getElementById('habitsContainer');

const logoutButton =
    document.getElementById('logoutButton');

const userName =
    document.getElementById('userName');

const userEmail =
    document.getElementById('userEmail');

const dayModeButton =
    document.getElementById('dayModeButton');

const nightModeButton =
    document.getElementById('nightModeButton');

const habitStartDate =
    document.getElementById('habitStartDate');


// =========================================================
// DEFAULT START DATE
// =========================================================

function setDefaultStartDate() {

    if (!habitStartDate) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(today.getMonth() + 1)
            .padStart(2, '0');


    const day =
        String(today.getDate())
            .padStart(2, '0');


    habitStartDate.value =
        `${year}-${month}-${day}`;
}


// =========================================================
// THEME MANAGEMENT
// =========================================================

function applyTheme(theme) {

    if (theme === 'night') {

        document.body.classList.add(
            'night-mode'
        );

    } else {

        document.body.classList.remove(
            'night-mode'
        );

    }


    updateThemeButtons();
}


function updateThemeButtons() {

    if (!dayModeButton || !nightModeButton) {
        return;
    }


    const isNightMode =
        document.body.classList.contains(
            'night-mode'
        );


    dayModeButton.classList.toggle(
        'active',
        !isNightMode
    );


    nightModeButton.classList.toggle(
        'active',
        isNightMode
    );


    dayModeButton.setAttribute(
        'aria-pressed',
        String(!isNightMode)
    );


    nightModeButton.setAttribute(
        'aria-pressed',
        String(isNightMode)
    );
}


function setTheme(theme) {

    localStorage.setItem(
        'studytrack-theme',
        theme
    );


    applyTheme(theme);
}


function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            'studytrack-theme'
        );


    if (savedTheme === 'night') {

        applyTheme('night');

    } else {

        applyTheme('day');

    }
}


if (dayModeButton) {

    dayModeButton.addEventListener(
        'click',
        () => {

            setTheme('day');

        }
    );
}


if (nightModeButton) {

    nightModeButton.addEventListener(
        'click',
        () => {

            setTheme('night');

        }
    );
}


// Apply saved theme immediately.
loadSavedTheme();


// =========================================================
// LOAD USER
// =========================================================

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


        if (data.user) {

            if (userName) {

                userName.textContent =
                    data.user.full_name ||
                    'User';

            }


            if (userEmail) {

                userEmail.textContent =
                    data.user.email ||
                    '';

            }

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


// =========================================================
// FORM MESSAGE
// =========================================================

function showHabitMessage(
    message,
    type = 'default'
) {

    if (!habitMessage) {
        return;
    }


    habitMessage.textContent =
        message;


    habitMessage.classList.add(
        'show'
    );


    habitMessage.dataset.type =
        type;

}


// =========================================================
// CREATE HABIT
// =========================================================

habitForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        const name =
            document.getElementById(
                'habitName'
            ).value.trim();


        const description =
            document.getElementById(
                'habitDescription'
            ).value.trim();


        const frequency =
            document.getElementById(
                'habitFrequency'
            ).value;


        const startDate =
            document.getElementById(
                'habitStartDate'
            ).value;


        if (name === '') {

            showHabitMessage(
                'Habit name is required.'
            );

            return;

        }


        if (startDate === '') {

            showHabitMessage(
                'Please select a start date.'
            );

            return;

        }


        showHabitMessage(
            'Creating habit...'
        );


        const habitButton =
            document.getElementById(
                'habitButton'
            );


        habitButton.disabled =
            true;


        try {

            const response =
                await fetch(
                    '/api/habits',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        credentials: 'include',

                        body: JSON.stringify({

                            name:
                                name,

                            description:
                                description,

                            frequency:
                                frequency,

                            start_date:
                                startDate

                        })
                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                showHabitMessage(
                    'Habit created successfully!'
                );


                habitForm.reset();


                setDefaultStartDate();


                await loadHabits();

            } else {

                showHabitMessage(
                    data.message ||
                    'Could not create habit.'
                );

            }


        } catch (error) {

            console.error(
                'Create habit error:',
                error
            );


            showHabitMessage(
                'Could not connect to the server.'
            );


        } finally {

            habitButton.disabled =
                false;

        }

    }
);


// =========================================================
// LOAD HABITS
// =========================================================

async function loadHabits() {

    try {

        const response =
            await fetch(
                '/api/habits',
                {
                    credentials: 'include'
                }
            );


        if (response.status === 401) {

            window.location.href =
                '/login.html';

            return;

        }


        if (!response.ok) {

            habitsContainer.innerHTML = `
                <div class="empty-state">
                    <p>
                        Could not load your habits.
                    </p>
                </div>
            `;

            return;

        }


        const data =
            await response.json();


        if (
            !data.habits ||
            data.habits.length === 0
        ) {

            habitsContainer.innerHTML = `
                <div class="empty-state">

                    <p>
                        You have no habits yet.
                        Create your first habit above
                        to start building consistency.
                    </p>

                </div>
            `;

            return;

        }


        habitsContainer.innerHTML =
            '';


        data.habits.forEach(
            (habit) => {

                const habitElement =
                    document.createElement(
                        'article'
                    );


                habitElement.className =
                    'goal-card';


                const startDate =
                    habit.start_date
                        ? String(
                            habit.start_date
                        ).substring(0, 10)
                        : 'No start date';


                const description =
                    habit.description &&
                        habit.description.trim() !== ''
                        ? habit.description
                        : 'No description provided.';


                const frequency =
                    habit.frequency ||
                    'Daily';


                const status =
                    habit.status ||
                    'Active';


                habitElement.innerHTML = `

                    <div class="goal-card-header">

                        <div class="goal-card-title">

                            <h3>
                                ${escapeHtml(
                    habit.name
                )}
                            </h3>

                            <p>
                                ${escapeHtml(
                    description
                )}
                            </p>

                        </div>


                        <span class="goal-status">

                            ${escapeHtml(
                    status
                )}

                        </span>

                    </div>


                    <div class="goal-meta">

                        <span>
                            Frequency:
                            <strong>
                                ${escapeHtml(
                    frequency
                )}
                            </strong>
                        </span>


                        <span>
                            Start Date:
                            <strong>
                                ${escapeHtml(
                    startDate
                )}
                            </strong>
                        </span>

                    </div>


                    <div class="goal-actions">

                        <button
                            type="button"
                            class="goal-action-button primary"
                            onclick="editHabit(${habit.id})">

                            Edit Habit

                        </button>


                        <button
                            type="button"
                            class="goal-action-button danger"
                            onclick="deleteHabit(${habit.id})">

                            Delete Habit

                        </button>

                    </div>

                `;


                habitsContainer.appendChild(
                    habitElement
                );

            }
        );


    } catch (error) {

        console.error(
            'Load habits error:',
            error
        );


        habitsContainer.innerHTML = `
            <div class="empty-state">
                <p>
                    Could not connect to the server.
                </p>
            </div>
        `;

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    const div =
        document.createElement(
            'div'
        );


    div.textContent =
        value ?? '';


    return div.innerHTML;
}


// =========================================================
// EDIT HABIT
// =========================================================

async function editHabit(habitId) {

    try {

        const response =
            await fetch(
                '/api/habits',
                {
                    credentials: 'include'
                }
            );


        if (response.status === 401) {

            window.location.href =
                '/login.html';

            return;

        }


        if (!response.ok) {

            alert(
                'Could not load the habit.'
            );

            return;

        }


        const data =
            await response.json();


        const habit =
            data.habits.find(
                (item) =>
                    item.id === habitId
            );


        if (!habit) {

            alert(
                'Habit not found.'
            );

            return;

        }


        // -----------------------------------------------------
        // HABIT NAME
        // -----------------------------------------------------

        const newName =
            prompt(
                'Enter the habit name:',
                habit.name
            );


        if (newName === null) {
            return;
        }


        if (newName.trim() === '') {

            alert(
                'Habit name cannot be empty.'
            );

            return;

        }


        // -----------------------------------------------------
        // DESCRIPTION
        // -----------------------------------------------------

        const newDescription =
            prompt(
                'Enter the habit description:',
                habit.description || ''
            );


        if (newDescription === null) {
            return;
        }


        // -----------------------------------------------------
        // FREQUENCY
        // -----------------------------------------------------

        const newFrequency =
            prompt(
                'Enter the frequency (Daily, Weekly, or Monthly):',
                habit.frequency || 'Daily'
            );


        if (newFrequency === null) {
            return;
        }


        if (newFrequency.trim() === '') {

            alert(
                'Frequency cannot be empty.'
            );

            return;

        }


        // -----------------------------------------------------
        // START DATE
        // -----------------------------------------------------

        const currentStartDate =
            habit.start_date
                ? String(
                    habit.start_date
                ).substring(0, 10)
                : '';


        const newStartDate =
            prompt(
                'Enter the start date (YYYY-MM-DD):',
                currentStartDate
            );


        if (newStartDate === null) {
            return;
        }


        if (newStartDate.trim() === '') {

            alert(
                'Start date is required.'
            );

            return;

        }


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        const newStatus =
            prompt(
                'Enter the status (Active or Inactive):',
                habit.status || 'Active'
            );


        if (newStatus === null) {
            return;
        }


        if (newStatus.trim() === '') {

            alert(
                'Status cannot be empty.'
            );

            return;

        }


        // -----------------------------------------------------
        // UPDATE HABIT
        // -----------------------------------------------------

        const updateResponse =
            await fetch(
                `/api/habits/${habitId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        name:
                            newName.trim(),

                        description:
                            newDescription.trim(),

                        frequency:
                            newFrequency.trim(),

                        start_date:
                            newStartDate.trim(),

                        status:
                            newStatus.trim()

                    })
                }
            );


        const updateData =
            await updateResponse.json();


        if (updateResponse.ok) {

            alert(
                'Habit updated successfully!'
            );


            await loadHabits();

        } else {

            alert(
                updateData.message ||
                'Could not update habit.'
            );

        }


    } catch (error) {

        console.error(
            'Edit habit error:',
            error
        );


        alert(
            'Could not connect to the server.'
        );

    }

}


// =========================================================
// DELETE HABIT
// =========================================================

async function deleteHabit(habitId) {

    const confirmed =
        confirm(
            'Are you sure you want to delete this habit?'
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/habits/${habitId}`,
                {
                    method: 'DELETE',

                    credentials: 'include'
                }
            );


        if (response.status === 401) {

            window.location.href =
                '/login.html';

            return;

        }


        const data =
            await response.json();


        if (response.ok) {

            await loadHabits();

        } else {

            alert(
                data.message ||
                'Could not delete habit.'
            );

        }


    } catch (error) {

        console.error(
            'Delete habit error:',
            error
        );


        alert(
            'Could not connect to the server.'
        );

    }

}


// =========================================================
// LOGOUT
// =========================================================

logoutButton.addEventListener(
    'click',
    async () => {

        try {

            const response =
                await fetch(
                    '/api/logout',
                    {
                        method: 'POST',

                        credentials: 'include'
                    }
                );


            if (response.ok) {

                window.location.href =
                    '/login.html';

            } else {

                alert(
                    'Could not log out.'
                );

            }


        } catch (error) {

            console.error(
                'Logout error:',
                error
            );


            alert(
                'Could not connect to the server.'
            );

        }

    }
);


// =========================================================
// START PAGE
// =========================================================

setDefaultStartDate();

loadUser();

loadHabits();