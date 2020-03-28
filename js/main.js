// --------------------------
// Show/Hide add country form
// --------------------------

const addCountryButton = document.querySelector('.button-add-country');
const countryForm = document.querySelector('.country-form');

addCountryButton.addEventListener('click', toggleForm);

function toggleForm() {
  this.classList.toggle('button-add-country--active');
  countryForm.classList.toggle('country-form--active');
}