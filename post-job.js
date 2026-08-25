import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"

import { PostJob, getUser } from './sharedfirestorefile.js'
import { watchAuthChange, logOut } from './sharedauthfile.js'
import { hamburgerIcon, signOut, showSuspendedScreen,showToast } from './utils.js';


const postJobForm = document.querySelector('.js-post-job-form')
const jobtitle = document.querySelector('.js-job-title-input')
const joblocation = document.querySelector('.js-job-location-input')
const jobtype = document.querySelector('.js-job-type-input')
const jobcategories = document.querySelector('.js-job-category-input')
const joblevel = document.querySelector('.js-job-level-input')
const jobsalary = document.querySelector('.js-job-salary-input') //optional
const jobdescription = document.querySelector('.js-job-description-input')//required
const jobrequirement = document.querySelector('.js-job-requirements-input')
const jobT_c_checkbox = document.querySelector('.js-post-job-terms-checkbox')
const summitforReviewText = document.querySelector('.js-post-job-submit-text')
const post_job_spinner = document.querySelector('.js-post-job-spinner')
const summitforReviewBtn = document.querySelector('.js-post-job-submit-btn')



let userid;
let userDetails;

const toast = document.querySelector('.js-toast');
const toastMessage = document.querySelector('.js-toast-message');

//const username = document.querySelector('.js-user-name')
//const findJobLink=document.querySelector('.js-find-job-link')
// if(loginUsername){
//    username.textContent = userDetails.Lname
// }

watchAuthChange(
  async (user) => {
    userid = user.uid
    try {
      userDetails = await getUser(userid)
      checkRole(userDetails)
    }
    catch (error) {
       showToast(toast,toastMessage,`An error occur, Reload the page`)
    }
  },
  () => {
    checkRole(`logout`)
    console.log(`logout`)
  }
)

const employerimg = document.querySelector('.js-navbar-avatar')

function checkRole(userDetails) {
  if (userDetails.profileComplete === false) {
    const banner = document.querySelector('.js-profile-incomplete-banner');
    if (banner) banner.hidden = false;
  }

  if (userDetails.suspend) {
    showSuspendedScreen(logOut)
    return
  }

  if (userDetails.role === `graduate`) {
    window.location.href = `graduate-dashboard.html`
  } else if (userDetails.role === `employer`) {
    employerimg.src = `${userDetails.companyLogoUrl}`
    return userDetails.role
  } else {
    window.location.href = `index.html`
  }
}

// CLOSE BANNER
document.querySelector('.js-dismiss-banner-btn')?.addEventListener('click', (e) => {
  e.target.closest('.js-profile-incomplete-banner').hidden = true
})


postJobForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = jobtitle.value.trim()
  const location = joblocation.value
  const jobType = jobtype.value
  const category = jobcategories.value
  const experienceLevel = joblevel.value
  const salary = jobsalary.value.trim()
  const description = jobdescription.value.trim()
  const Jobrequirements = jobrequirement.value.trim()
  const checkbox = jobT_c_checkbox.value

  const requirements = Jobrequirements.split('\n')
  checkAndSpin('success')
  const jobDetails = {
    employerId: userDetails.uid, // links back to who posted it
    companyName: userDetails.companyName, // pulled from their profile, not re-typed
    companyLogoUrl: userDetails.companyLogoUrl, // pulled from their profile

    title,
    description,
    requirements,

    location, // matches your <select> values: remote/lagos/abuja/port-harcourt
    jobType, // full-time/part-time/internship/contract
    category, // engineering/design/marketing/sales/data/customer-support
    experienceLevel, // entry/mid/senior

    salary: salary || null, // number, or null if left blank
    salaryCurrency: "NGN",

    status: "pending", // pending / approved / rejected — always starts here
    rejectionReason: null, // filled in only if admin rejects, powers the "Why?" button

    applicantCount: 0, // incremented each time someone applies
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  try {
    const role = checkRole(userDetails)
    role === `employer` ? await PostJob(jobDetails) : window.location.href = `index.html`
    checkAndSpin('done')
    window.location.href = `employer-dashboard.html`
  }
  catch (error) {
    console.log(error)
     showToast(toast,toastMessage,`An error occur, Try again`)
    checkAndSpin('fail')
  }
})

function checkAndSpin(param) {
  if (param === 'success') {
    post_job_spinner.hidden = false
    summitforReviewText.textContent = `Submitting Job for Review...`
    summitforReviewBtn.disabled = true
  } else {
    post_job_spinner.hidden = true
    summitforReviewText.textContent = `Submit for Review`
    summitforReviewBtn.disabled = false
  }
}

const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)

const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)
