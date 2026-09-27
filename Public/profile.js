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

const profilePictureInput =
    document.getElementById('profilePictureInput');

const profilePicturePreview =
    document.getElementById('profilePicturePreview');

const profilePicturePlaceholder =
    document.getElementById('profilePicturePlaceholder');

const selectedImageName =
    document.getElementById('selectedImageName');

const removeProfilePictureButton =
    document.getElementById(
        'removeProfilePictureButton'
    );

const saveProfileButton =
    document.getElementById('saveProfileButton');

const resetProfileButton =
    document.getElementById(
        'resetProfileButton'
    );

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

let selectedProfilePicture = null;

let profilePictureWasRemoved = false;

let temporaryPreviewUrl = null;


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(message, type) {

    profileMessage.textContent =
        message;

    profileMessage.className =
        `form-message show ${type}`;

}


function clearMessage() {

    profileMessage.textContent =
        '';

    profileMessage.className =
        'form-message';

}


/* =========================================================
   TEMPORARY PREVIEW URL
   ========================================================= */

function revokeTemporaryPreviewUrl() {

    if (!temporaryPreviewUrl) {

        return;

    }

    URL.revokeObjectURL(
        temporaryPreviewUrl
    );

    temporaryPreviewUrl = null;

}


/* =========================================================
   PROFILE PICTURE PREVIEW
   ========================================================= */

function showProfilePicture(url) {

    if (!url) {

        clearProfilePicturePreview();

        return;

    }


    /*
        Set the image source first.

        The image load handler below determines
        whether the image can actually be displayed.
    */

    profilePicturePreview.hidden =
        true;

    profilePicturePlaceholder.hidden =
        true;

    profilePicturePreview.src =
        url;

}


/* =========================================================
   PROFILE PICTURE LOAD SUCCESS
   ========================================================= */

function handleProfilePictureLoad() {

    /*
        The image loaded successfully.

        Show the image and make sure the
        placeholder is hidden.
    */

    profilePicturePreview.hidden =
        false;

    profilePicturePlaceholder.hidden =
        true;

}


/* =========================================================
   PROFILE PICTURE LOAD ERROR
   ========================================================= */

function handleProfilePictureError() {

    /*
        This is important.

        If the saved image URL is broken or the
        image cannot be loaded, do NOT allow the
        browser to display the alt text.

        Instead, hide the broken image and show
        the normal placeholder.
    */

    profilePicturePreview.hidden =
        true;

    profilePicturePreview.removeAttribute(
        'src'
    );

    profilePicturePlaceholder.hidden =
        false;

    console.warn(
        'StudyTrack could not load the profile picture.'
    );

}


/* =========================================================
   CLEAR PROFILE PICTURE PREVIEW
   ========================================================= */

function clearProfilePicturePreview() {

    revokeTemporaryPreviewUrl();


    profilePicturePreview.hidden =
        true;

    profilePicturePreview.removeAttribute(
        'src'
    );


    profilePicturePlaceholder.hidden =
        false;

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

    revokeTemporaryPreviewUrl();


    fullNameInput.value =
        profile.full_name || '';

    emailInput.value =
        profile.email || '';

    universityInput.value =
        profile.university || '';

    courseInput.value =
        profile.course || '';


    userName.textContent =
        profile.full_name || 'User';

    userEmail.textContent =
        profile.email || '';


    if (profile.avatar_url) {

        showProfilePicture(
            profile.avatar_url
        );

    } else {

        clearProfilePicturePreview();

    }


    selectedProfilePicture =
        null;

    profilePictureWasRemoved =
        false;


    profilePictureInput.value =
        '';

    selectedImageName.textContent =
        '';


    updateRemoveButton(
        Boolean(profile.avatar_url)
    );


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
   UPDATE REMOVE BUTTON
   ========================================================= */

function updateRemoveButton(hasPicture) {

    removeProfilePictureButton.disabled =
        !hasPicture &&
        !selectedProfilePicture;

}


/* =========================================================
   SELECT PROFILE PICTURE
   ========================================================= */

function handleProfilePictureSelection() {

    const file =
        profilePictureInput.files[0];


    if (!file) {

        selectedProfilePicture =
            null;

        selectedImageName.textContent =
            '';

        updateRemoveButton(
            Boolean(
                originalProfile &&
                originalProfile.avatar_url
            )
        );

        return;

    }


    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        profilePictureInput.value =
            '';

        selectedProfilePicture =
            null;

        showMessage(
            'Please choose a JPG, PNG or WebP image.',
            'error'
        );

        return;

    }


    const maximumSize =
        5 * 1024 * 1024;


    if (file.size > maximumSize) {

        profilePictureInput.value =
            '';

        selectedProfilePicture =
            null;

        showMessage(
            'Profile picture must be 5 MB or smaller.',
            'error'
        );

        return;

    }


    selectedProfilePicture =
        file;

    profilePictureWasRemoved =
        false;


    selectedImageName.textContent =
        `Selected: ${file.name}`;


    /*
        Remove the old temporary preview URL
        before creating a new one.
    */

    revokeTemporaryPreviewUrl();


    temporaryPreviewUrl =
        URL.createObjectURL(file);


    showProfilePicture(
        temporaryPreviewUrl
    );


    updateRemoveButton(
        true
    );


    clearMessage();

}


/* =========================================================
   UPLOAD PROFILE PICTURE
   ========================================================= */

async function uploadProfilePicture() {

    if (!selectedProfilePicture) {

        return null;

    }


    const formData =
        new FormData();


    formData.append(
        'avatar',
        selectedProfilePicture
    );


    const response =
        await fetch(
            '/api/profile/avatar',
            {
                method: 'POST',
                body: formData
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        if (response.status === 401) {

            window.location.href =
                'login.html';

            return null;

        }


        throw new Error(
            data.message ||
            'Failed to upload profile picture'
        );

    }


    return data.avatar_url;

}


/* =========================================================
   REMOVE PROFILE PICTURE
   ========================================================= */

async function removeProfilePicture() {

    const hasSavedPicture =
        Boolean(
            originalProfile &&
            originalProfile.avatar_url
        );


    const hasNewPicture =
        Boolean(
            selectedProfilePicture
        );


    if (
        !hasSavedPicture &&
        !hasNewPicture
    ) {

        return;

    }


    /*
        If the user has only selected a new image
        and it has not been uploaded yet, simply
        cancel the selection.
    */

    if (
        !hasSavedPicture &&
        hasNewPicture
    ) {

        selectedProfilePicture =
            null;

        profilePictureInput.value =
            '';

        selectedImageName.textContent =
            '';

        clearProfilePicturePreview();

        updateRemoveButton(
            false
        );

        return;

    }


    /*
        If the picture is already saved, mark it
        for deletion. The actual deletion happens
        when the user saves the profile.
    */

    selectedProfilePicture =
        null;

    profilePictureInput.value =
        '';

    selectedImageName.textContent =
        '';

    profilePictureWasRemoved =
        true;

    clearProfilePicturePreview();

    updateRemoveButton(
        false
    );

    showMessage(
        'Profile picture will be removed when you save your changes.',
        'success'
    );

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

    resetProfileButton.disabled =
        true;

    saveProfileButton.textContent =
        'Saving...';


    try {

        /*
            First save the normal profile information.
        */

        const profileResponse =
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
                            course
                    })
                }
            );


        const profileData =
            await profileResponse.json();


        if (!profileResponse.ok) {

            if (
                profileResponse.status ===
                401
            ) {

                window.location.href =
                    'login.html';

                return;

            }


            throw new Error(
                profileData.message ||
                'Failed to update profile'
            );

        }


        /*
            If the user selected a new picture,
            upload it now.
        */

        if (selectedProfilePicture) {

            await uploadProfilePicture();

        }


        /*
            If the user asked to remove the
            existing picture, remove it now.
        */

        if (profilePictureWasRemoved) {

            const removeResponse =
                await fetch(
                    '/api/profile/avatar',
                    {
                        method: 'DELETE'
                    }
                );


            const removeData =
                await removeResponse.json();


            if (!removeResponse.ok) {

                throw new Error(
                    removeData.message ||
                    'Failed to remove profile picture'
                );

            }

        }


        /*
            Reload the profile so that the
            database values become the new
            original values.
        */

        const updatedResponse =
            await fetch(
                '/api/profile'
            );


        const updatedData =
            await updatedResponse.json();


        if (!updatedResponse.ok) {

            throw new Error(
                updatedData.message ||
                'Profile was saved but could not be reloaded'
            );

        }


        originalProfile =
            updatedData.profile;


        displayProfile(
            updatedData.profile
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

        resetProfileButton.disabled =
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


profilePictureInput.addEventListener(
    'change',
    handleProfilePictureSelection
);


removeProfilePictureButton.addEventListener(
    'click',
    removeProfilePicture
);


/*
    Detect a broken saved image.

    This prevents the browser from displaying
    "Profile picture preview" if the image URL
    cannot be loaded.
*/

profilePicturePreview.addEventListener(
    'load',
    handleProfilePictureLoad
);


profilePicturePreview.addEventListener(
    'error',
    handleProfilePictureError
);


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

applySavedTheme();

loadProfile();