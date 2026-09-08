import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm'
emailjs.init('qFwMk2ZhBJ-1842dX')


export async function sendMail(emails) {
  const serviceId = `service_r37gscl`
  const templateId = `template_82orz36`
  try {
    await emailjs.send(serviceId, templateId, emails)
  }
  catch (error) {
    //console.log(`failed to send email but order saved to database`)
  }
}


export const emailTemplate = {
  jobSubmitted: (employerEmail, job_title, companyName) => ({
    reply_to: `muhammedzulikaneni2004@gmail.com`,
    logo_url: ``,
    company_name: 'JobPortal',
    email: employerEmail,
    subject: `Your job posting is under review — ${job_title}`,
    email_body: `Hi ${companyName}
          Thanks for posting "${job_title}" on JobPortal.
          Your listing is now being reviewed by our team. 
          This usually takes less than 24 hours. Once approved, it'll go live on our Job Listings page and graduates will be able to apply.
          We'll email you again as soon as it's approved.

        — The JobPortal Team`
  }),

  jobApproved: (companyName, job_title) => ({
    reply_to: `muhammedzulikaneni2004@gmail.com`,
    logo_url: ``,
    company_name: 'JobPortal',
    subject: `Your job is now live— ${job_title}`,
    email_body: `Hi ${companyName},
             Good news — "${job_title}" has been approved and is now live on JobPortal.
             Graduates can now view and apply to your listing.
             You'll be notified as applications come in, and you can review candidates anytime from your Employer Dashboard.
             View your listing:  <a href="https://job-portal-gamma-swart.vercel.app/index.html">jobportal</a>

           — The JobPortal Team
`
  }),

  applicationApproved: (graduateName, job_title, companyName, companyLogo, employerEmail,graduateEmail) => ({
    reply_to: employerEmail,
    logo_url: companyLogo,
    email:graduateEmail,
    alt: companyName,
    company_name: companyName,
    subject: `Great news ${companyName} accepted your application!`,
    email_body: `Hi ${graduateName},
           ${companyName} has accepted your application for "${job_title}".
             They may reach out to you directly for next steps. In the meantime, 
             you can view this update anytime from your JobPortal dashboard.
             View your application: https://job-portal-gamma-swart.vercel.app/graduate-dashboard.html
             Congratulations, and good luck!

           — The JobPortal Team`
  }),

  applicationRejected: (graduateName, job_title, companyName, companyLogo, employerEmail,graduateEmail) => ({
    reply_to: employerEmail,
    logo_url: companyLogo,
    email:graduateEmail,
    alt: companyName,
    company_name: companyName,
    subject: `Update on your application to ${companyName}`,
    email_body: `Hi ${graduateName},
              Thank you for applying to "${job_title}" at ${companyName}.
              After reviewing your application, they've decided to move forward with other candidates for this role.
              Don't be discouraged — new opportunities are posted regularly.
              Browse more jobs: https://job-portal-gamma-swart.vercel.app/listings.html  

            — The JobPortal Team
`
  })
}


export function hamburgerIcon(hamburger, links) {
  hamburger.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const link = toggle.closest('.navbar').querySelector(`.${links}`)
      link.classList.toggle('navbar__links--open')
    })
  })

}

  // console.log(logoutBtn)
  //     console.log(logoutSpinner)
  //     console.log(logoutText)
  //     console.log(i)

export function signOut(logoutBtn, logoutSpinner, logoutText, logOut) {
  logoutBtn.forEach((logout,i) => {
    logout.addEventListener('click', async () => {
      try {
        logoutSpinner[i].hidden = false
        logoutText[i].textContent = `Logging Out...`
        logoutBtn[i].disabled = true
        setTimeout(async () => {
          await logOut()
          window.location.href = `index.html`
        }, 5000)
      }
      catch (error) {
        console.log(error)
         logoutBtn[i].disabled = false
      }
    })
  })
}

export function showSuspendedScreen(logOut, reason) {
  const html = `
    <div class="modal-overlay js-suspended-overlay">
      <div class="modal modal--danger">
        <div class="modal__icon">🚫</div>
        <h2 class="modal__title">Your account has been suspended</h2>
        <p class="modal__subtitle">
          ${reason ? reason : "This account has been suspended and can no longer access JobPortal."}
        </p>
        <p class="form-hint">Redirecting you to the homepage in <span class="js-suspended-countdown">5</span> seconds...</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  let secondsLeft = 5;
  const countdownEl = document.querySelector('.js-suspended-countdown');

  const interval = setInterval(async () => {
    secondsLeft--;
    countdownEl.textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(interval);
      try {
        await logOut()
        //window.location.href = "index.html";
      }
      catch (error) {
        console.log(error)
      }
      finally {
        window.location.href = "index.html";
      }

    }
  }, 1000);
}


export function formatDate(date) {
 // console.log(date.toDate())
  return date.toDate().toLocaleDateString('en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  )
}

export function showToast(toast,toastMessageElem,message) {
  
  toastMessageElem.textContent = message;
  toast.hidden = false;

  // small delay so the "hidden -> visible" transition actually animates
  requestAnimationFrame(() => {
    toast.classList.add('toast--visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => { toast.hidden = true; }, 350); // wait for slide-up animation to finish
  },  3500);
}
