import { watchAuthChange, logOut } from './sharedauthfile.js'
import { getUser, fetchJobApplications } from './sharedfirestorefile.js';
import { hamburgerIcon, signOut, showSuspendedScreen, formatDate, showToast } from './utils.js';


const myApplications=JSON.parse(sessionStorage.getItem('myApplications'))

if(myApplications){
  console.log(myApplications)
}

let userid;
let allAppliedJobs = []

const username = document.querySelector('.js-user-name')
//const findJobLink = document.querySelector('.js-find-job-link')

const toast = document.querySelector('.js-toast');
const toastMessage = document.querySelector('.js-toast-message');

watchAuthChange(
  async (user) => {
    userid = user.uid
    try {
      const userDetails = await getUser(userid)
      checkRole(userDetails)
      //loginUsername = userDetails.Lname || `Guest`
      username.textContent = userDetails.Lname || `Guest`
      //findJobLink.href=`listings.html?id=${userid}`
      fetchJobApplications(userid, (applications) => {
        allAppliedJobs = applications
        displayStat(applications)
        displayAppliedJobs(applications)
        sessionStorage.setItem('myApplications', JSON.stringify(applications))
      })
    }
    catch (error) {
      showToast(toast, toastMessage, `An error occur, Reload the page`)
    }
  },
  () => {
    checkRole(`logout`)
    console.log(`logout`)
  }
)

const graduateimg = document.querySelector('.js-navbar-avatar')
//const employerimg=document.querySelector('.js-navbar-avatar-employer')

function checkRole(userDetails) {
  if (userDetails.suspend) {
    showSuspendedScreen(logOut, userDetails.suspensionReason)
    return
  }

  if (userDetails.profileComplete === false) {
    const banner = document.querySelector('.js-profile-incomplete-banner');
    if (banner) banner.hidden = false;
  }

  if (userDetails.role === `graduate`) {
    graduateimg.src = `${userDetails.photoUrl}`
    return userDetails.role
  } else if (userDetails.role === `employer`) {
    window.location.href = `employer-dashboard.html`
  } else {
    window.location.href = `index.html`
  }
}

document.querySelector('.js-dismiss-banner-btn')?.addEventListener('click', (e) => {
  e.target.closest('.js-profile-incomplete-banner').hidden = true
})


//LOGOUT LOGIC START
const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)
// AND ENDS HERE

const totalAppliedJobs = document.querySelector('.js-stat-total')
const pendingJobs = document.querySelector('.js-stat-pending')
const approvedJobs = document.querySelector('.js-stat-accepted')
const rejectedJobs = document.querySelector('.js-stat-rejected')


function displayStat(jobs) {
  const results = jobs.reduce((accum, job) => {
    if (job.status === `pending`) {
      accum.pending.push(job)
    }
    else if (job.status === `accepted`) {
      accum.accepted.push(job)
    }
    else if (job.status === `rejected`) {
      accum.rejected.push(job)
    }
    return accum
  }, {
    pending: [],
    accepted: [],
    rejected: []
  })

  pendingJobs.textContent = results.pending.length
  approvedJobs.textContent = results.accepted.length
  rejectedJobs.textContent = results.rejected.length
  totalAppliedJobs.textContent = jobs.length
}





const appliedJobGrid = document.querySelector('.js-applications-list')
const emptyState = document.querySelector('.js-no-applications')
const skeletonFrame = document.querySelector('.js-applications-skeleton')

function displayAppliedJobs(Appliedjobs) {
  if (Appliedjobs.length === 0) {
    appliedJobGrid.innerHTML = ''
    emptyState.hidden = false
    return
  }
  emptyState.hidden = true
  let jobs = ''
  Appliedjobs.forEach((job) => {
    jobs += `
    <div class="application-row">
          <img src="https://via.placeholder.com/48" alt="" class="application-row__logo">
          <div class="application-row__info">
            <a href="job-details.html?id=${job.jobId}&ap=applied" class="application-row__title">${job.jobTitle}</a>
            <span class="application-row__company"${job.companyName}</span>
          </div>
          <span class="application-row__date">Applied ${formatDate(job.createdAt)}</span>
          <span class="status-pill status-pill--${job.status}">${job.status}</span>
        </div>
    `
  })
  appliedJobGrid.innerHTML = jobs
}

const statusFilter = document.querySelector('.js-status-filter')

statusFilter.addEventListener('change', () => {
  let status = statusFilter.value
  const filtered = allAppliedJobs.filter((job) => {
    return status === `all` ? allAppliedJobs : job.status === status
  })
  // emptyState(filtered,status)
  displayAppliedJobs(filtered)
})

const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)

// function emptyStateChecker(filter,status){
//   if(status===`pending`){
//       if(filter.length===0){

//       }else{
//          displayAppliedJobs(filter)
//       }
//   }
//   else if(status===`accept`){
//        if(filter.length===0){

//       }else{
//          displayAppliedJobs(filter)
//       }
//   }
//   else if(status===`rejected`){
//       if(filter.length===0){

//       }else{
//          displayAppliedJobs(filter)
//       }
//   }
// }

