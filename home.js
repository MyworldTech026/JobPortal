import { watchAuthChange, logOut } from './sharedauthfile.js'
import { getUser} from './sharedfirestorefile.js';
import { hamburgerIcon } from './utils.js';


watchAuthChange(
  async (user) => {
    const userDetails = await getUser(user.uid)
    checkUserRole(userDetails)
  },
  () => {
    console.log(`logout`)
    // console.log(userid)
    // loadMoreJobBtn.style.display = `none`
  }
)

function checkUserRole(user) {
   if(user.suspend===true) return
  

  if (user.role === `graduate`) {
    window.location.href=`graduate-dashboard.html`
    // for_employerLink.hidden = true
    //  logout_nav.classList.add('hidden')
  } else {
     console.log(user.role)
      window.location.href=`employer-dashboard.html`
    // findJobLink.hidden = true
    // set_active.classList.add('active')
    //  logout_nav.classList.add('hidden')
  }
}

const hamburger=document.querySelectorAll('.js-navbar-toggle')
 hamburgerIcon(hamburger,`js-navbar-links`)