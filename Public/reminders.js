const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

const reminderForm = document.getElementById('reminderForm');
const reminderMessage = document.getElementById('reminderMessage');
const remindersContainer = document.getElementById('remindersContainer');

const logoutButton = document.getElementById('logoutButton');


// ========================================
// LOAD LOGGED-IN USER
// ========================================

async function loadUser() {

    try {

        const response = await fetch('/api/me', {
            credentials: 'include'
        });


        // User is not logged in.
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

        console.error('Could not load user:', error);

        window.location.href = '/login.html';
    }
}


// ========================================
// CREATE REMINDER
// ========================================

reminderForm.addEventListener('submit', async (event) => {

    event.preventDefault();


    // Get information from the form.
    const title =
        document.getElementById('reminderTitle').value.trim();

    const description =
        document.getElementById('reminderDescription').value.trim();

    const reminderDate =
        document.getElementById('reminderDate').value;

    const reminderTime =
        document.getElementById('reminderTime').value;


    reminderMessage.textContent =
        'Creating reminder...';


    try {

        const response = await fetch('/api/reminders', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            credentials: 'include',

            body: JSON.stringify({

                title: title,

                description: description,

                reminder_date: reminderDate,

                reminder_time: reminderTime

            })
        });


        const data =
            await response.json();


        // ========================================
        // SUCCESS
        // ========================================

        if (response.ok) {

            reminderMessage.textContent =
                'Reminder created successfully!';


            // Clear the form.
            reminderForm.reset();


            // Reload reminders.
            loadReminders();

        }


        // ========================================
        // ERROR
        // ========================================

        else {

            reminderMessage.textContent =
                data.message ||
                'Could not create reminder.';
        }

    } catch (error) {

        console.error(
            'Create reminder error:',
            error
        );

        reminderMessage.textContent =
            'Could not connect to the server.';
    }
});


// ========================================
// FORMAT DATE FOR DISPLAY
// ========================================

function formatDateForDisplay(dateValue) {

    if (!dateValue) {

        return 'No date';
    }


    // Keep the original YYYY-MM-DD value.
    // This prevents timezone conversion.
    const datePart =
        String(dateValue).substring(0, 10);


    const parts =
        datePart.split('-');


    if (parts.length !== 3) {

        return datePart;
    }


    const year = parts[0];
    const month = parts[1];
    const day = parts[2];


    return `${day}/${month}/${year}`;
}


// ========================================
// FORMAT TIME FOR DISPLAY
// ========================================

function formatTimeForDisplay(timeValue) {

    if (!timeValue) {

        return 'No time';
    }


    // MySQL TIME normally arrives as HH:MM:SS.
    // We only display hours and minutes.
    const timePart =
        String(timeValue).substring(0, 5);


    return timePart;
}


// ========================================
// EDIT REMINDER
// ========================================

async function editReminder(reminderId) {

    try {

        // Get current reminders.
        const response =
            await fetch('/api/reminders', {
                credentials: 'include'
            });


        if (!response.ok) {

            alert('Could not load the reminder.');

            return;
        }


        const data =
            await response.json();


        // Find the selected reminder.
        const reminder =
            data.reminders.find(
                (item) => item.id === reminderId
            );


        if (!reminder) {

            alert('Reminder not found.');

            return;
        }


        // ========================================
        // NEW TITLE
        // ========================================

        const newTitle = prompt(
            'Enter the reminder title:',
            reminder.title
        );


        if (newTitle === null) {

            return;
        }


        if (newTitle.trim() === '') {

            alert(
                'Reminder title cannot be empty.'
            );

            return;
        }


        // ========================================
        // NEW DESCRIPTION
        // ========================================

        const newDescription = prompt(
            'Enter the reminder description:',
            reminder.description || ''
        );


        if (newDescription === null) {

            return;
        }


        // ========================================
        // NEW DATE
        // ========================================

        const newDate = prompt(
            'Enter the reminder date (YYYY-MM-DD):',
            reminder.reminder_date
                ? String(reminder.reminder_date).substring(0, 10)
                : ''
        );


        if (newDate === null) {

            return;
        }


        // ========================================
        // NEW TIME
        // ========================================

        const newTime = prompt(
            'Enter the reminder time (HH:MM):',
            reminder.reminder_time
                ? String(reminder.reminder_time).substring(0, 5)
                : ''
        );


        if (newTime === null) {

            return;
        }


        // ========================================
        // NEW STATUS
        // ========================================

        const newStatus = prompt(
            'Enter the status (Pending, Completed):',
            reminder.status || 'Pending'
        );


        if (newStatus === null) {

            return;
        }


        // ========================================
        // SEND UPDATE TO SERVER
        // ========================================

        const updateResponse =
            await fetch(
                `/api/reminders/${reminderId}`,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        title:
                            newTitle.trim(),

                        description:
                            newDescription.trim(),

                        reminder_date:
                            newDate.trim(),

                        reminder_time:
                            newTime.trim(),

                        status:
                            newStatus.trim()

                    })
                }
            );


        const updateData =
            await updateResponse.json();


        if (updateResponse.ok) {

            alert(
                'Reminder updated successfully!'
            );

            loadReminders();

        } else {

            alert(
                updateData.message ||
                'Could not update reminder.'
            );
        }

    } catch (error) {

        console.error(
            'Edit reminder error:',
            error
        );

        alert(
            'Could not connect to the server.'
        );
    }
}


// ========================================
// DELETE REMINDER
// ========================================

async function deleteReminder(reminderId) {

    const confirmed = confirm(
        'Are you sure you want to delete this reminder?'
    );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/reminders/${reminderId}`,
                {

                    method: 'DELETE',

                    credentials: 'include'
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            loadReminders();

        } else {

            alert(
                data.message ||
                'Could not delete reminder.'
            );
        }

    } catch (error) {

        console.error(
            'Delete reminder error:',
            error
        );

        alert(
            'Could not connect to the server.'
        );
    }
}


// ========================================
// UPDATE REMINDER STATUS
// ========================================

async function updateReminderStatus(
    reminderId,
    newStatus
) {

    try {

        // Get the current reminder.
        const response =
            await fetch('/api/reminders', {
                credentials: 'include'
            });


        if (!response.ok) {

            alert('Could not load the reminder.');

            return;
        }


        const data =
            await response.json();


        const reminder =
            data.reminders.find(
                (item) => item.id === reminderId
            );


        if (!reminder) {

            alert('Reminder not found.');

            return;
        }


        // Update the reminder while keeping
        // the other information unchanged.
        const updateResponse =
            await fetch(
                `/api/reminders/${reminderId}`,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        title:
                            reminder.title,

                        description:
                            reminder.description || '',

                        reminder_date:
                            reminder.reminder_date
                                ? String(
                                    reminder.reminder_date
                                ).substring(0, 10)
                                : '',

                        reminder_time:
                            reminder.reminder_time
                                ? String(
                                    reminder.reminder_time
                                ).substring(0, 5)
                                : '',

                        status:
                            newStatus

                    })
                }
            );


        const updateData =
            await updateResponse.json();


        if (updateResponse.ok) {

            loadReminders();

        } else {

            alert(
                updateData.message ||
                'Could not update reminder status.'
            );
        }

    } catch (error) {

        console.error(
            'Update reminder status error:',
            error
        );

        alert(
            'Could not connect to the server.'
        );
    }
}


// ========================================
// LOAD REMINDERS
// ========================================

async function loadReminders() {

    try {

        const response =
            await fetch('/api/reminders', {
                credentials: 'include'
            });


        // Session has expired.
        if (response.status === 401) {

            window.location.href =
                '/login.html';

            return;
        }


        if (!response.ok) {

            remindersContainer.innerHTML =
                '<p>Could not load reminders.</p>';

            return;
        }


        const data =
            await response.json();


        // ========================================
        // NO REMINDERS
        // ========================================

        if (data.reminders.length === 0) {

            remindersContainer.innerHTML =
                '<p>You have no reminders yet.</p>';

            return;
        }


        // Clear the container.
        remindersContainer.innerHTML = '';


        // ========================================
        // DISPLAY REMINDERS
        // ========================================

        data.reminders.forEach((reminder) => {

            const reminderElement =
                document.createElement('div');


            reminderElement.innerHTML = `

                <h3>
                    ${reminder.title}
                </h3>


                <p>
                    ${reminder.description || 'No description'}
                </p>


                <p>
                    Date:
                    ${formatDateForDisplay(
                reminder.reminder_date
            )}
                </p>


                <p>
                    Time:
                    ${formatTimeForDisplay(
                reminder.reminder_time
            )}
                </p>


                <p>
                    Status:
                    ${reminder.status}
                </p>


                <label
                    for="reminder-status-${reminder.id}"
                >
                    Change Status
                </label>

                <br>


                <select
                    id="reminder-status-${reminder.id}"
                    onchange="
                        updateReminderStatus(
                            ${reminder.id},
                            this.value
                        )
                    "
                >

                    <option
                        value="Pending"
                        ${reminder.status === 'Pending'
                    ? 'selected'
                    : ''}
                    >
                        Pending
                    </option>


                    <option
                        value="Completed"
                        ${reminder.status === 'Completed'
                    ? 'selected'
                    : ''}
                    >
                        Completed
                    </option>

                </select>


                <br><br>


                <button
                    onclick="
                        editReminder(${reminder.id})
                    "
                >
                    Edit Reminder
                </button>


                <button
                    onclick="
                        deleteReminder(${reminder.id})
                    "
                >
                    Delete Reminder
                </button>


                <hr>

            `;


            remindersContainer.appendChild(
                reminderElement
            );
        });

    } catch (error) {

        console.error(
            'Load reminders error:',
            error
        );

        remindersContainer.innerHTML =
            '<p>Could not connect to the server.</p>';
    }
}


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    'click',
    async () => {

        try {

            const response =
                await fetch('/api/logout', {

                    method: 'POST',

                    credentials: 'include'
                });


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


// ========================================
// START REMINDERS PAGE
// ========================================

loadUser();

loadReminders();