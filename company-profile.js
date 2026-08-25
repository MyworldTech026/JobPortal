import { watchAuthChange, DeleteUser, logOut, reauthGoogleUserForDelete } from './sharedauthfile.js'
import { updateEmployerProfile, uploadToCloudinary, updateProfileImage, listenForUser, saveToStorage, finishAccountDeletion, deleteAllJobsByEmployer } from './sharedfirestorefile.js'
import { hamburgerIcon, signOut,showSuspendedScreen ,showToast} from './utils.js';


let USER

let userid
let userDetails
const photoPreview = document.querySelector('.js-logo-preview')
const navbarAvater = document.querySelector('.js-navbar-avatar')

const toast = document.querySelector('.js-toast');
const toastMessage = document.querySelector('.js-toast-message');

watchAuthChange(
  async (user) => {
    USER = user
    userid = user.uid
    await listenForUser(userid, (data) => {
      userDetails = data
      checkRole(userDetails)
      photoPreview.src = userDetails.companyLogoUrl
      navbarAvater.src = userDetails.companyLogoUrl
      AutofillProfile(userDetails)
    })
    //userDetails = await getUser(userid)
  },
  () => {
    console.log(`logout`)
    checkRole(`logout`)
    // console.log(userid)
    // loadMoreJobBtn.style.display = `none`
  }
)

function checkRole(userDetails) {
  if (userDetails.suspend) {
    showSuspendedScreen(logOut,userDetails.suspensionReason)
    return
  }

  if (userDetails.role === `graduate`) {
    return userDetails.role
  } else if (userDetails.role === `employer`) {
    return userDetails.role
  } else {
    window.location.href = `index.html`
  }
}


const companyname = document.querySelector('.js-company-name')
const companyWebsite = document.querySelector('.js-company-website')
const companyIndustry = document.querySelector('.js-company-industry')
const aboutCompany = document.querySelector('.js-company-about')
const contactEmail = document.querySelector('.js-company-contact-email')

const savechangeBtn = document.querySelector('.js-company-profile-save-btn')
const spinner = document.querySelector('.js-company-profile-save-spinner')
const savechangeText = document.querySelector('.js-company-profile-save-text')
const form = document.querySelector('.js-company-profile-form')



form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const companyName = companyname.value.trim()
  const companywebsite = companyWebsite.value.trim()
  const industry = companyIndustry.value.trim()
  const About = aboutCompany.value.trim()
  const email = contactEmail.value.trim()

  if (!companyName || !industry || !About) {
    showToast(toast,toastMessage,`Fill all field, excluding companywebsite`)
    return
  }

  const updateprofileDetails = {
    companyName,
    companywebsite,
    industry,
    About,
    email
  }

  loadspinner(`success`)

  setTimeout(async () => {
    try {
      await updateEmployerProfile(userid, updateprofileDetails)
      saveToStorage('companyProfile', updateprofileDetails)
      loadspinner(`done`)
    }
    catch (error) {
      console.log(error)
      loadspinner(`fail`)
      alert(`fail to update changes
             Try again `)
    }
  }, 3000);

})


function loadspinner(state) {
  if (state === `success`) {
    spinner.hidden = false
    savechangeText.textContent = `Saving Changes...`
    savechangeBtn.disabled = true
  }
  else {
    spinner.hidden = true
    savechangeText.textContent = `Save Changes `
    savechangeBtn.disabled = false
  }
}


function AutofillProfile(user) {
  let companydetails = JSON.parse(localStorage.getItem('companyprofile')) || undefined // i will be working on this later 
  //the localstorage key is companyProfile not companyprofile
  // console.log(companydetails)
  // console.log(`${companydetails.companyName} || ${user.companyName}`)
  companyname.value = `${companydetails ? `${companydetails.companyName}` : `${user.companyName}`}`
  companyWebsite.value = `${companydetails ? companydetails.companywebsite : user.companywebUrl}`
  companyIndustry.value = `${companydetails ? companydetails.industry : user.industry}`
  aboutCompany.value = `${companydetails ? companydetails.About : user.About}`
  contactEmail.value = `${companydetails ? companydetails.email : user.email}`
}



const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPE = [`image/png`, `image/jpeg`, `image/webp`]
// MEDIA PRESETS
const IMAGE_PRESET = `jobportal_images`

const photoInput = document.querySelector('.js-logo-input')


// PROFILE IMAGE UPLOAD LOGIC
photoInput.addEventListener('change', async (e) => {
  const file = photoInput.files[0]
  if (!file) return

  if (!ALLOWED_IMAGE_TYPE.includes(file.type)) {
    alert(`please upload a jpeg,png. or webp image.`)
    photoInput.value = ``
    return
  }

  if (file.size > MAX_IMAGE_SIZE) {
    alert(`image is too large. Maximum size is 3MB`)
    changePhotoBtn.value = ''
    return
  }

  try {
    const companyLogoUrl = await uploadToCloudinary(file, `image`, IMAGE_PRESET)
    console.log(companyLogoUrl)
    const role = checkRole(userDetails)
    role === `employer` ? updateProfileImage(userid, companyLogoUrl, `companyLogoUrl`) : role === `graduate` ? window.location.href = `edit-profile.html` : window.location.href = `index.html`
    photoPreview.src = companyLogoUrl
  }
  catch (error) {
    console.log(error)
    alert(`fail to upload`)
  }
})

const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)



// DELETE ACCOUNT LOGIC

const deleteAccountBtn = document.querySelector('.js-delete-account-btn')

deleteAccountBtn.addEventListener('click', () => {
  document.querySelector('.js-delete-confirm-overlay').hidden = false;
});

document.querySelector('.js-delete-confirm-cancel').addEventListener('click', () => {
  document.querySelector('.js-delete-confirm-overlay').hidden = true;
});


//CONTINUE DELETING THE ACCOUNT
const proceedBtn = document.querySelector('.js-delete-confirm-proceed')

proceedBtn.addEventListener('click', async () => {
  document.querySelector('.js-delete-confirm-overlay').hidden = true;
  const providerId = USER.providerData[0]?.providerId;

  if (providerId === 'google.com') {
    // Google users skip the password modal entirely
    try {
      await deleteAllJobsByEmployer(USER.uid)
      await reauthGoogleUserForDelete(USER)
      await finishAccountDeletion(USER);
    }
    catch (error) {
      alert(`An Error occur
            Please try again`)
      console.log(error)
    }

  } else {
    document.querySelector('.js-reauth-overlay').hidden = false;
  }
});


const confirmSpinner = document.querySelector('.js-reauth-spinner')

// confirm and delete button
document.querySelector('.js-reauth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.querySelector('.js-reauth-password-input').value;
  if (!password) return
  console.log(password)
  confirmSpinner.hidden = false
  try {
    await deleteAllJobsByEmployer(USER.uid)
    await DeleteUser(USER, password)
    document.querySelector('.js-reauth-overlay').hidden = true;
    await finishAccountDeletion(USER);
    confirmSpinner.hidden = true
  }
  catch (error) {
    document.querySelector('.js-reauth-error').textContent = "Incorrect password. Please try again.";
    document.querySelector('.js-reauth-error').style.display = 'block';
    confirmSpinner.hidden = true
  }
});

document.querySelector('.js-reauth-cancel').
  addEventListener(`click`, () => {
    document.querySelector('.js-reauth-overlay').hidden = true;
    document.querySelector('.js-reauth-password-input').value = ''
    document.querySelector('.js-reauth-error').style.display = 'none';
  })






const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)
