import { watchAuthChange, DeleteUser, logOut, reauthGoogleUserForDelete } from './sharedauthfile.js'
import { updateProfile, getUser, uploadToCloudinary, updateProfileImage, updateGraduateCV, listenForUser, saveToStorage, finishAccountDeletion,anonymizeGraduateApplications } from './sharedfirestorefile.js'
import { hamburgerIcon, signOut ,showSuspendedScreen} from './utils.js';

let USER;

let userid
let userDetails
const photoPreview = document.querySelector('.js-photo-preview')
const navbarAvater = document.querySelector('.js-navbar-avatar')
watchAuthChange(
  async (user) => {
    USER = user
    userid = user.uid
    await listenForUser(userid, (data) => {
      userDetails = data
      checkRole(userDetails)
      photoPreview.src = userDetails.photoUrl
      navbarAvater.src = userDetails.photoUrl
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPE = [`image/png`, `image/jpeg`, `image/webp`]
// MEDIA PRESETS
const IMAGE_PRESET = `jobportal_images`
const DOCUMENT_PRESET = `jobportal_document`

const photoInput = document.querySelector('.js-photo-input')


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
    const photoUrl = await uploadToCloudinary(file, `image`, IMAGE_PRESET)
    console.log(photoUrl)
    const role = checkRole(userDetails)
    role === `graduate` ? updateProfileImage(userid, photoUrl, `photoUrl`) : role === `employer` ? window.location.href = `company-profile.html` :
      window.location.href = `index.html`
    photoPreview.src = photoUrl
  }
  catch (error) {
    console.log(error)
    alert(`fail to upload`)
  }
})

const profileName = document.querySelector('.js-profile-fullname')
const profilephone = document.querySelector('.js-profile-phone')
const profilefieldofStudy = document.querySelector('.js-profile-field-of-study')
const profileBio = document.querySelector('.js-profile-bio')
const profileSkill = document.querySelector('.js-profile-skills')
const savechangeBtn = document.querySelector('.js-profile-save-btn')
const spinner = document.querySelector('.js-profile-save-spinner')
const savechangeText = document.querySelector('.js-profile-save-text')
const form = document.querySelector('.js-profile-form')

//CV part element
const viewCurrentCV = document.querySelector('.js-cv-current')  // this only show on the ui if there is currently uploaded cv
const viewCVLink = document.querySelector('.js-cv-view-link')
const fileName = document.querySelector('.js-cv-filename')


//AUTO FILE USER DETAILS FOR EDIT
function AutofillProfile(user) {
  const graduateDetails = JSON.parse(localStorage.getItem(`graduateprofile`)) || undefined
  profileName.value = `${graduateDetails ? `${graduateDetails.Fname} ${graduateDetails.Lname}` : `${user.Fname} ${user.Lname}`}`
  profilephone.value = `${graduateDetails ? graduateDetails.phone : user.phone}`
  profilefieldofStudy.value = `${graduateDetails ? graduateDetails.fieldOfStudy : user.fieldOfStudy}`
  profileBio.value = `${graduateDetails ? graduateDetails.bio : user.bio}`
  profileSkill.value = `${graduateDetails ? graduateDetails.skills.join(',') : user.skills.join(',')}`

  if (user.cvUrl) {
    viewCurrentCV.hidden = false
    fileName.textContent = localStorage.getItem('CVNAME') || 'Resume.pdf'
    viewCVLink.href = user.cvUrl
  }

}


// COLLECT UPDATED USER DETAILS
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const [Fname, Lname] = profileName.value.trim().split(' ')
  const phone = profilephone.value.trim()
  const fieldOfStudy = profilefieldofStudy.value.trim()
  const bio = profileBio.value.trim()
  const skills = profileSkill.value.trim().split(',')

  const updateprofileDetails = {
    Fname,
    Lname,
    phone,
    fieldOfStudy,
    bio,
    skills
  }

  loadspinner(`success`)

  setTimeout(async () => {
    try {
      await updateProfile(userid, updateprofileDetails)
      saveToStorage('graduateProfile', updateprofileDetails)
      loadspinner(`done`)
    }
    catch (error) {
      console.log(error)
      loadspinner(`fail`)
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



// CV SECTION
// some element are up
const cvName = document.querySelector('.js-cv-filename')
const uploadCvBtn = document.querySelector('.js-cv-input')
const cvError = document.querySelector('.js-cv-error')

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = [
  `application/pdf`,
  `application/msword`,
  `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
]

//  UPLOADING CV LOGIC
uploadCvBtn.addEventListener('change', async () => {
  const file = uploadCvBtn.files[0]
  if (!file) return
  console.log(file.name)

  if (!ALLOWED_TYPES.includes(file.type)) {
    alert(`please upload a PDF, DOC, or DOCX — max 5MB.`)
    uploadCvBtn.value = ``
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    alert(`File is too large. Maximum size is 5MB`)
    uploadCvBtn.value = ''
    return
  }

  try {
    const cvUrl = await uploadToCloudinary(file, `raw`, DOCUMENT_PRESET)
    if (!cvUrl) return

    const role = checkRole(userDetails)
    role === `graduate` ? updateGraduateCV(userid, cvUrl) : role === `employer` ? window.location.href = `company-profile.html` :
      window.location.href = `index.html`
    viewCurrentCV.hidden = false
    fileName.textContent = file.name
    viewCVLink.href = cvUrl
    saveCvNameToStorage(file.name)
  }
  catch (error) {
    alert(`fail to upload`)
  }

})

function saveCvNameToStorage(file) {
  localStorage.setItem('CVNAME', JSON.stringify(file))
}

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
      await anonymizeGraduateApplications(USER.uid)
      await reauthGoogleUserForDelete(USER)
      await finishAccountDeletion(USER);
    }
    catch (error) {
      alert(`An Error occur
                Please try again`)
      console.log(error)
    }
    // await reauthenticateWithPopup(user, new GoogleAuthProvider());
    // await finishAccountDeletion(user);
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
  confirmSpinner.hidden = false

  try {
    await anonymizeGraduateApplications(USER.uid)
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








// async function finishAccountDeletion(user) {
//   await deleteDoc(doc(db, "users", user.uid));
//   await deleteUser(user);
//   window.location.href = "index.html";
// }


// try {
//   const credential = EmailAuthProvider.credential(user.email, password);
//   await reauthenticateWithCredential(user, credential);
//   document.querySelector('.js-reauth-overlay').hidden = true;
//   await finishAccountDeletion(user);
// } catch (error) {
//   document.querySelector('.js-reauth-error').textContent = "Incorrect password. Please try again.";
//   document.querySelector('.js-reauth-error').style.display = 'block';
// }