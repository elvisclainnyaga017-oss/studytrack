javascript
/* =========================================================
   STUDYTRACK - PROFILE PAGE
   ========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const profileForm =
    document.getElementById("profileForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const universityInput =
    document.getElementById("university");

const courseInput =
    document.getElementById("course");


/* =========================================================
   PROFILE PICTURE ELEMENTS
========================================================= */

const profilePictureInput =
    document.getElementById("avatarFile");

const profilePicturePreview =
    document.getElementById("profilePictureImage");

const profilePictureInitials =
    document.getElementById("profilePictureInitials");

const choosePictureButton =
    document.getElementById("choosePictureButton");

const removeProfilePictureButton =
    document.getElementById("removePictureButton");

const selectedImageName =
    document.getElementById("selectedPictureName");


/* =========================================================
   OTHER ELEMENTS
========================================================= */

const saveProfileButton =
    document.getElementById("saveProfileButton");

const resetProfileButton =
    document.getElementById("resetProfileButton");

const profileMessage =
    document.getElementById("profileMessage");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const logoutButton =
    document.getElementById("logoutButton");

const dayModeButton =
    document.getElementById("dayModeButton");

const nightModeButton =
    document.getElementById("nightModeButton");

const accountStatus =
    document.getElementById("accountStatus");

const accountDates =
    document.getElementById("accountDates");


/* =========================================================
   MOBILE MENU ELEMENTS
========================================================= */

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const studyTrackSidebar =
    document.getElementById("studyTrackSidebar");

const mobileMenuOverlay =
    document.getElementById("mobileMenuOverlay");


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

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent = message;

    profileMessage.className =
        `form - message show ${ type }`;
}


function clearMessage() {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent = "";

    profileMessage.className =
        "form-message";
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


    if (profilePicturePreview) {

        profilePicturePreview.src = url;

        profilePicturePreview.hidden = false;
    }


    if (profilePictureInitials) {

        profilePictureInitials.hidden = true;
    }
}


/* =========================================================
   PROFILE PICTURE LOAD SUCCESS
========================================================= */

function handleProfilePictureLoad() {

    if (profilePicturePreview) {

        profilePicturePreview.hidden = false;
    }


    if (profilePictureInitials) {

        profilePictureInitials.hidden = true;
    }
}


/* =========================================================
   PROFILE PICTURE LOAD ERROR
========================================================= */

function handleProfilePictureError() {

    if (profilePicturePreview) {

        profilePicturePreview.hidden = true;

        profilePicturePreview.removeAttribute(
            "src"
        );
    }


    if (profilePictureInitials) {

        profilePictureInitials.hidden = false;
    }


    console.warn(
        "StudyTrack could not load the profile picture."
    );
}


/* =========================================================
   CLEAR PROFILE PICTURE PREVIEW
========================================================= */

function clearProfilePicturePreview() {

    revokeTemporaryPreviewUrl();


    if (profilePicturePreview) {

        profilePicturePreview.hidden = true;

        profilePicturePreview.removeAttribute(
            "src"
        );
    }


    if (profilePictureInitials) {

        profilePictureInitials.hidden = false;
    }
}


/* =========================================================
   UPDATE PROFILE INITIALS
========================================================= */

function updateProfileInitials(name) {

    if (!profilePictureInitials) {
        return;
    }


    const cleanName =
        String(name || "User")
            .trim();


    if (!cleanName) {

        profilePictureInitials.textContent =
            "U";

        return;
    }


    const words =
        cleanName
            .split(/\s+/)
            .filter(Boolean);


    let initials = "";


    if (words.length === 1) {

        initials =
            words[0]
                .substring(0, 2)
                .toUpperCase();

    } else {

        initials =
            (
                words[0][0] +
                words[words.length - 1][0]
            ).toUpperCase();
    }


    profilePictureInitials.textContent =
        initials;
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {

    try {

        clearMessage();


        const response =
            await fetch(
                "/api/profile",
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                window.location.href =
                    "login.html";

                return;
            }


            throw new Error(
                data.message ||
                "Failed to load profile"
            );
        }


        if (!data.profile) {

            throw new Error(
                "Profile information was not returned."
            );
        }


        originalProfile =
            data.profile;


        displayProfile(
            data.profile
        );

    } catch (error) {

        console.error(
            "Load profile error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load profile.",
            "error"
        );
    }
}


/* =========================================================
   DISPLAY PROFILE
========================================================= */

function displayProfile(profile) {

    revokeTemporaryPreviewUrl();


    if (fullNameInput) {

        fullNameInput.value =
            profile.full_name || "";
    }


    if (emailInput) {

        emailInput.value =
            profile.email || "";
    }


    if (universityInput) {

        universityInput.value =
            profile.university || "";
    }


    if (courseInput) {

        courseInput.value =
            profile.course || "";
    }


    if (userName) {

        userName.textContent =
            profile.full_name || "User";
    }


    if (userEmail) {

        userEmail.textContent =
            profile.email || "";
    }


    updateProfileInitials(
        profile.full_name
    );


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


    if (profilePictureInput) {

        profilePictureInput.value =
            "";
    }


    if (selectedImageName) {

        selectedImageName.textContent =
            "";
    }


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

    if (accountStatus) {

        accountStatus.textContent =
            "Profile information loaded";
    }


    if (!accountDates) {
        return;
    }


    if (
        profile.created_at &&
        profile.updated_at
    ) {

        accountDates.textContent =
            `Profile created: ${ profile.created_at } | ` +
            `Last updated: ${ profile.updated_at }`;

        return;
    }


    if (profile.created_at) {

        accountDates.textContent =
            `Profile created: ${ profile.created_at }`;

        return;
    }


    accountDates.textContent =
        "Your profile information is ready to use.";
}


/* =========================================================
   UPDATE REMOVE BUTTON
========================================================= */

function updateRemoveButton(hasPicture) {

    if (!removeProfilePictureButton) {
        return;
    }


    const canRemove =
        hasPicture ||
        Boolean(selectedProfilePicture);


    removeProfilePictureButton.hidden =
        !canRemove;

    removeProfilePictureButton.disabled =
        !canRemove;
}


/* =========================================================
   SELECT PROFILE PICTURE
========================================================= */

function handleProfilePictureSelection() {

    if (!profilePictureInput) {
        return;
    }


    const file =
        profilePictureInput.files[0];


    if (!file) {

        selectedProfilePicture =
            null;


        if (selectedImageName) {

            selectedImageName.textContent =
                "";
        }


        updateRemoveButton(
            Boolean(
                originalProfile &&
                originalProfile.avatar_url
            )
        );


        return;
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        profilePictureInput.value =
            "";

        selectedProfilePicture =
            null;


        showMessage(
            "Please choose a JPG, PNG or WebP image.",
            "error"
        );


        return;
    }


    const maximumSize =
        5 * 1024 * 1024;


    if (file.size > maximumSize) {

        profilePictureInput.value =
            "";

        selectedProfilePicture =
            null;


        showMessage(
            "Profile picture must be 5 MB or smaller.",
            "error"
        );


        return;
    }


    selectedProfilePicture =
        file;

    profilePictureWasRemoved =
        false;


    if (selectedImageName) {

        selectedImageName.textContent =
            `Selected: ${ file.name }`;
    }


    revokeTemporaryPreviewUrl();


    temporaryPreviewUrl =
        URL.createObjectURL(file);


    showProfilePicture(
        temporaryPreviewUrl
    );


    updateRemoveButton(true);


    clearMessage();
}


/* =========================================================
   CHOOSE PROFILE PICTURE
========================================================= */

function chooseProfilePicture() {

    if (!profilePictureInput) {
        return;
    }


    profilePictureInput.click();
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
        "avatar",
        selectedProfilePicture
    );


    const response =
        await fetch(
            "/api/profile/avatar",
            {
                method: "POST",
                body: formData,
                credentials: "include"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        if (response.status === 401) {

            window.location.href =
                "login.html";

            return null;
        }


        throw new Error(
            data.message ||
            "Failed to upload profile picture."
        );
    }


    return data.avatar_url;
}


/* =========================================================
   REMOVE PROFILE PICTURE
========================================================= */

function removeProfilePicture() {

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


    if (
        !hasSavedPicture &&
        hasNewPicture
    ) {

        selectedProfilePicture =
            null;


        if (profilePictureInput) {

            profilePictureInput.value =
                "";
        }


        if (selectedImageName) {

            selectedImageName.textContent =
                "";
        }


        clearProfilePicturePreview();


        updateRemoveButton(false);


        return;
    }


    selectedProfilePicture =
        null;


    if (profilePictureInput) {

        profilePictureInput.value =
            "";
    }


    if (selectedImageName) {

        selectedImageName.textContent =
            "";
    }


    profilePictureWasRemoved =
        true;


    clearProfilePicturePreview();


    updateRemoveButton(false);


    showMessage(
        "Profile picture will be removed when you save your changes.",
        "success"
    );
}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile(event) {

    event.preventDefault();

    clearMessage();


    if (
        !fullNameInput ||
        !universityInput ||
        !courseInput
    ) {

        showMessage(
            "Profile form could not be loaded correctly.",
            "error"
        );

        return;
    }


    const fullName =
        fullNameInput.value.trim();

    const university =
        universityInput.value.trim();

    const course =
        courseInput.value.trim();


    if (!fullName) {

        showMessage(
            "Full name is required.",
            "error"
        );


        fullNameInput.focus();

        return;
    }


    if (saveProfileButton) {

        saveProfileButton.disabled =
            true;

        saveProfileButton.textContent =
            "Saving...";
    }


    if (resetProfileButton) {

        resetProfileButton.disabled =
            true;
    }


    try {

        const profileResponse =
            await fetch(
                "/api/profile",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

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
                    "login.html";

                return;
            }


            throw new Error(
                profileData.message ||
                "Failed to update profile."
            );
        }


        if (selectedProfilePicture) {

            await uploadProfilePicture();
        }


        if (profilePictureWasRemoved) {

            const removeResponse =
                await fetch(
                    "/api/profile/avatar",
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                );


            const removeData =
                await removeResponse.json();


            if (!removeResponse.ok) {

                throw new Error(
                    removeData.message ||
                    "Failed to remove profile picture."
                );
            }
        }


        const updatedResponse =
            await fetch(
                "/api/profile",
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );


        const updatedData =
            await updatedResponse.json();


        if (!updatedResponse.ok) {

            throw new Error(
                updatedData.message ||
                "Profile was saved but could not be reloaded."
            );
        }


        originalProfile =
            updatedData.profile;


        displayProfile(
            updatedData.profile
        );


        showMessage(
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Save profile error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );


    } finally {

        if (saveProfileButton) {

            saveProfileButton.disabled =
                false;

            saveProfileButton.textContent =
                "Save Changes";
        }


        if (resetProfileButton) {

            resetProfileButton.disabled =
                false;
        }
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
            "studytrack-theme"
        );


    if (savedTheme === "night") {

        document.body.classList.add(
            "night-mode"
        );

    } else {

        document.body.classList.remove(
            "night-mode"
        );
    }


    updateThemeButtons();
}


function updateThemeButtons() {

    const nightMode =
        document.body.classList.contains(
            "night-mode"
        );


    if (dayModeButton) {

        dayModeButton.classList.toggle(
            "active",
            !nightMode
        );


        dayModeButton.setAttribute(
            "aria-pressed",
            String(!nightMode)
        );
    }


    if (nightModeButton) {

        nightModeButton.classList.toggle(
            "active",
            nightMode
        );


        nightModeButton.setAttribute(
            "aria-pressed",
            String(nightMode)
        );
    }
}


function enableDayMode() {

    document.body.classList.remove(
        "night-mode"
    );


    localStorage.setItem(
        "studytrack-theme",
        "day"
    );


    updateThemeButtons();
}


function enableNightMode() {

    document.body.classList.add(
        "night-mode"
    );


    localStorage.setItem(
        "studytrack-theme",
        "night"
    );


    updateThemeButtons();
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setMobileMenu(open) {

    if (
        !mobileMenuButton ||
        !studyTrackSidebar
    ) {

        return;
    }


    studyTrackSidebar.classList.toggle(
        "mobile-menu-open",
        open
    );


    mobileMenuButton.classList.toggle(
        "menu-open",
        open
    );


    mobileMenuButton.setAttribute(
        "aria-expanded",
        String(open)
    );


    mobileMenuButton.setAttribute(
        "aria-label",
        open
            ? "Close navigation menu"
            : "Open navigation menu"
    );


    mobileMenuButton.setAttribute(
        "title",
        open
            ? "Close navigation menu"
            : "Open navigation menu"
    );


    if (mobileMenuOverlay) {

        mobileMenuOverlay.classList.toggle(
            "active",
            open
        );


        mobileMenuOverlay.setAttribute(
            "aria-hidden",
            String(!open)
        );
    }


    document.body.classList.toggle(
        "mobile-menu-active",
        open
    );
}


/* =========================================================
   MOBILE MENU EVENTS
========================================================= */

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        function () {

            const isOpen =
                mobileMenuButton.classList.contains(
                    "menu-open"
                );


            setMobileMenu(
                !isOpen
            );
        }
    );
}


if (mobileMenuOverlay) {

    mobileMenuOverlay.addEventListener(
        "click",
        function () {

            setMobileMenu(false);
        }
    );
}


document
    .querySelectorAll(".sidebar-nav-link")
    .forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    setMobileMenu(false);
                }
            );
        }
    );


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            setMobileMenu(false);
        }
    }
);


window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 720) {

            setMobileMenu(false);
        }
    }
);


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        const response =
            await fetch(
                "/api/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Logout failed"
            );
        }


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showMessage(
            "Unable to log out. Please try again.",
            "error"
        );
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        saveProfile
    );
}


if (resetProfileButton) {

    resetProfileButton.addEventListener(
        "click",
        resetProfile
    );
}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}


if (dayModeButton) {

    dayModeButton.addEventListener(
        "click",
        enableDayMode
    );
}


if (nightModeButton) {

    nightModeButton.addEventListener(
        "click",
        enableNightMode
    );
}


if (choosePictureButton) {

    choosePictureButton.addEventListener(
        "click",
        chooseProfilePicture
    );
}


if (profilePictureInput) {

    profilePictureInput.addEventListener(
        "change",
        handleProfilePictureSelection
    );
}


if (removeProfilePictureButton) {

    removeProfilePictureButton.addEventListener(
        "click",
        removeProfilePicture
    );
}


if (profilePicturePreview) {

    profilePicturePreview.addEventListener(
        "load",
        handleProfilePictureLoad
    );


    profilePicturePreview.addEventListener(
        "error",
        handleProfilePictureError
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

applySavedTheme();

loadProfile();

