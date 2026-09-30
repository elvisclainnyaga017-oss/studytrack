let goals = [];


// =========================================================
// GET PAGE ELEMENTS
// =========================================================

const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const goalForm = document.getElementById('goalForm');
const goalMessage = document.getElementById('goalMessage');
const goalsContainer = document.getElementById('goalsContainer');
const logoutButton = document.getElementById('logoutButton');

const mobileMenuButton =
    document.getElementById('mobileMenuButton');

const studyTrackSidebar =
    document.getElementById('studyTrackSidebar');

const sidebarOverlay =
    document.getElementById('sidebarOverlay');

const dayModeButton =
    document.getElementById('dayModeButton');

const nightModeButton =
    document.getElementById('nightModeButton');


// =========================================================
// DAY / NIGHT THEME
// =========================================================

function updateThemeSelector(theme) {

    if (dayModeButton) {

        dayModeButton.classList.toggle(
            'active',
            theme === 'day'
        );

        dayModeButton.setAttribute(
            'aria-pressed',
            theme === 'day'
                ? 'true'
                : 'false'
        );

    }


    if (nightModeButton) {

        nightModeButton.classList.toggle(
            'active',
            theme === 'night'
        );

        nightModeButton.setAttribute(
            'aria-pressed',
            theme === 'night'
                ? 'true'
                : 'false'
        );

    }

}


function applySavedTheme() {

    const savedTheme =
        localStorage.getItem(
            'studytrack-theme'
        );

    const theme =
        savedTheme === 'night'
            ? 'night'
            : 'day';


    document.body.classList.toggle(
        'night-mode',
        theme === 'night'
    );


    updateThemeSelector(theme);

}


function setTheme(theme) {

    const selectedTheme =
        theme === 'night'
            ? 'night'
            : 'day';


    document.body.classList.toggle(
        'night-mode',
        selectedTheme === 'night'
    );


    localStorage.setItem(
        'studytrack-theme',
        selectedTheme
    );


    updateThemeSelector(
        selectedTheme
    );

}


if (dayModeButton) {

    dayModeButton.addEventListener(
        'click',
        function () {

            setTheme('day');

        }
    );

}


if (nightModeButton) {

    nightModeButton.addEventListener(
        'click',
        function () {

            setTheme('night');

        }
    );

}


// =========================================================
// SIDEBAR
// =========================================================

function isMobileView() {

    return window.innerWidth <= 720;

}


function closeMobileMenu() {

    document.body.classList.remove(
        'mobile-menu-open'
    );

}


function openMobileMenu() {

    document.body.classList.add(
        'mobile-menu-open'
    );

}


function applySavedSidebarState() {

    if (!studyTrackSidebar) {

        return;

    }


    if (isMobileView()) {

        document.body.classList.remove(
            'desktop-sidebar-collapsed'
        );

        closeMobileMenu();

        return;

    }


    const savedState =
        localStorage.getItem(
            'studytrack-sidebar-collapsed'
        );


    if (savedState === 'true') {

        document.body.classList.add(
            'desktop-sidebar-collapsed'
        );

    } else {

        document.body.classList.remove(
            'desktop-sidebar-collapsed'
        );

    }

}


if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        'click',
        function () {

            if (isMobileView()) {

                if (
                    document.body.classList.contains(
                        'mobile-menu-open'
                    )
                ) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

                return;

            }


            const isCollapsed =
                document.body.classList.toggle(
                    'desktop-sidebar-collapsed'
                );


            localStorage.setItem(
                'studytrack-sidebar-collapsed',
                String(isCollapsed)
            );

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        'click',
        closeMobileMenu
    );

}


document.addEventListener(
    'keydown',
    function (event) {

        if (event.key === 'Escape') {

            closeMobileMenu();

        }

    }
);


window.addEventListener(
    'resize',
    function () {

        applySavedSidebarState();

    }
);


if (studyTrackSidebar) {

    const sidebarLinks =
        studyTrackSidebar.querySelectorAll(
            'a'
        );


    sidebarLinks.forEach(
        function (link) {

            link.addEventListener(
                'click',
                function () {

                    if (isMobileView()) {

                        closeMobileMenu();

                    }

                }
            );

        }
    );

}


// =========================================================
// LOAD CURRENT USER
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


        const user =
            data.user || data;


        if (userName) {

            userName.textContent =
                user.full_name ||
                'Student';

        }


        if (userEmail) {

            userEmail.textContent =
                user.email ||
                '';

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
// GOAL MESSAGE
// =========================================================

function showGoalMessage(
    message,
    isError
) {

    if (!goalMessage) {

        return;

    }


    goalMessage.textContent =
        message;


    goalMessage.classList.toggle(
        'error',
        Boolean(isError)
    );

}


// =========================================================
// CREATE GOAL
// =========================================================

if (goalForm) {

    goalForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const titleInput =
                document.getElementById(
                    'goalTitle'
                );


            const descriptionInput =
                document.getElementById(
                    'goalDescription'
                );


            const deadlineInput =
                document.getElementById(
                    'goalDeadline'
                );


            const currentInput =
                document.getElementById(
                    'goalCurrent'
                );


            const targetInput =
                document.getElementById(
                    'goalTarget'
                );


            const unitInput =
                document.getElementById(
                    'goalUnit'
                );


            const title =
                titleInput
                    ? titleInput.value.trim()
                    : '';


            const description =
                descriptionInput
                    ? descriptionInput.value.trim()
                    : '';


            const deadline =
                deadlineInput
                    ? deadlineInput.value
                    : '';


            const currentValue =
                currentInput
                    ? Number(
                        currentInput.value || 0
                    )
                    : 0;


            const targetValue =
                targetInput
                    ? Number(
                        targetInput.value || 100
                    )
                    : 100;


            const unit =
                unitInput
                    ? unitInput.value.trim()
                    : '';


            if (!title) {

                showGoalMessage(
                    'Goal title is required.',
                    true
                );

                return;

            }


            if (
                !Number.isFinite(
                    currentValue
                ) ||
                currentValue < 0
            ) {

                showGoalMessage(
                    'Current progress must be 0 or greater.',
                    true
                );

                return;

            }


            if (
                !Number.isFinite(
                    targetValue
                ) ||
                targetValue <= 0
            ) {

                showGoalMessage(
                    'Target value must be greater than 0.',
                    true
                );

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

                                title:
                                    title,

                                description:
                                    description,

                                deadline:
                                    deadline,

                                current_value:
                                    currentValue,

                                target_value:
                                    targetValue,

                                unit:
                                    unit

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showGoalMessage(
                        data.message ||
                        'Could not create goal.',
                        true
                    );

                    return;

                }


                showGoalMessage(
                    'Goal created successfully.',
                    false
                );


                goalForm.reset();


                if (currentInput) {

                    currentInput.value =
                        '0';

                }


                if (targetInput) {

                    targetInput.value =
                        '100';

                }


                await loadGoals();

            } catch (error) {

                console.error(
                    'Create goal error:',
                    error
                );


                showGoalMessage(
                    'Could not connect to the server.',
                    true
                );

            }

        }
    );

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateValue) {

    if (!dateValue) {

        return 'No deadline';

    }


    return String(dateValue).substring(
        0,
        10
    );

}


// =========================================================
// FORMAT NUMBER
// =========================================================

function formatNumber(value) {

    const number =
        Number(value || 0);


    if (!Number.isFinite(number)) {

        return '0';

    }


    if (Number.isInteger(number)) {

        return String(number);

    }


    return number.toFixed(2);

}


// =========================================================
// UPDATE GOAL PROGRESS
// =========================================================

async function updateGoalProgress(
    goalId,
    targetValue
) {

    const currentGoal =
        goals.find(
            function (goal) {

                return Number(goal.id) ===
                    Number(goalId);

            }
        );


    const currentValue =
        currentGoal
            ? Number(
                currentGoal.current_value || 0
            )
            : 0;


    const target =
        Number(
            targetValue ||
            (
                currentGoal
                    ? currentGoal.target_value
                    : 0
            )
        );


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {

        alert(
            'This goal has an invalid target value.'
        );

        return;

    }


    const enteredValue =
        prompt(
            'Enter the new progress value:',
            formatNumber(currentValue)
        );


    if (enteredValue === null) {

        return;

    }


    const newValue =
        Number(enteredValue);


    if (
        !Number.isFinite(newValue) ||
        newValue < 0
    ) {

        alert(
            'Please enter a valid number that is 0 or greater.'
        );

        return;

    }


    const progress =
        Math.max(
            0,
            Math.min(
                100,
                (
                    newValue /
                    target
                ) *
                100
            )
        );


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

                        progress:
                            progress

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


// =========================================================
// EDIT GOAL
// =========================================================

async function editGoal(goal) {

    const newTitle =
        prompt(
            'Enter the new goal title:',
            goal.title || ''
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


    const existingDeadline =
        formatDate(
            goal.deadline
        );


    const newDeadline =
        prompt(
            'Enter the deadline (YYYY-MM-DD):',
            existingDeadline === 'No deadline'
                ? ''
                : existingDeadline
        );


    if (newDeadline === null) {

        return;

    }


    const newTarget =
        prompt(
            'Enter the target value:',
            formatNumber(
                goal.target_value
            )
        );


    if (newTarget === null) {

        return;

    }


    const targetValue =
        Number(newTarget);


    if (
        !Number.isFinite(
            targetValue
        ) ||
        targetValue <= 0
    ) {

        alert(
            'Target value must be greater than 0.'
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

                        current_value:
                            Number(
                                goal.current_value || 0
                            ),

                        target_value:
                            targetValue,

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


// =========================================================
// DELETE GOAL
// =========================================================

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


// =========================================================
// CREATE GOAL CARD
// =========================================================

function createGoalCard(goal) {

    const goalItem =
        document.createElement(
            'article'
        );


    goalItem.className =
        'goal-card';


    // -----------------------------------------------------
    // HEADER
    // -----------------------------------------------------

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
        goal.title ||
        'Untitled Goal';


    const description =
        document.createElement(
            'p'
        );


    description.textContent =
        goal.description ||
        'No description provided.';


    titleArea.appendChild(
        title
    );


    titleArea.appendChild(
        description
    );


    const status =
        document.createElement(
            'span'
        );


    status.className =
        'goal-status';


    status.textContent =
        goal.status ||
        'Not Started';


    goalHeader.appendChild(
        titleArea
    );


    goalHeader.appendChild(
        status
    );


    goalItem.appendChild(
        goalHeader
    );


    // -----------------------------------------------------
    // PROGRESS VALUES
    // -----------------------------------------------------

    const currentValue =
        Number(
            goal.current_value || 0
        );


    const targetValue =
        Number(
            goal.target_value || 0
        );


    let progressPercentage =
        0;


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


    // -----------------------------------------------------
    // PROGRESS AREA
    // -----------------------------------------------------

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


    progressValue.textContent =
        formatNumber(
            currentValue
        ) +
        ' / ' +
        formatNumber(
            targetValue
        ) +
        ' ' +
        (
            goal.unit ||
            ''
        );


    progressHeader.appendChild(
        progressLabel
    );


    progressHeader.appendChild(
        progressValue
    );


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


    // -----------------------------------------------------
    // GOAL META
    // -----------------------------------------------------

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
        formatNumber(
            currentValue
        ) +
        '</strong>';


    const targetMeta =
        document.createElement(
            'span'
        );


    targetMeta.innerHTML =
        'Target: <strong>' +
        formatNumber(
            targetValue
        ) +
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


    // -----------------------------------------------------
    // GOAL ACTIONS
    // -----------------------------------------------------

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

            updateGoalProgress(
                goal.id,
                targetValue
            );

        }
    );


    // EDIT GOAL

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


    // DELETE GOAL

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


    // ADD BUTTONS

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


    return goalItem;

}


// =========================================================
// DISPLAY GOALS
// =========================================================

function displayGoals() {

    if (!goalsContainer) {

        return;

    }


    goalsContainer.innerHTML =
        '';


    if (goals.length === 0) {

        const emptyState =
            document.createElement(
                'div'
            );


        emptyState.className =
            'empty-state';


        const message =
            document.createElement(
                'p'
            );


        message.textContent =
            'No goals yet. Create your first goal above.';


        emptyState.appendChild(
            message
        );


        goalsContainer.appendChild(
            emptyState
        );


        return;

    }


    goals.forEach(
        function (goal) {

            goalsContainer.appendChild(
                createGoalCard(goal)
            );

        }
    );

}


// =========================================================
// LOAD GOALS
// =========================================================

async function loadGoals() {

    if (!goalsContainer) {

        return;

    }


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


        // The StudyTrack API returns the goals
        // directly as an array.
        if (Array.isArray(data)) {

            goals = data;

        } else if (
            data &&
            Array.isArray(data.goals)
        ) {

            // This also supports an object response
            // containing a goals array.
            goals = data.goals;

        } else {

            goals = [];

        }


        console.log(
            'Goals loaded successfully:',
            goals
        );


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


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        'click',
        async function () {

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

            } finally {

                window.location.href =
                    '/login.html';

            }

        }
    );

}


// =========================================================
// START GOALS PAGE
// =========================================================

applySavedTheme();

applySavedSidebarState();

loadUser();

loadGoals();