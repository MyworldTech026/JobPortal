import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm'
emailjs.init('qFwMk2ZhBJ-1842dX')


const contactForm = document.querySelector('.js-contact-form')
const sendBtn = document.querySelector('.js-contact-submit-btn')
const sendSpinner = document.querySelector('.js-contact-spinner')
const sendText = document.querySelector('.js-contact-submit-text')
const successAlert = document.querySelector('.js-contact-success')
const errorAlert = document.querySelector('.js-contact-error')

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = document.querySelector('.js-contact-name').value.trim()
  const email = document.querySelector('.js-contact-email').value.trim()
  const subject = document.querySelector('.js-contact-subject').value
  const message = document.querySelector('.js-contact-message').value.trim()

  const emailPacket = {
    name,
    email,
    subject,
    message
  }
  sendSpinner.hidden = false
  sendText.textContent = `Sending Message...`
  sendMail(emailPacket)
})



async function sendMail(emails) {
  const serviceId = `service_r37gscl`
  const templateId = `template_82orz36` 
  errorAlert.style.display = `none`
  sendBtn.disabled = true
  try {
    await emailjs.send(serviceId, templateId, emails)

    document.querySelector('.js-contact-name').value = ''
    document.querySelector('.js-contact-email').value = ''
    document.querySelector('.js-contact-subject').value = ''
    document.querySelector('.js-contact-message').value = ''

    successAlert.style.display = `block`
    successAlert.textContent = `message sent successfully`

    setTimeout(() => {
      successAlert.style.display = `none`
    }, 3000)
    sendBtn.disabled = false
    sendText.textContent = `Send Message`
    sendSpinner.hidden = true
  }
  catch (error) {
    console.log(error)
    errorAlert.style.display = `block`
    errorAlert.textContent = `failed to send email `
    sendBtn.disabled = false
     sendText.textContent = `Send Message`
    sendSpinner.hidden = true
  }
}