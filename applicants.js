import { getAJobDetails, getApplicants, updateApplicationStatus ,getUser} from './sharedfirestorefile.js';
import { watchAuthChange ,logOut} from './sharedauthfile.js'
import { showSuspendedScreen,formatDate ,signOut,showToast} from './utils.js';

const jobid = new URLSearchParams(window.location.search).get('id')

let userid
let allApplicants = []
let  currentUser

const jobtitle = document.querySelector('.js-job-title')
const jobmeta = document.querySelector('.js-job-meta')
const totalApplicant = document.querySelector('.applicants-header__count')

const applicantHeader=document.querySelector('.js-applicants-header')
const  applicantHeaderSkeleton=document.querySelector('.js-applicants-header-skeleton')

const toast = document.querySelector('.js-toast');
const toastMessage = document.querySelector('.js-toast-message');

watchAuthChange(
  async (user) => {
    userid = user.uid
    try {
      currentUser = await getUser(userid)
      checkrole(currentUser)
      const jobDetails = await getAJobDetails(jobid)
      applicantHeader.hidden=false
       applicantHeaderSkeleton.hidden=true
      jobtitle.textContent = jobDetails.title
      jobmeta.innerHTML = `${jobDetails.location}&middot; ${jobDetails.jobType} &middot; Posted ${formatDate(jobDetails.createdAt)}`

      const applicants = await getApplicants(jobid)
      console.log(applicants)
      totalApplicant.textContent = `${applicants.length} applicants`
      allApplicants = applicants
      displayApplicants(applicants)
    }
    catch (error) {
      console.log(error)
       showToast(toast,toastMessage,`An error occur, Try again`)
    }
  },
  () => {
    console.log(`logout`)
  }
)


const employerimg=document.querySelector('.js-navbar-avatar')

function checkrole(userDetails) {
  if (userDetails.suspend) {
    showSuspendedScreen(logOut,userDetails.suspensionReason)
    return
  }

  if (userDetails.role === `graduate`) {
     window.location.href = `graduate-dashboard.html`
  } else if (userDetails.role === `employer`) {
     employerimg.src=`${userDetails.companyLogoUrl}`
  } else {
    window.location.href = `index.html`
  }
}

const applicantsGrid = document.querySelector('.js-applicants-list')
const statusFilter = document.querySelector('.js-applicant-status-filter')

const noApplicant = document.querySelector('.js-no-applicants')

function displayApplicants(allApplicants) {
  if (allApplicants.length === 0) {
    applicantsGrid.innerHTML = ''
    noApplicant.hidden = false
    return
  }
  noApplicant.hidden = true
  //jobmeta.textContent=`Lagos, Nigeria &middot; Full-time &middot; Posted Jul 18, 2026`
  let applicant = ''
  allApplicants.forEach((applied) => {
    applicant += `
<div class="applicant-card">
        <img src="${applied.graduatePhotoUrl}" alt="" class="applicant-card__photo">

        <div class="applicant-card__info">
        <span class="applicant-card__name">${applied.accountDeleted? 'Deleted user' : applied.graduateName}</span>
          <span class="applicant-card__field">${applied.graduateFieldOfStudy} &middot; Applied ${formatDate(applied.createdAt)}</span>
          <p class="applicant-card__note">
           ${applied.coverNote}
          </p>
        </div>

        <div class="applicant-card__actions">
          <a href="${applied.cvUrl}" class="btn btn--secondary btn--sm js-view-cv-link" target="_blank">View CV</a>
          <select class="form-select js-applicant-status-select" style="width: auto;" data-applicantid="${applied.graduateId}">
           <option value="pending" ${applied.status === `pending` ? `selected` : ''}>pending</option>
           <option value="accepted"${applied.status === `accepted` ? `selected` : ''}>Accept</option>
           <option value="rejected"${applied.status === `rejected` ? `selected` : ''}>Reject</option>
          </select>
        </div>
      </div>
`
  })
  applicantsGrid.innerHTML = applicant
}

applicantsGrid.addEventListener('change', (e) => {
  const selector = e.target.closest('.js-applicant-status-select')
  const applicantId = selector.dataset.applicantid
  const status = selector.value
  updateApplicationStatus(jobid, applicantId, status)
})

statusFilter.addEventListener('change', () => {
  const status = statusFilter.value
  const filtered = allApplicants.filter((applicant) => {
    return status === `all` ? allApplicants : applicant.status === status
  })
  displayApplicants(filtered)
})


const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)
