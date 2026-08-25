import { db, auth } from './config.js'
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
import { createAccount, signinWithGoggle } from './sharedauthfile.js'
import { saveUserDetails, handleGoogleSignIn } from './sharedfirestorefile.js'
import { hamburgerIcon } from './utils.js';
const selectedRole = new URLSearchParams(window.location.search).get('role')


const employerfieldElem = document.querySelector('.js-employer-fields')
const graduatefieldElem = document.querySelector('.js-graduate-fields')
const selectRoleBtn = document.querySelectorAll('.js-role-radio')


if (selectedRole === 'employer') {
  const [role1, role2] = selectRoleBtn
  role1.removeAttribute('checked')
  role2.setAttribute('checked', '')
  employerfieldElem.removeAttribute('hidden')
  graduatefieldElem.setAttribute('hidden', '')
} else {
  graduatefieldElem.removeAttribute('hidden')
  employerfieldElem.setAttribute('hidden', '')
}


// I PLAN TO USE THIS METHOD BUT FOUND OUT THAT THIS IS GOING TO BE STRESSFULL AND REQUIRE LOT OF CODE .SO I WENT FOR THE BELOW LOGIC
//const [graduateBtn, employerBtn] = selectRoleBtn
// graduateBtn.addEventListener('click',()=>{
//   console.log(`graduate`)
// })

let isRoleSelected = selectedRole || 'graduate'
selectRoleBtn.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.value === 'employer') {
      employerfieldElem.removeAttribute('hidden')
      graduatefieldElem.setAttribute('hidden', '')
      isRoleSelected = 'employer'
    } else {
      graduatefieldElem.removeAttribute('hidden')
      employerfieldElem.setAttribute('hidden', '')
      isRoleSelected = 'graduate'
    }
  })
})

//shared with both employer and graduate
const fullName = document.querySelector('.js-signup-fullname')
const Email = document.querySelector('.js-signup-email')
const Password = document.querySelector('.js-signup-password')
const ConfirmPassword = document.querySelector('.js-signup-confirm-password')
const Term_condition = document.querySelector('.js-terms-checkbox')
const createAccountSpinner = document.querySelector('.js-signup-spinner')
const createAccountText = document.querySelector('.js-signup-submit-text')
const createAccountBtn = document.querySelector('.js-signup-submit-btn')
const Form = document.querySelector('.js-signup-form')

//personalize field for graduate
const graduatePhoneNumber = document.querySelector('.js-graduate-phone')
const fieldOfStudies = document.querySelector('.js-graduate-field-of-study')

//personalize field for employer
const employerCompanyName = document.querySelector('.js-employer-company-name')
const employerWebsiteUrl = document.querySelector('.js-employer-company-website')

const generalError = document.querySelector('.js-signup-alert')
const noCompanyNameAlert = document.querySelector('.js-employer-company-name-error')
const invalidEmailAlert = document.querySelector('.js-signup-email-error')
const passwordError = document.querySelector('.js-signup-password-error')


let emailPattern = /^[^\s@]+[^\s@]+\.[^\s@]+$/
// CREATE ACCOUNT FORM
Form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const fullname = fullName.value.trim()
  const email = Email.value.trim()
  const password = Password.value.trim()
  const confirmPassword = ConfirmPassword.value.trim()
  const T_C = Term_condition
  const phone = graduatePhoneNumber.value.trim()
  const fieldOfStudy = fieldOfStudies.value.trim()
  const companyName = employerCompanyName.value.trim()
  const companywebUrl = employerWebsiteUrl.value.trim()

  const [Fname, ...rest] = fullname.split(' ')
  const Lname = rest.join(' ')

  generalError.style.display = 'none'
  noCompanyNameAlert.style.display = 'none'
  invalidEmailAlert.style.display = 'none'
  passwordError.style.display = 'none'


  let hasError = false

  if (emailPattern.test(email)) {
    invalidEmailAlert.style.display = 'block'
    invalidEmailAlert.textContent = `invalid email`
    hasError = true
  }

  if (!email) {
    invalidEmailAlert.style.display = 'block'
    invalidEmailAlert.textContent = `This field can't be blank`
    hasError = true
  }


  if (!password) {
    passwordError.style.display = 'block'
    passwordError.textContent = `password field can't be blank`
    hasError = true
  }

  if (password !== confirmPassword) {
    generalError.style.display = 'block'
    generalError.textContent = `password mismatch`
    hasError = true
  }

  if (isRoleSelected === `employer`) {
    if (!companyName) {
      noCompanyNameAlert.style.display = 'block'
      noCompanyNameAlert.textContent = `This field can't be blank`
      hasError = true
    }

  }

  if (!T_C.checked) {
    generalError.style.display = 'block'
    generalError.textContent = `you have to check the box`
    hasError = true
  }

  if (hasError) return
  checkAndSpin(`success`)

  if (isRoleSelected === 'graduate') {
    try {
      const user = await createAccount(email, password)
      const { user: { uid } } = user
      const gradCredential = {
        uid,
        Fname,
        Lname,
        email,
        phone,
        fieldOfStudy,
        role: 'graduate',
        suspend: false,
        suspensionReason: '',
        profileComplete: false,
        cvUrl: null,
        photoUrl: null,
        bio: '',
        skills: [],
        createdAt: serverTimestamp()
      }
      await saveUserDetails(uid, gradCredential)
      checkAndSpin(`done`)
      generalError.style.display = 'none'
      window.location.href = 'graduate-dashboard.html'
    }
    catch (error) {
      generalError.style.display = 'block'
      generalError.textContent =  checkTypeError(error) || `An error occur, Try again`
      checkAndSpin(`fail`)
    }
  } else {
    try {
      const user = await createAccount(email, password)
      console.log(`created`)
      const { user: { uid } } = user
      const employerCredential = {
        uid,
        Fname,
        Lname,
        email,
        About: '',
        industry: '',
        role: 'employer',
        suspend: false,
        suspensionReason: '',
        companyName,
        companywebUrl: companywebUrl || '',
        companyLogoUrl: null,
        profileComplete: false,
        isVerified: false,
        createdAt: serverTimestamp()
      }
      await saveUserDetails(uid, employerCredential)
      console.log(`data saved`)
      checkAndSpin(`done`)
      generalError.style.display = 'none'
      window.location.href = 'employer-dashboard.html'
    }
    catch (error) {
      generalError.style.display = 'block'
      generalError.textContent =  checkTypeError(error) || `An error occur, Try again`
      checkAndSpin(`fail`)
    }
  }
})


function checkTypeError(error){
   if(error.code===`auth/email-already-in-use`){
    return `This account is already in use`
   }
   return ''
}


//SPINNER
function checkAndSpin(param) {
  if (param === 'success') {
    createAccountSpinner.hidden = false
    createAccountText.textContent = `Creating Account...`
    createAccountBtn.disabled = true
  } else {
    createAccountSpinner.hidden = true
    createAccountText.textContent = `Create Account`
    createAccountBtn.disabled = false
  }
}


const signup_Google = document.querySelector('.js-google-signup-btn')
const googleSpinner = document.querySelector('.js-google-signup-spinner')


signup_Google.addEventListener('click', async () => {
  googleSpinner.hidden = false
  await handleGoogleSignIn(isRoleSelected)
})


const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)

