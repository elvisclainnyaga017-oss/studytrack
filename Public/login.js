const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginButton = document.getElementById('loginButton');


// ========================================
// LOGIN FORM
// ========================================

loginForm.addEventListener('submit', async (event) => {

    // Stop the form from refreshing the page
    event.preventDefault();


    // Get the values entered by the user
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;


    // Show login status
    message.textContent = 'Logging in...';


    // Prevent multiple submissions
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';


    try {

        // Send login details to the Node.js server
        const response = await fetch('/api/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            // Allow the browser to store the login session
            credentials: 'include',

            body: JSON.stringify({
                email: email,
                password: password
            })
        });


        // Convert server response to JavaScript object
        const data = await response.json();


        // ========================================
        // SUCCESSFUL LOGIN
        // ========================================

        if (response.ok) {

            message.textContent = 'Login successful!';

            console.log('Logged-in user:', data.user);


            // Give the server a moment to establish the session
            setTimeout(() => {

                window.location.replace('/dashboard.html');

            }, 500);

        }


        // ========================================
        // LOGIN FAILED
        // ========================================

        else {

            message.textContent = data.message || 'Login failed.';

            // Allow the user to try again
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }

    }


    // ========================================
    // SERVER CONNECTION ERROR
    // ========================================

    catch (error) {

        console.error('Login error:', error);

        message.textContent =
            'Could not connect to the server. Please try again.';


        // Allow the user to try again
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }

});