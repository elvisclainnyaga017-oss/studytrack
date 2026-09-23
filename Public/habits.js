// ========================================
// HABIT PAGE ELEMENTS
// ========================================

const habitForm = document.getElementById('habitForm');

const habitMessage = document.getElementById('habitMessage');

const habitsContainer = document.getElementById('habitsContainer');

const logoutButton = document.getElementById('logoutButton');


// ========================================
// CREATE HABIT
// ========================================

habitForm.addEventListener('submit', async (event) => {

    event.preventDefault();


    const name =
        document.getElementById('habitName').value.trim();

    const description =
        document.getElementById('habitDescription').value.trim();


    // The current HTML form does not ask for
    // frequency or start date.
    // Use the backend defaults instead.

    const frequency = 'Daily';

    const startDate = new Date()
        .toISOString()
        .substring(0, 10);


    if (name === '') {

        habitMessage.textContent =
            'Habit name is required.';

        return;
    }


    habitMessage.textContent =
        'Creating habit...';


    try {

        const response = await fetch(
            '/api/habits',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify({

                    name: name,

                    description: description,

                    frequency: frequency,

                    start_date: startDate

                })
            }
        );


        const data = await response.json();


        if (response.ok) {

            habitMessage.textContent =
                'Habit created successfully!';

            habitForm.reset();

            loadHabits();

        } else {

            habitMessage.textContent =
                data.message ||
                'Could not create habit.';
        }


    } catch (error) {

        console.error(error);

        habitMessage.textContent =
            'Could not connect to the server.';
    }

});


// ========================================
// LOAD HABITS
// ========================================

async function loadHabits() {

    try {

        const response = await fetch(
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

            habitsContainer.textContent =
                'Could not load habits.';

            return;
        }


        const data = await response.json();


        if (
            !data.habits ||
            data.habits.length === 0
        ) {

            habitsContainer.innerHTML = `
                <p>
                    You have no habits yet.
                </p>
            `;

            return;
        }


        habitsContainer.innerHTML = '';


        data.habits.forEach((habit) => {

            const habitElement =
                document.createElement('div');


            habitElement.innerHTML = `

                <h3>
                    ${habit.name}
                </h3>


                <p>
                    ${habit.description || 'No description'}
                </p>


                <p>
                    Frequency:
                    ${habit.frequency || 'Daily'}
                </p>


                <p>
                    Start Date:
                    ${habit.start_date
                    ? String(habit.start_date)
                        .substring(0, 10)
                    : 'No start date'
                }
                </p>


                <p>
                    Status:
                    ${habit.status || 'Active'}
                </p>


                <button
                    onclick="editHabit(${habit.id})"
                >
                    Edit Habit
                </button>


                <button
                    onclick="deleteHabit(${habit.id})"
                >
                    Delete Habit
                </button>


                <hr>

            `;


            habitsContainer.appendChild(
                habitElement
            );

        });


    } catch (error) {

        console.error(error);

        habitsContainer.textContent =
            'Could not connect to the server.';
    }

}


// ========================================
// EDIT HABIT
// ========================================

async function editHabit(habitId) {

    try {

        const response = await fetch(
            '/api/habits',
            {
                credentials: 'include'
            }
        );


        if (!response.ok) {

            alert(
                'Could not load the habit.'
            );

            return;
        }


        const data = await response.json();


        const habit = data.habits.find(
            (item) => item.id === habitId
        );


        if (!habit) {

            alert('Habit not found.');

            return;
        }


        // ----------------------------------------
        // HABIT NAME
        // ----------------------------------------

        const newName = prompt(
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


        // ----------------------------------------
        // DESCRIPTION
        // ----------------------------------------

        const newDescription = prompt(
            'Enter the habit description:',
            habit.description || ''
        );


        if (newDescription === null) {
            return;
        }


        // ----------------------------------------
        // FREQUENCY
        // ----------------------------------------

        const newFrequency = prompt(
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


        // ----------------------------------------
        // START DATE
        // ----------------------------------------

        const newStartDate = prompt(
            'Enter the start date (YYYY-MM-DD):',
            habit.start_date
                ? String(habit.start_date)
                    .substring(0, 10)
                : ''
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


        // ----------------------------------------
        // STATUS
        // ----------------------------------------

        const newStatus = prompt(
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


        // ----------------------------------------
        // UPDATE HABIT
        // ----------------------------------------

        const updateResponse = await fetch(
            `/api/habits/${habitId}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify({

                    name: newName.trim(),

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

            loadHabits();

        } else {

            alert(
                updateData.message ||
                'Could not update habit.'
            );
        }


    } catch (error) {

        console.error(error);

        alert(
            'Could not connect to the server.'
        );
    }

}


// ========================================
// DELETE HABIT
// ========================================

async function deleteHabit(habitId) {

    const confirmed = confirm(
        'Are you sure you want to delete this habit?'
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/habits/${habitId}`,
            {
                method: 'DELETE',

                credentials: 'include'
            }
        );


        const data =
            await response.json();


        if (response.ok) {

            loadHabits();

        } else {

            alert(
                data.message ||
                'Could not delete habit.'
            );
        }


    } catch (error) {

        console.error(error);

        alert(
            'Could not connect to the server.'
        );
    }

}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    'click',
    async () => {

        try {

            const response = await fetch(
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

            console.error(error);

            alert(
                'Could not connect to the server.'
            );
        }

    }
);


// ========================================
// START PAGE
// ========================================

loadHabits();