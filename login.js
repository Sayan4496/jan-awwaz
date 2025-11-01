const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Form submission
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Perform validations here if needed

  const loginData = {
    email: emailInput.value,
    password: passwordInput.value
  };

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    const data = await res.json();
    if (data.success) {
      // Save authentication state to localStorage
      const authData = {
        isLoggedIn: true,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        userId: data.user._id || data.user.id
      };
      localStorage.setItem('civicReportAuth', JSON.stringify(authData));
      
      showSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1000);
    } else {
      passwordError.textContent = data.error || 'Login failed!';
      passwordInput.classList.add('error');
    }
  } catch (err) {
    passwordError.textContent = 'Unable to connect to server';
    passwordInput.classList.add('error');
  }
});

function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = 'position:fixed; top:20px; right:20px; background:#4caf50; color:#fff; padding:15px 20px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:1000;';
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 2000);
}