const signupForm = document.getElementById('signupForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('terms');
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const termsError = document.getElementById('termsError');

// Helper validation functions can be kept as before.

// Form submission
signupForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Validate your inputs here (use previous validation functions if needed).
  // Example: if (!validateFirstName()) return;

  // Prepare request body
  const userData = {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    email: emailInput.value,
    password: passwordInput.value
  };

  try {
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.success) {
      showSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      emailError.textContent = data.error || 'Signup failed!';
      emailInput.classList.add('error');
    }
  } catch (err) {
    emailError.textContent = 'Unable to connect to server';
    emailInput.classList.add('error');
  }
});

// Success message function as before.
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = 'position:fixed; top:20px; right:20px; background:#4caf50; color:#fff; padding:15px 20px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:1000;';
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 2000);
}