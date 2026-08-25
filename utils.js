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
