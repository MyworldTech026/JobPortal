import { serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
import { getAJobDetails, getUser, getEmployer, applyForJob, checkIfAlreadyApplyForJob, updateApplicantCount } from './sharedfirestorefile.js'
import { logOut, watchAuthChange } from './sharedauthfile.js'

import { hamburgerIcon, signOut, showSuspendedScreen ,showToast} from './utils.js'


const jobId = new URLSearchParams(window.location.search).get('id')
const alreadyApplied = new URLSearchParams(window.location.search).get('ap')

let singleJob;

let userid;
let currentUser;
let title;
let companieName;
let employerdetails

const jobportalLink = document.querySelector('.js-jobportalkink')
const hidelogoutnav = document.querySelector('.js-navbar-links')
const signup_loginnav = document.querySelector('.js-navbar-signup-login')

const navLogout = document.querySelector('.js-navbar-logged-out')
const graduateNav = document.querySelector('.js-navbar-graduate')
const employerNav = document.querySelector('.js-navbar-employer')
const graduateFooter = document.querySelector('.js-forgraduate-footer')
const employerFooter = document.querySelector('.js-foremployer-footer')




watchAuthChange(
  async (user) => {
    // hidelogoutnav.hidden=true
    //  signup_loginnav.hidden=true
    userid = user.uid
    try {
      currentUser = await getUser(userid)
      checkRole(currentUser)
      singleJob = await getAJobDetails(jobId)
      employerdetails = await getEmployer(singleJob.employerId)
      title = singleJob.title
      companieName = singleJob.companyName
      displayAJobDetails(singleJob)
    }
    catch (error) {
      console.log(error)
    }
  },
  () => {
    checkRole(`logout`)
  }
)


const graduateimg=document.querySelector('.js-navbar-avatar')
const employerimg=document.querySelector('.js-navbar-avatar-employer')


function checkRole(userDetails) {
  if (userDetails.suspend) {
    showSuspendedScreen(logOut,userDetails.suspensionReason)
    return
  }

  if (userDetails.role === `graduate`) {
     graduateimg.src=`${userDetails.photoUrl}`
    jobportalLink.href = `graduate-dashboard.html`
    navLogout.style.display = 'none'
    graduateNav.style.display = 'flex'
    employerFooter.style.display = 'none'
    return userDetails.role
  } else if (userDetails.role === `employer`) {
     employerimg.src=`${userDetails.companyLogoUrl}`
    navLogout.style.display = 'none'
    employerNav.style.display = 'flex'
    jobportalLink.href = `employer-dashboard.html`
    graduateFooter.style.display = 'none'
    return userDetails.role
  } else {
    window.location.href = `index.html`
  }
}

document.querySelector('.js-dismiss-banner-btn')?.addEventListener('click', (e) => {
  e.target.closest('.js-profile-incomplete-banner').hidden = true
})

const jobTitle = document.querySelector('.js-job-title')
const companyname = document.querySelector('.js-job-company')
const joblocation = document.querySelector('.js-job-location')
const jobtype = document.querySelector('.js-job-type')
const jobcategory = document.querySelector('.js-job-category')
const joblevel = document.querySelector('.js-job-level')
const jobsalary = document.querySelector('.js-job-salary')
const jobdescription = document.querySelector('.js-job-description')
const jobrequirement = document.querySelector('.js-job-requirements')
const aboutcompany = document.querySelector('.js-job-company-about')


const skeletonFrame = document.querySelector('.js-job-details-skeleton')
const displayJobDiv = document.querySelector('.js-job-details-card')
function displayAJobDetails(singleJob) {
  skeletonFrame.hidden = true
  displayJobDiv.hidden = false
  let allReq = ''
  jobTitle.textContent = singleJob.title
  companyname.textContent = singleJob.companyName
  joblocation.textContent = singleJob.location
  jobtype.textContent = singleJob.jobType
  jobcategory.textContent = singleJob.category
  joblevel.textContent = singleJob.experienceLevel
  jobsalary.textContent = `₦${singleJob.salary} / month`
  jobdescription.textContent = singleJob.description
  aboutcompany.textContent = employerdetails.About
  const require = singleJob.requirements.forEach((req) => {
    allReq += `<li>${req}</li>`
  })
  jobrequirement.innerHTML = allReq
}

const applyNowBtn = document.querySelector('.js-apply-btn')
const modal = document.querySelector('.js-apply-modal-overlay')
const modalClose = document.querySelector('.js-apply-modal-close')
const jobtitle = document.querySelector('.js-job-Title')
const companiename = document.querySelector('.js-companyname')
const coverNote = document.querySelector('.js-apply-cover-note')
const submitBtn = document.querySelector('.js-apply-submit-btn')
const spinner = document.querySelector('.js-apply-submit-spinner')
const spinnerText = document.querySelector('.js-apply-submit-text')
const form = document.querySelector('.js-apply-form')


if (alreadyApplied) {
  applyNowBtn.hidden = true
}

const toast = document.querySelector('.js-toast');
const toastMessage = document.querySelector('.js-toast-message');



applyNowBtn.addEventListener('click', async () => {
  if (!currentUser) return
  if (currentUser.role === `employer`) {
    showToast(toast,toastMessage,`Employer can't apply to jobs- only graduate can apply`)
    return  
  }
  else {
    try {
      const isExist = await checkIfAlreadyApplyForJob(jobId, userid)
      if (isExist.exists()) {
        showToast(toast,toastMessage,`you have already applied to this job`)
        return
      } else {

        if (currentUser?.profileComplete === false) {
          const banner = document.querySelector('.js-profile-incomplete-banner');
          if (banner) banner.hidden = false;
        }
        modal.hidden = false
        jobtitle.textContent = `Apply to ${title}`
        companiename.textContent = `at ${companieName}`
      }
    }
    catch (error) {
      console.log(error)
        showToast(toast,toastMessage,`An error occur, Try again`)
    }
  }
})

modalClose.addEventListener('click', () => {
  modal.hidden = true
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const note = coverNote.value.trim()
  spinner.hidden = false
  spinnerText.textContent = `Submitting Application...`
  submitBtn.disabled = true
  const jobApplication = applicantDetails(note)
  try {
    setTimeout(async () => {
      await applyForJob(jobId, userid, jobApplication)
      await updateApplicantCount(jobId)
      modal.hidden = true
      showToast(toast,toastMessage,`you have successfully applied for this ${singleJob.title} job`)
    }, 4000)

  }
  catch (error) {
    console.log(error)
      showToast(toast,toastMessage,`An error occur, Try again`)
  }
})

function applicantDetails(note) {
  const jobApplications = {
    jobId,
    employerId: singleJob.employerId,
    graduateId: userid,

    jobTitle: title,
    companyName: companieName,
    companyLogoUrl: singleJob.companyLogoUrl,
    joblocation: singleJob.location,
    jobtype: singleJob.jobType,
    jobpostedDate: singleJob.createdAt,
    
    graduateName: `${currentUser.Fname} ${currentUser.Lname}`,
    graduatePhotoUrl: currentUser.photoUrl,
    graduateFieldOfStudy: currentUser.fieldOfStudy,
    cvUrl: currentUser.cvUrl,

    accountDeleted:false,
    coverNote: note,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  return jobApplications
}

const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)


const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)


