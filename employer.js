import { watchAuthChange, logOut } from './sharedauthfile.js'
import { getUser, getJobsByEmployer, getApplicants, getAJobDetails } from './sharedfirestorefile.js';
import { hamburgerIcon, signOut, showSuspendedScreen, formatDate } from './utils.js';




let companyId;
let companyName;
let allJobs = []

const companyname = document.querySelector('.js-company-name')

watchAuthChange(
  async (user) => {
    companyId = user.uid
    const userDetails = await getUser(companyId)
    console.log(userDetails)
    checkRole(userDetails)

    companyName = userDetails.companyName
    companyname.textContent = companyName || 'Guest'
    getJobsByEmployer(companyId, (employerJobs) => {
      allJobs = employerJobs
      displayStat(employerJobs)
      applyFilter()
     // sessionStorage.setItem('employerJobs', JSON.stringify(employerJobs))
    })
  },
  () => {
    checkRole(`logout`)
    console.log(`logout`)
  }
)

const employerimg = document.querySelector('.js-navbar-avatar')

function checkRole(userDetails) {
  console.log(userDetails)
  if (userDetails.suspend) {
    showSuspendedScreen(logOut, userDetails.suspensionReason)
    return
  }

  if (userDetails.profileComplete === false) {
    const banner = document.querySelector('.js-profile-incomplete-banner');
    if (banner) banner.hidden = false;
  }

  if (userDetails.role === `graduate`) {
    window.location.href = `graduate-dashboard.html`
    // return userDetails.role
  } else if (userDetails.role === `employer`) {
    employerimg.src = `${userDetails.companyLogoUrl}`
    // window.location.href=`employer-dashboard.html`
    return userDetails.role
  } else {
    window.location.href = `index.html`
  }
}

document.querySelector('.js-dismiss-banner-btn')?.addEventListener('click', (e) => {
  e.target.closest('.js-profile-incomplete-banner').hidden = true
})

const jobListGrid = document.querySelector('.js-jobs-list')
const totalJob = document.querySelector('.js-stat-total-jobs')
const pendingJobs = document.querySelector('.js-stat-pending-review')
const approvedJob = document.querySelector('.js-stat-approved')
const totalApplicants = document.querySelector('.js-stat-total-applicants')


function displayStat(jobs) {
  console.log(jobs)
  const results = jobs.reduce((accum, job) => {
    if (job.status === `pending`) accum.pending.push(job)
    else if (job.status === `accepted`) accum.accepted.push(job)
    else if (job.status === `rejected`) accum.rejected.push(job)

    if (job.applicantCount !== 0) accum.totalApplicants += job.applicantCount
    return accum
  }, {
    pending: [],
    accepted: [],
    rejected: [],
    totalApplicants: 0
  })
  pendingJobs.textContent = results.pending.length
  approvedJob.textContent = results.accepted.length
  totalJob.textContent = jobs.length
  totalApplicants.textContent = results.totalApplicants
}

const noJobs = document.querySelector('.js-no-jobs')



// THIS DISPLAYS ALL THE EMPLOYER JOBS
function displayEmployerJobs(jobs) {
  if (jobs.length === 0) {
    jobListGrid.innerHTML = ''
    noJobs.hidden = false
    return
  }
  noJobs.hidden = true
  let employerjob = ''
  jobs.forEach((job) => {
    employerjob +=
      `
  <div class="job-row js-job-card">
          <div class="job-row__info">
            <span class="job-row__title">${job.title}</span>
            <span class="job-row__meta">Posted ${formatDate(job.createdAt)} &middot; ${job.location} &middot; ${job.jobType}</span>
          </div>
         ${checkStatus(job)}
        </div>
  `
  })
  jobListGrid.innerHTML = employerjob

}

// THIS CHECK STATUS OF REJECT OR ACCEPT AND DESIRED WHICH HTML TO SHOW FOR EACH CHECK
function checkStatus(job) {
  console.log(job)
  if (job.status === `rejected`) {
    return `<span class="job-row__applicants">&mdash;</span>
          <span class="status-pill status-pill--${job.status}">Rejected</span>
          <div class="job-row__actions">
            <button class="btn btn--secondary btn--sm js-view-rejection-reason-btn" data-jobid="${job.id}">Why?</button>
          </div>
          `
  } else {
    return `<span class="job-row__applicants">${job.applicantCount} applicants</span>
          <span class="status-pill status-pill--${job.status}">${job.status === `pending` ? `Pending Review` : `Approved`}</span>
          <div class="job-row__actions">
            <a href="applicants.html?id=${job.id}" class="btn btn--secondary btn--sm js-view-application-btn">View Applicants</a>
          </div>
               `
  }
}



// THE WHY A JOB IS REJECTED LOGIC
jobListGrid.addEventListener('click', async (e) => {
  const whyBtn = e.target.closest('.js-view-rejection-reason-btn');
  if (!whyBtn) return;

  const jobId = whyBtn.dataset.jobid;
  const overlay = document.querySelector('.js-rejection-reason-overlay');
  const reasonText = document.querySelector('.js-rejection-reason-text');

  reasonText.textContent = "Loading...";
  overlay.hidden = false;
  try {
    const rejectedJob = await getAJobDetails(jobId)
    const reason = rejectedJob?.rejectionReason;
    reasonText.textContent = reason || "No reason was provided.";
  }
  catch (error) {
    alert(`An error occur, Try again`)
  }
});

// close handlers
document.querySelector('.js-rejection-reason-close').addEventListener('click', () => {
  document.querySelector('.js-rejection-reason-overlay').hidden = true;
});
document.querySelector('.js-rejection-reason-close-btn').addEventListener('click', () => {
  document.querySelector('.js-rejection-reason-overlay').hidden = true;
});
// END OF CLOSE MODAL


// LOGOUT LOGIC
const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)
// END OF LOGOUT LOGIC

const statusFilter = document.querySelector('.js-status-filter')
let status = `all`

// STATUS FILTER EVENT HANDLER
statusFilter.addEventListener('change', (e) => {
  status = statusFilter.value
  applyFilter()
})


// FILTER LOGIC
function applyFilter() {
  console.log(`called`)
  let filtered = allJobs
  if (status !== `all`) {
    filtered = filtered.filter((job) => {
      return job.status === status
    })
  }
  displayEmployerJobs(filtered)
}


const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)



// const myJobs = JSON.parse(sessionStorage.getItem('employerJobs'))

// if (myJobs) {
//    allJobs=myJobs
//   displayStat(myJobs)
//   applyFilter()
// }
