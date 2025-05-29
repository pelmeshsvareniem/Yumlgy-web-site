function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const confirmPassword = document.getElementById('confirmPassword').value;

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const finalResult = document.getElementById('finalResult');

    const confirmError = document.getElementById('confirmError');

    emailError.textContent = '';
    passwordError.textContent = '';
    finalResult.textContent = '';

    confirmError.textContent = '';

    let valid = true;

    if (!email.includes('@gmail.com')) {
        emailError.textContent = 'Email must contain @gmail.com';
        valid = false;
      }
    
      const lengthOK = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasDigit = /\d/.test(password);

      if (!lengthOK || !hasUpper || !hasDigit) {
        passwordError.textContent = 'The password must be at least 8 characters long and contain at least one capital Latin letter and one number.';
        valid = false;
      }

      if (valid) {
        finalResult.textContent = 'All right!';
        finalResult.className = 'Success';
        setTimeout(() => {
            window.location.href = 'index.html'; 
          }, 1000);
      } else {
        finalResult.textContent = '';
        finalResult.className = '';
      }
    }

    if (password !== confirmPassword) {
        confirmError.textContent = 'Not the same password.';
        valid = false;
      }
