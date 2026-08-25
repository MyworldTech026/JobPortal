import { watchAuthChange, logOut } from './sharedauthfile.js'
import { getUser, fetchAllApproveJobs } from './sharedfirestorefile.js';
import { hamburgerIcon, signOut, showSuspendedScreen, showToast } from './utils.js';

const skeletonFrame = document.querySelector('.js-skeleton-grid')
const navLogout = document.querySelector('.js-navbar-logged-out')
const graduateNav = document.querySelector('.js-navbar-graduate')
const employerNav = document.querySelector('.js-navbar-employer')
const graduateFooter = document.querySelector('.js-forgraduate-footer')
const employerFooter = document.querySelector('.js-foremployer-footer')

let userid;
let loginUsername;

let allApprovedJobs;
let maxdisplay = 5


const toast = document.querySelector('.js-toast');
const toastMessage = document.querySelector('.js-toast-message');


//const jobportallink = document.querySelector('.js-navbar__logo')

// const for_employerLink = document.querySelector('.js-for-employer')
// const set_active = document.querySelector('.for-employer-active')
// const findJobLink = document.querySelector('.js-find-job')
// const logout_nav = document.querySelector('.js-navbar__actions')
//const signup_nav = document.querySelector('.js-signup-nav')

const job_grid = document.querySelector('.js-job-grid')

//const username = document.querySelector('.js-user-name')
// if(loginUsername){
//    username.textContent = userDetails.Lname
// }
const loadMoreJobBtn = document.querySelector('.js-load-more-btn')

watchAuthChange(
  async (user) => {
    userid = user.uid
    try {
      const userDetails = await getUser(userid)
      loginUsername = userDetails
      checkUserRole(userDetails)

      fetchAllApproveJobs(maxdisplay, (approvedJob, maximum, totaljob) => {
        console.log(totaljob)
        totaljob === 5 ? loadMoreJobBtn.hidden=true : loadMoreJobBtn.style.display = `flex`
        allApprovedJobs = approvedJob
        applyFilter(`firstLoad`)
        maxdisplay += 5
      })

    }
    catch (error) {
      console.log(error)
      showToast(toast, toastMessage, `An error occur, Reload the page`)
    }
  },
  () => {
    checkUserRole(`logout`)
    loadMoreJobBtn.style.display = `none`
  }
)

const graduateimg = document.querySelector('.js-navbar-avatar')
const employerimg = document.querySelector('.js-navbar-avatar-employer')

function checkUserRole(user) {
  if (user.suspend) {
    showSuspendedScreen(logOut, user.suspensionReason)
    return
  }

  if (user.role === `graduate`) {
    graduateimg.src = `${user.photoUrl}`
    navLogout.style.display = 'none'
    graduateNav.style.display = 'flex'
    employerFooter.hidden = true
  } else if (user.role === `employer`) {
    employerimg.src = `${user.companyLogoUrl}`
    navLogout.style.display = 'none'
    employerNav.style.display = 'flex'
    graduateFooter.hidden = true
  } else {
    window.location.href = `index.html`
  }
}




loadMoreJobBtn.addEventListener('click', () => {
  fetchAllApproveJobs(maxdisplay, (approvedJob, maximum) => {
    console.log(maxdisplay)
    console.log(maximum)
    if (maximum === maxdisplay) loadMoreJobBtn.style.display = `none`
    allApprovedJobs = approvedJob
    applyFilter()
    maxdisplay += 5
  })
})

const emptyState = document.querySelector('.js-empty-state')

function displayJobs(jobs) {
  let allJobs = ''
  jobs.forEach((job) => {
    allJobs += `
   <a href="job-details.html?id=${job.id}" class="job-card">
            <div class="job-card__top">
              <div>
                <div class="job-card__title">${job.title}</div>
                <div class="job-card__company">${job.companyName}</div>
              </div>
              <img src="${job.companyLogoUrl}" alt="Acme logo" class="job-card__logo">
            </div>
            <div class="job-card__meta">
              <span class="job-card__tag">${job.location}</span>
              <span class="job-card__tag">${job.jobType}</span>
              <span class="job-card__tag">${job.experienceLevel}</span>
            </div>
            <div class="job-card__footer">
              <span class="job-card__salary">${job.salary}/mo</span>
            </div>
          </a>
   `
  })
  skeletonFrame.hidden = true
  emptyState.hidden = true
  job_grid.hidden = false
  job_grid.innerHTML = allJobs
}



let search = ''
let byLocation = `all`
let byJobType = `all`
let byCategory = `all`
let bySalary = `newest`


function applyFilter(param = undefined) {
  let filtered = allApprovedJobs

  if (bySalary === `salary-high`) {
    filtered = filtered.sort((a, b) => {
      return b.salary - a.salary
    })
  }
  else if (bySalary === `salary-low`) {
    filtered = filtered.sort((a, b) => {
      return a.salary - b.salary
    })
  }

  if (byLocation !== `all`) {
    filtered = filtered.filter((job) => {
      return job.location.toLowerCase() === byLocation
    })
  }

  if (byJobType !== `all`) {
    filtered = filtered.filter((job) => {
      return job.jobType.toLowerCase() === byJobType
    })
  }

  if (byCategory !== `all`) {
    filtered = filtered.filter((job) => {
      return job.category.toLowerCase() === byCategory
    })
  }


  if (filtered.length === 0) {
    job_grid.innerHTML = ``
    emptyStateTitle.textContent = `No jobs match your filters`
    emptyStateDesc.textContent = `Try adjusting or clearing your filters.`
    emptyState.hidden = false
    skeletonFrame.hidden = true
    loadMoreJobBtn.hidden = true
  }

  else {
    emptyState.hidden = true
    loadMoreJobBtn.style.display = `block`
    if (!param) {
      // searchResultCounts.textContent = `${filtered.length} jobs found`
    } else {
      searchResultCounts.textContent = ``
    }
    displayJobs(filtered)
  }
}

const searchResultCounts = document.querySelector('.js-results-count')
const searchBar = document.querySelector('.js-search-input')
const searchBtn = document.querySelector('.js-search-btn')
const clearAllFilter = document.querySelector('.js-clear-filters-btn')
const filterByLocation = document.querySelector('.js-filter-location')
const filterByJobType = document.querySelector('.js-filter-job-type')
const filterByCategory = document.querySelector('.js-filter-category')
const filterBySalary = document.querySelector('.js-sort-select')

const emptyStateTitle = document.querySelector('.js-empty-state-title')
const emptyStateDesc = document.querySelector('.js-empty-state-desc')

searchBtn.addEventListener('click', () => {
  search = searchBar.value.trim().toLowerCase()
  if (search === '') return
  let filtered = allApprovedJobs

  if (search !== '') {
    filtered = filtered.filter((job) => {
      return (
        job.title.toLocaleLowerCase().includes(search) ||
        job.category.toLocaleLowerCase().includes(search) ||
        job.jobType.toLocaleLowerCase().includes(search) ||
        job.experienceLevel.toLocaleLowerCase().includes(search) ||
        job.companyName.toLocaleLowerCase().includes(search) ||
        job.location.toLocaleLowerCase().includes(search) ||
        job.description.toLocaleLowerCase().includes(search) ||
        job.salary.toLocaleLowerCase().includes(search) ||
        job.requirements.some(req => req.toLocaleLowerCase().includes(search))
      )
    })
  }

  if (filtered.length === 0) {
    emptyStateTitle.textContent = `No jobs match your search`
    emptyStateDesc.textContent = `Try adjusting or clearing your search.`
    emptyState.hidden = false
    loadMoreJobBtn.style.display = `none`
    job_grid.innerHTML = ``
  }

  else {
    emptyState.hidden = true
   loadMoreJobBtn.style.display = `block`
    displayJobs(filtered)
  }


})


searchBar.addEventListener('input', (e) => {
  if (searchBar.value === '') {
    applyFilter(allApprovedJobs)
  }
})

filterByLocation.addEventListener('change', () => {
  byLocation = filterByLocation.value.toLowerCase()
  applyFilter()
})

filterByJobType.addEventListener('change', () => {
  byJobType = filterByJobType.value.toLowerCase()
  applyFilter()
})

filterByCategory.addEventListener('change', () => {
  byCategory = filterByCategory.value.toLowerCase()
  applyFilter()
})

filterBySalary.addEventListener('change', () => {
  bySalary = filterBySalary.value.toLocaleLowerCase()
  applyFilter()
})


clearAllFilter.addEventListener('click', () => {
  search = ''
  byLocation = `all`
  byJobType = `all`
  byCategory = `all`
  bySalary = `newest`
  searchBar.value = ''
  filterByLocation.selectedIndex = 0
  filterByJobType.selectedIndex = 0
  filterByCategory.selectedIndex = 0
  filterBySalary.selectedIndex = 0
  applyFilter(`firstLoad`)
})

const hamburger = document.querySelectorAll('.js-navbar-toggle')
hamburgerIcon(hamburger, `js-navbar-links`)

const logoutBtn = document.querySelectorAll('.js-logout-btn')
const logoutSpinner = document.querySelectorAll('.js-logout-spinner')
const logoutText = document.querySelectorAll('.js-logout-text')

signOut(logoutBtn, logoutSpinner, logoutText, logOut)
