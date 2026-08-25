import { login,resetPassword} from "./sharedauthfile.js"
import { getUser, handleGoogleSignIn } from "./sharedfirestorefile.js"
import { hamburgerIcon } from './utils.js';

// login form related elements
const loginEmail = document.querySelector('.js-login-email')
const loginPassword = document.querySelector('.js-login-password')
const loginForm = document.querySelector('.js-login-form')
const spinner = document.querySelector('.js-login-spinner')
const loginText = document.querySelector('.js-login-submit-text')
const loginBtn = document.querySelector('.js-login-submit-btn')

const errorAlert=document.querySelector('.js-login-password-error')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = loginEmail.value.trim()
  const password = loginPassword.value.trim()

  checkAndSpin(`success`)

//auth/invalid-credential
//auth/network-request-failed
  try {
    const { user: { uid } } = await login(email, password)
    const user = await getUser(uid)
    checkUserRole(user)
  }
  catch (error) {
   if(error.code ===`auth/invalid-credential`){
     errorAlert.textContent=`Email or Password is incorrect`
   }
   else if(error.code ===`auth/network-request-failed`){
      errorAlert.textContent=`Network error, Try again`
   }
    checkAndSpin(`fail`)
  }
})

// check user role then display the right page for the user
function checkUserRole({ role }) {
  checkAndSpin(`done`)
  if (role === `graduate`) {
    window.location.href = `graduate-dashboard.html`
  } else {
    window.location.href = `employer-dashboard.html`
  }
}

// check and spin 
function checkAndSpin(param) {
  if (param === `success`) {
    spinner.hidden = false
    loginText.textContent = `Logging in...`
    loginBtn.disabled = true
  } else {
    spinner.hidden = true
    loginText.textContent = `Log in`
    loginBtn.disabled = false
  }
}


const login_Google = document.querySelector('.js-google-signin-btn')
const googleSpinner=document.querySelector('.js-google-signin-spinner')

login_Google.addEventListener('click', async () => {
   googleSpinner.hidden=false
   login_Google.disabled=true
 await handleGoogleSignIn()
})

const yesSignup=document.querySelector('.js-yes-signup')
const cancelSignup=document.querySelector('.js-no-account-cancel')
const NoAccountFoundOverlay= document.querySelector('.js-no-account-overlay')

yesSignup.addEventListener('click',()=>{
window.location.href = "signup.html";
})

cancelSignup.addEventListener('click',()=>{
    googleSpinner.hidden=true
     login_Google.disabled=false
     NoAccountFoundOverlay.hidden=true
})


// FORGOTTEN PASSWORD LOGIC
document.querySelector('.js-forgot-password-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('.js-forgot-password-overlay').hidden = false;
});

document.querySelector('.js-forgot-password-close').addEventListener('click', () => {
  document.querySelector('.js-forgot-password-overlay').hidden = true;
});



document.querySelector('.js-forgot-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('.js-forgot-password-email').value.trim();
  const spinner = document.querySelector('.js-forgot-password-spinner');
  const submitText = document.querySelector('.js-forgot-password-submit-text');
  const submitBtn = document.querySelector('.js-forgot-password-submit-btn');
  const alertBox = document.querySelector('.js-forgot-password-alert');
  const successBox = document.querySelector('.js-forgot-password-success');

  alertBox.style.display = 'none';
  successBox.style.display = 'none';
  spinner.hidden = false;
  submitText.textContent = "Sending...";
  submitBtn.disabled = true;
  
  try {
    await  resetPassword(email); 
    successBox.textContent = "Reset link sent! Check your inbox.";
    successBox.style.display = 'block';
  } catch (error) {
    alertBox.textContent = "Couldn't send reset link. Check the email and try again.";
    alertBox.style.display = 'block';
  } finally {
    spinner.hidden = true;
    submitText.textContent = "Send Reset Link";
    submitBtn.disabled = false;
  }
});


const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)

