javascript
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
// NAVIGATION ELEMENTS
// ========================================

const mobileMenuButton =
    document.getElementById('mobileMenuButton');

const studyTrackSidebar =
    document.getElementById('studyTrackSidebar');

const mobileMenuOverlay =
    document.getElementById('mobileMenuOverlay');


// ========================================
// SCREEN SIZE
// ========================================

function isMobileScreen() {

    return window.matchMedia(
        '(max-width: 720px)'
    ).matches;

}


// ========================================
// SIDEBAR LABELS
// ========================================

function setupSidebarLabels() {

    const navigationItems =
        document.querySelectorAll(
            '.sidebar-nav-link, .logout-button'
        );


    navigationItems.forEach(
        function (item) {

            const textElement =
                item.querySelector(
                    'span:not(.nav-icon)'
                );


            if (!textElement) {

                return;

            }


            const label =
                textElement.textContent.trim();


            if (!label) {

                return;

            }


            item.setAttribute(
                'data-tooltip',
                label
            );

        }
    );

}


// ========================================
// UPDATE NAVIGATION BUTTON
// ========================================

function updateNavigationButton() {

    if (!mobileMenuButton) {

        return;

    }


    if (isMobileScreen()) {

        const mobileOpen =
            document.body.classList.contains(
                'mobile-menu-open'
            );


        mobileMenuButton.classList.toggle(
            'menu-open',
            mobileOpen
        );


        mobileMenuButton.setAttribute(
            'aria-expanded',
            String(mobileOpen)
        );


        mobileMenuButton.setAttribute(
            'aria-label',
            mobileOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
        );


        mobileMenuButton.setAttribute(
            'title',
            mobileOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
        );


        return;

    }


    const desktopCollapsed =
        document.body.classList.contains(
            'desktop-sidebar-collapsed'
        );


    mobileMenuButton.classList.toggle(
        'menu-open',
        !desktopCollapsed
    );


    mobileMenuButton.setAttribute(
        'aria-expanded',
        String(!desktopCollapsed)
    );


    mobileMenuButton.setAttribute(
        'aria-label',
        desktopCollapsed
            ? 'Expand navigation menu'
            : 'Collapse navigation menu'
    );


    mobileMenuButton.setAttribute(
        'title',
        desktopCollapsed
            ? 'Expand navigation menu'
            : 'Collapse navigation menu'
    );

}


// ========================================
// CLOSE MOBILE MENU
// ========================================

function closeMobileMenu() {

    if (studyTrackSidebar) {

        studyTrackSidebar.classList.remove(
            'mobile-menu-open'
        );

    }


    document.body.classList.remove(
        'mobile-menu-open'
    );


    document.body.classList.remove(
        'mobile-menu-active'
    );


    if (mobileMenuOverlay) {

        mobileMenuOverlay.classList.remove(
            'active'
        );


        mobileMenuOverlay.setAttribute(
            'aria-hidden',
            'true'
        );

    }

}


// ========================================
// OPEN / CLOSE MOBILE MENU
// ========================================

function setMobileMenu(open) {

    if (!studyTrackSidebar) {

        return;

    }


    if (open) {

        studyTrackSidebar.classList.add(
            'mobile-menu-open'
        );


        document.body.classList.add(
            'mobile-menu-open'
        );


        document.body.classList.remove(
            'desktop-sidebar-collapsed'
        );

    } else {

        studyTrackSidebar.classList.remove(
            'mobile-menu-open'
        );


        document.body.classList.remove(
            'mobile-menu-open'
        );


        document.body.classList.remove(
            'mobile-menu-active'
        );

    }


    if (mobileMenuOverlay) {

        mobileMenuOverlay.classList.toggle(
            'active',
            open
        );


        mobileMenuOverlay.setAttribute(
            'aria-hidden',
            String(!open)
        );

    }


    updateNavigationButton();

}


// ========================================
// DESKTOP SIDEBAR COLLAPSE
// ========================================

function setDesktopSidebarCollapsed(
    collapsed
) {

    if (!studyTrackSidebar) {

        return;

    }


    if (isMobileScreen()) {

        return;

    }


    closeMobileMenu();


    if (collapsed) {

        document.body.classList.add(
            'desktop-sidebar-collapsed'
        );

    } else {

        document.body.classList.remove(
            'desktop-sidebar-collapsed'
        );

    }


    localStorage.setItem(
        'studytrack-sidebar-collapsed',
        String(collapsed)
    );


    updateNavigationButton();

}


// ========================================
// INITIALIZE NAVIGATION
// ========================================

function initializeNavigation() {

    if (!studyTrackSidebar) {

        return;

    }


    setupSidebarLabels();


    if (isMobileScreen()) {

        document.body.classList.remove(
            'desktop-sidebar-collapsed'
        );


        setMobileMenu(false);

        return;

    }


    const savedCollapsedState =
        localStorage.getItem(
            'studytrack-sidebar-collapsed'
        );


    const collapsed =
        savedCollapsedState === 'true';


    if (collapsed) {

        document.body.classList.add(
            'desktop-sidebar-collapsed'
        );

    } else {

        document.body.classList.remove(
            'desktop-sidebar-collapsed'
        );

    }


    updateNavigationButton();

}


// ========================================
// HAMBURGER BUTTON
// ========================================

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        'click',
        function () {

            if (isMobileScreen()) {

                const currentlyOpen =
                    document.body.classList.contains(
                        'mobile-menu-open'
                    );


                setMobileMenu(
                    !currentlyOpen
                );


                return;

            }


            const currentlyCollapsed =
                document.body.classList.contains(
                    'desktop-sidebar-collapsed'
                );


            setDesktopSidebarCollapsed(
                !currentlyCollapsed
            );

        }
    );

}


// ========================================
// MOBILE OVERLAY
// ========================================

if (mobileMenuOverlay) {

    mobileMenuOverlay.addEventListener(
        'click',
        function () {

            setMobileMenu(false);

        }
    );

}


// ========================================
// SIDEBAR LINKS
// ========================================

document
    .querySelectorAll(
        '.sidebar-nav-link'
    )
    .forEach(
        function (link) {

            link.addEventListener(
                'click',
                function () {

                    if (isMobileScreen()) {

                        setMobileMenu(false);

                    }

                }
            );

        }
    );


// ========================================
// ESCAPE KEY
// ========================================

document.addEventListener(
    'keydown',
    function (event) {

        if (event.key !== 'Escape') {

            return;

        }


        if (isMobileScreen()) {

            setMobileMenu(false);

        }

    }
);


// ========================================
// WINDOW RESIZE
// ========================================

window.addEventListener(
    'resize',
    function () {

        if (isMobileScreen()) {

            document.body.classList.remove(
                'desktop-sidebar-collapsed'
            );


            setMobileMenu(false);


            return;

        }


        closeMobileMenu();


        const savedCollapsedState =
            localStorage.getItem(
                'studytrack-sidebar-collapsed'
            );


        if (
            savedCollapsedState === 'true'
        ) {

            document.body.classList.add(
                'desktop-sidebar-collapsed'
            );

        } else {

            document.body.classList.remove(
                'desktop-sidebar-collapsed'
            );

        }


        updateNavigationButton();

    }
);


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


            dayModeButton.setAttribute(
                'aria-pressed',
                'false'
            );

        }


        if (nightModeButton) {

            nightModeButton.classList.add(
                'active'
            );


            nightModeButton.setAttribute(
                'aria-pressed',
                'true'
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


            nightModeButton.setAttribute(
                'aria-pressed',
                'false'
            );

        }


        if (dayModeButton) {

            dayModeButton.classList.add(
                'active'
            );


            dayModeButton.setAttribute(
                'aria-pressed',
                'true'
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


            const goalTitleElement =
                document.getElementById(
                    'goalTitle'
                );

            const goalDescriptionElement =
                document.getElementById(
                    'goalDescription'
                );

            const goalDeadlineElement =
                document.getElementById(
                    'goalDeadline'
                );

            const goalCurrentElement =
                document.getElementById(
                    'goalCurrent'
                );

            const goalTargetElement =
                document.getElementById(
                    'goalTarget'
                );

            const goalUnitElement =
                document.getElementById(
                    'goalUnit'
                );


            if (
                !goalTitleElement ||
                !goalDescriptionElement ||
                !goalDeadlineElement ||
                !goalCurrentElement ||
                !goalTargetElement ||
                !goalUnitElement
            ) {

                console.error(
                    'One or more goal form fields are missing.'
                );

                return;

            }


            const title =
                goalTitleElement.value.trim();

            const description =
                goalDescriptionElement.value.trim();

            const deadline =
                goalDeadlineElement.value;

            const currentValue =
                goalCurrentElement.value;

            const targetValue =
                goalTargetElement.value;

            const unit =
                goalUnitElement.value.trim();


            if (!title) {

                if (goalMessage) {

                    goalMessage.textContent =
                        'Goal title is required.';

                }

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

                    if (goalMessage) {

                        goalMessage.textContent =
                            data.message ||
                            'Could not create goal.';

                    }

                    return;

                }


                if (goalMessage) {

                    goalMessage.textContent =
                        'Goal created successfully.';

                }


                goalForm.reset();


                goalCurrentElement.value =
                    0;


                goalTargetElement.value =
                    100;


                await loadGoals();


            } catch (error) {

                console.error(
                    'Create goal error:',
                    error
                );


                if (goalMessage) {

                    goalMessage.textContent =
                        'Could not connect to the server.';

                }

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

    if (!goalsContainer) {

        return;

    }


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

            const goalItem =
                document.createElement(
                    'div'
                );


            goalItem.className =
                'goal-card';


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


            const goalActions =
                document.createElement(
                    'div'
                );


            goalActions.className =
                'goal-actions';


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

initializeNavigation();

loadUser();

loadGoals();

