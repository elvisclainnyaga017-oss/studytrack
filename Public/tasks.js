const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');

const taskForm = document.getElementById('taskForm');
const taskMessage = document.getElementById('taskMessage');
const tasksContainer = document.getElementById('tasksContainer');

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
// CREATE TASK
// ========================================

taskForm.addEventListener('submit', async (event) => {

    event.preventDefault();


    // Get information from the form.
    const title =
        document.getElementById('taskTitle').value.trim();

    const description =
        document.getElementById('taskDescription').value.trim();

    const dueDate =
        document.getElementById('taskDueDate').value;

    const priority =
        document.getElementById('taskPriority').value;


    taskMessage.textContent =
        'Creating task...';


    try {

        const response = await fetch('/api/tasks', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            credentials: 'include',

            body: JSON.stringify({

                title: title,

                description: description,

                due_date: dueDate,

                priority: priority

            })
        });


        const data = await response.json();


        // ========================================
        // SUCCESS
        // ========================================

        if (response.ok) {

            taskMessage.textContent =
                'Task created successfully!';


            // Clear the form.
            taskForm.reset();


            // Restore Medium as the default priority.
            document.getElementById('taskPriority').value =
                'Medium';


            // Reload the task list.
            loadTasks();

        }


        // ========================================
        // ERROR
        // ========================================

        else {

            taskMessage.textContent =
                data.message ||
                'Could not create task.';
        }

    } catch (error) {

        console.error('Create task error:', error);

        taskMessage.textContent =
            'Could not connect to the server.';
    }
});


// ========================================
// FORMAT DATE FOR DISPLAY
// ========================================

function formatDateForDisplay(dateValue) {

    if (!dateValue) {

        return 'No due date';
    }


    // Get only YYYY-MM-DD.
    // This prevents the Kenya timezone
    // from moving the date backward.
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
// EDIT TASK
// ========================================

async function editTask(taskId) {

    try {

        // Get the current tasks.
        const response = await fetch('/api/tasks', {
            credentials: 'include'
        });


        if (!response.ok) {

            alert('Could not load the task.');

            return;
        }


        const data = await response.json();


        // Find the task we want to edit.
        const task =
            data.tasks.find(
                (item) => item.id === taskId
            );


        if (!task) {

            alert('Task not found.');

            return;
        }


        // ========================================
        // NEW TITLE
        // ========================================

        const newTitle = prompt(
            'Enter the task title:',
            task.title
        );


        if (newTitle === null) {

            return;
        }


        if (newTitle.trim() === '') {

            alert('Task title cannot be empty.');

            return;
        }


        // ========================================
        // NEW DESCRIPTION
        // ========================================

        const newDescription = prompt(
            'Enter the task description:',
            task.description || ''
        );


        if (newDescription === null) {

            return;
        }


        // ========================================
        // NEW DUE DATE
        // ========================================

        const newDueDate = prompt(
            'Enter the due date (YYYY-MM-DD):',
            task.due_date
                ? String(task.due_date).substring(0, 10)
                : ''
        );


        if (newDueDate === null) {

            return;
        }


        // ========================================
        // NEW PRIORITY
        // ========================================

        const newPriority = prompt(
            'Enter the priority (Low, Medium, High):',
            task.priority || 'Medium'
        );


        if (newPriority === null) {

            return;
        }


        // ========================================
        // NEW STATUS
        // ========================================

        const newStatus = prompt(
            'Enter the status (Pending, In Progress, Completed):',
            task.status || 'Pending'
        );


        if (newStatus === null) {

            return;
        }


        // ========================================
        // SEND UPDATE TO SERVER
        // ========================================

        const updateResponse = await fetch(
            `/api/tasks/${taskId}`,
            {

                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: 'include',

                body: JSON.stringify({

                    title: newTitle.trim(),

                    description:
                        newDescription.trim(),

                    due_date:
                        newDueDate.trim(),

                    priority:
                        newPriority.trim(),

                    status:
                        newStatus.trim()

                })
            }
        );


        const updateData =
            await updateResponse.json();


        if (updateResponse.ok) {

            alert('Task updated successfully!');

            loadTasks();

        } else {

            alert(
                updateData.message ||
                'Could not update task.'
            );
        }

    } catch (error) {

        console.error('Edit task error:', error);

        alert('Could not connect to the server.');
    }
}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(taskId) {

    const confirmed = confirm(
        'Are you sure you want to delete this task?'
    );


    if (!confirmed) {

        return;
    }


    try {

        const response = await fetch(
            `/api/tasks/${taskId}`,
            {

                method: 'DELETE',

                credentials: 'include'
            }
        );


        const data =
            await response.json();


        if (response.ok) {

            loadTasks();

        } else {

            alert(
                data.message ||
                'Could not delete task.'
            );
        }

    } catch (error) {

        console.error('Delete task error:', error);

        alert('Could not connect to the server.');
    }
}


// ========================================
// UPDATE TASK STATUS
// ========================================

async function updateTaskStatus(
    taskId,
    newStatus
) {

    try {

        // Get the current task.
        const response =
            await fetch('/api/tasks', {
                credentials: 'include'
            });


        if (!response.ok) {

            alert('Could not load the task.');

            return;
        }


        const data =
            await response.json();


        const task =
            data.tasks.find(
                (item) => item.id === taskId
            );


        if (!task) {

            alert('Task not found.');

            return;
        }


        // Update only the status while
        // keeping the other task information.
        const updateResponse =
            await fetch(
                `/api/tasks/${taskId}`,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    credentials: 'include',

                    body: JSON.stringify({

                        title: task.title,

                        description:
                            task.description || '',

                        due_date:
                            task.due_date
                                ? String(task.due_date).substring(0, 10)
                                : '',

                        priority:
                            task.priority || 'Medium',

                        status:
                            newStatus

                    })
                }
            );


        const updateData =
            await updateResponse.json();


        if (updateResponse.ok) {

            loadTasks();

        } else {

            alert(
                updateData.message ||
                'Could not update task status.'
            );
        }

    } catch (error) {

        console.error(
            'Update task status error:',
            error
        );

        alert('Could not connect to the server.');
    }
}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    try {

        const response =
            await fetch('/api/tasks', {
                credentials: 'include'
            });


        // Session has expired.
        if (response.status === 401) {

            window.location.href =
                '/login.html';

            return;
        }


        if (!response.ok) {

            tasksContainer.innerHTML =
                '<p>Could not load tasks.</p>';

            return;
        }


        const data =
            await response.json();


        // ========================================
        // NO TASKS
        // ========================================

        if (data.tasks.length === 0) {

            tasksContainer.innerHTML =
                '<p>You have no tasks yet.</p>';

            return;
        }


        // Clear the container.
        tasksContainer.innerHTML = '';


        // ========================================
        // DISPLAY TASKS
        // ========================================

        data.tasks.forEach((task) => {

            const taskElement =
                document.createElement('div');


            taskElement.innerHTML = `

                <h3>
                    ${task.title}
                </h3>

                <p>
                    ${task.description || 'No description'}
                </p>

                <p>
                    Due Date:
                    ${formatDateForDisplay(task.due_date)}
                </p>

                <p>
                    Priority:
                    ${task.priority}
                </p>

                <p>
                    Status:
                    ${task.status}
                </p>


                <label
                    for="status-${task.id}"
                >
                    Change Status
                </label>

                <br>


                <select
                    id="status-${task.id}"
                    onchange="
                        updateTaskStatus(
                            ${task.id},
                            this.value
                        )
                    "
                >

                    <option
                        value="Pending"
                        ${task.status === 'Pending'
                    ? 'selected'
                    : ''}
                    >
                        Pending
                    </option>

                    <option
                        value="In Progress"
                        ${task.status === 'In Progress'
                    ? 'selected'
                    : ''}
                    >
                        In Progress
                    </option>

                    <option
                        value="Completed"
                        ${task.status === 'Completed'
                    ? 'selected'
                    : ''}
                    >
                        Completed
                    </option>

                </select>

                <br><br>


                <button
                    onclick="editTask(${task.id})"
                >
                    Edit Task
                </button>


                <button
                    onclick="deleteTask(${task.id})"
                >
                    Delete Task
                </button>


                <hr>

            `;


            tasksContainer.appendChild(
                taskElement
            );
        });

    } catch (error) {

        console.error('Load tasks error:', error);

        tasksContainer.innerHTML =
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

                alert('Could not log out.');
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
// START TASKS PAGE
// ========================================

loadUser();

loadTasks();