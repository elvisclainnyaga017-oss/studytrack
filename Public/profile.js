/* =========================================================
   STUDYTRACK - PROFILE PAGE
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const profileForm =
    document.getElementById('profileForm');

const fullNameInput =
    document.getElementById('fullName');

const emailInput =
    document.getElementById('email');

const universityInput =
    document.getElementById('university');

const courseInput =
    document.getElementById('course');

const avatarUrlInput =
    document.getElementById('avatarUrl');

const saveProfileButton =
    document.getElementById('saveProfileButton');

const resetProfileButton =
    document.getElementById('resetProfileButton');

const profileMessage =
    document.getElementById('profileMessage');

const userName =
    document.getElementById('userName');

const userEmail =
    document.getElementById('userEmail');

const logoutButton =
    document.getElementById('logoutButton');

const dayModeButton =
    document.getElementById('dayModeButton');

const nightModeButton =
    document.getElementById('nightModeButton');

const accountStatus =
    document.getElementById('accountStatus');

const accountDates =
    document.getElementById('accountDates');


/* =========================================================
   PROFILE DATA
   ========================================================= */

let originalProfile = null;


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(message, type) {

    profileMessage.textContent = message;

    profileMessage.className =
        `form-message show ${type}`;

}


function clearMessage() {

    profileMessage.textContent = '';

    profileMessage.className =
        'form-message';

}


/* =========================================================
   LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    try {

        clearMessage();

        const response =
            await fetch('/api/profile');

        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    'login.html';

                return;

            }

            throw new Error(
                data.message ||
                'Failed to load profile'
            );

        }


        if (!data.profile) {

            throw new Error(
                'Profile information was not returned'
            );

        }


        originalProfile =
            data.profile;


        displayProfile(
            data.profile
        );


    } catch (error) {

        console.error(
            'Load profile error:',
            error
        );

        showMessage(
            error.message ||
            'Unable to load profile.',
            'error'
        );

    }

}


/* =========================================================
   DISPLAY PROFILE
   ========================================================= */

function displayProfile(profile) {

    fullNameInput.value =
        profile.full_name || '';

    emailInput.value =
        profile.email || '';

    universityInput.value =
        profile.university || '';

    courseInput.value =
        profile.course || '';

    avatarUrlInput.value =
        profile.avatar_url || '';


    userName.textContent =
        profile.full_name || 'User';

    userEmail.textContent =
        profile.email || '';


    updateAccountInformation(
        profile
    );

}


/* =========================================================
   ACCOUNT INFORMATION
   ========================================================= */

function updateAccountInformation(profile) {

    accountStatus.textContent =
        'Profile information loaded';


    if (
        profile.created_at &&
        profile.updated_at
    ) {

        accountDates.textContent =
            `Profile created: ${profile.created_at} | ` +
            `Last updated: ${profile.updated_at}`;

        return;

    }


    if (profile.created_at) {

        accountDates.textContent =
            `Profile created: ${profile.created_at}`;

        return;

    }


    accountDates.textContent =
        'Your profile information is ready to use.';

}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

async function saveProfile(event) {

    event.preventDefault();

    clearMessage();


    const fullName =
        fullNameInput.value.trim();

    const university =
        universityInput.value.trim();

    const course =
        courseInput.value.trim();

    const avatarUrl =
        avatarUrlInput.value.trim();


    if (!fullName) {

        showMessage(
            'Full name is required.',
            'error'
        );

        fullNameInput.focus();

        return;

    }


    saveProfileButton.disabled =
        true;

    saveProfileButton.textContent =
        'Saving...';


    try {

        const response =
            await fetch(
                '/api/profile',
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        full_name:
                            fullName,

                        university:
                            university,

                        course:
                            course,

                        avatar_url:
                            avatarUrl
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    'login.html';

                return;

            }

            throw new Error(
                data.message ||
                'Failed to update profile'
            );

        }


        if (!data.profile) {

            throw new Error(
                'Updated profile was not returned'
            );

        }


        originalProfile =
            data.profile;


        displayProfile(
            data.profile
        );


        showMessage(
            'Profile updated successfully.',
            'success'
        );


    } catch (error) {

        console.error(
            'Save profile error:',
            error
        );

        showMessage(
            error.message ||
            'Unable to update profile.',
            'error'
        );


    } finally {

        saveProfileButton.disabled =
            false;

        saveProfileButton.textContent =
            'Save Changes';

    }

}


/* =========================================================
   RESET PROFILE
   ========================================================= */

function resetProfile() {

    clearMessage();


    if (!originalProfile) {

        loadProfile();

        return;

    }


    displayProfile(
        originalProfile
    );

}


/* =========================================================
   DAY / NIGHT MODE
   ========================================================= */

function applySavedTheme() {

    const savedTheme =
        localStorage.getItem(
            'studytrack-theme'
        );


    if (savedTheme === 'night') {

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

    const nightMode =
        document.body.classList.contains(
            'night-mode'
        );


    dayModeButton.classList.toggle(
        'active',
        !nightMode
    );

    nightModeButton.classList.toggle(
        'active',
        nightMode
    );

}


function enableDayMode() {

    document.body.classList.remove(
        'night-mode'
    );

    localStorage.setItem(
        'studytrack-theme',
        'day'
    );

    updateThemeButtons();

}


function enableNightMode() {

    document.body.classList.add(
        'night-mode'
    );

    localStorage.setItem(
        'studytrack-theme',
        'night'
    );

    updateThemeButtons();

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    try {

        const response =
            await fetch(
                '/api/logout',
                {
                    method: 'POST'
                }
            );


        if (!response.ok) {

            throw new Error(
                'Logout failed'
            );

        }


        window.location.href =
            'login.html';


    } catch (error) {

        console.error(
            'Logout error:',
            error
        );

        showMessage(
            'Unable to log out. Please try again.',
            'error'
        );

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

profileForm.addEventListener(
    'submit',
    saveProfile
);


resetProfileButton.addEventListener(
    'click',
    resetProfile
);


logoutButton.addEventListener(
    'click',
    logout
);


dayModeButton.addEventListener(
    'click',
    enableDayMode
);


nightModeButton.addEventListener(
    'click',
    enableNightMode
);


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

applySavedTheme();

loadProfile();