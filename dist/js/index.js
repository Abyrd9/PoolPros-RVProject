
//All function having to do with the filter
const filter = {

  // initial filter status
  filterStatus: [
    {name: 'firstInput', status: true, certifications: 'Service Pro'},
    {name: 'secondInput', status: true,  certifications: 'Installation Pro'},
    {name: 'thirdInput', status: true, certifications: 'Residential Pro'},
    {name: 'fourthInput', status: true, certifications: 'Commercial Pro'}
  ],

  // fetch json data
  fetchData: (filterStatus) => {
    fetch('https://api.myjson.com/bins/lgb21')
      .then(res => {
        res.json().then(function(data) {
          filter.updateStatus(filterStatus, data)
        })
      })
  },

  //fired from filter button events - update the filterStatus array
  updateStatus: (filterStatus, data) => {
    // set new certificantions array
    cert = [];
    // get dealers array from Json data
    dealers = data.dealers;
    // from the filter status array, take all true certifications and place them in cert array
    filterStatus.forEach(function(e, i, arr) {
      if (arr[i].status === true) {
        while(cert.length < 0) {
          cert.pop();
        }
        cert.push(e.certifications)
      }
    })
    filter.filterCards(cert, dealers, data)
  },

  // render cards based on filter values
  filterCards: (cert, dealers, data) => {
    const filteredDealers = {
      number: 0
    }
    // Empty the cardContainer of any current cards
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ''
    // if any value in the dealer certifications array matches any value in the cert array, fire off createCardElement
    dealers.forEach(function(e, i, arr) {
      // set cardDate for the specific individual dealer
      const cardData = e
      // set function for comparing values between both arrays
      const isMatching = function(cardDataCerts, cert) {
        return cert.some(function(el) {
          return cardDataCerts.indexOf(el) >= 0;
        })
      }
      // if the dealer certificates have a value from cert array, fire off createCardElement
      if (isMatching(cardData.data.certifications, cert) === true) {
        let card = document.createElement('div');
        filteredDealers.number = filteredDealers.number + 1;
        filter.createCardElement(card, cardData)
      }
    })
    filter.filterInfo(filteredDealers.number, data);
    handlers.modalEventListener();
  },

  filterInfo: function(number, data) {
    const filterTextInfo = document.querySelector('.filter-left-text');
    filterTextInfo.innerHTML = `${number} dealers in ${data.zipcode}`;
  },

  // Render card element with correct data from Json
  createCardElement: (card, cardData) => {

    //append card to the cardContainer
    card.classList.add('card');
    const cardContainer = document.querySelector('.card-container');
    cardContainer.append(card);
    // full HTML card element
    const cardElement = `
    <div class='card-title-container'>
      <h2 class='card-title'>${cardData.data.name}</h2>
    </div>
    <div class='card-content-container'>
      <div class='number-container'>
        <i class='fa fa-phone' aria-hidden='true'></i>
        <p class='number-text'>Tap to call</p>
        <p class='phone-number'>${cardData.data.phone1}</p>
      </div>
      <p class='number-sub-text'>Can’t talk now? Click below to send an email.</p>
      <button class='card-button'>
        <i class='fa fa-envelope' aria-hidden='true'></i>
        <p class='card-button-text'>Contact this Pro</p>
      </button>
      <h4 class='card-content-bottom-title'>Business Hours</h4>
      <p class='card-content-bottom-text'>Weekdays ${cardData.data.weekHours.mon}<br>Saturdays ${dataSifting.saturdayCalc(cardData)}<br>Sundays ${dataSifting.sundayCalc(cardData)}</p>
    </div>
    <div class='card-footer-container'>
      <div class='card-footer-content-left'>${cardData.data.certifications.map(cert => dataSifting.footerContentFilterLeft(cert)).join('')}</div>
      <div class='card-footer-content-right'>${cardData.data.certifications.map(cert => dataSifting.footerContentFilterRight(cert)).join('')}</div>
    </div>
    `;
    //insert HTML card template into the card
    card.innerHTML = cardElement;
  }
}

//all functions for sifting through json data
const dataSifting = {
  // make sure correct data is showing up for Sunday
  sundayCalc: (cardData) => {
    const weekHoursObj = cardData.data.weekHours;
    if (weekHoursObj.sun === '') {
      return '- CLOSED';
    } else if (weekHoursObj.sun === 'On Call') {
      return `- ${weekHoursObj.sun}`;
    } else {
      return weekHoursObj.sun
    }
  },
  //make sure correct data is showing up for Saturday
  saturdayCalc: (cardData) => {
    const weekHoursObj = cardData.data.weekHours;
    if (weekHoursObj.sat === '') {
      return '- CLOSED'
    } else {
      return weekHoursObj.sat
    }
  },
  //make sure correct certifications and icons are showing up on left side
  footerContentFilterLeft: (cert) => {
    const starIcon = `<i class='fa fa-star fa-card-icon' aria-hidden='true'></i>`
    const houseIcon = `<i class='fa fa-home fa-card-icon' aria-hidden='true'></i>`
    if (cert === 'Installation Pro') {
      let currentIcon = starIcon;
      return `<div class='footer-text-container'>${currentIcon}<p class='footer-text'>${cert}</p></div>`
    } else if (cert === 'Residential Pro') {
      let currentIcon = houseIcon;
      return `<div class='footer-text-container'>${currentIcon}<p class='footer-text'>${cert}</p></div>`
    }
  },
  //make sure correct certifications and icons are showing up on right side
  footerContentFilterRight: (cert) => {
    const cogIcon = `<i class='fa fa-cog fa-card-icon' aria-hidden='true'></i>`
    const userIcon = `<i class='fa fa-user fa-card-icon' aria-hidden='true'></i>`
    if (cert === 'Service Pro') {
      let currentIcon = cogIcon;
      return `<div class='footer-text-container'>${currentIcon}<p class='footer-text'>${cert}</p></div>`
    } else if (cert === 'Commercial Pro') {
      let currentIcon = userIcon;
      return `<div class='footer-text-container'>${currentIcon}<p class='footer-text'>${cert}</p></div>`
    }
  },
}

//all functions having to do with pop-up email modal
const cardModal = {
  //create the modal and insert into DOM
  createModal: (button) => {

    // <div class='modal-input-container'>
    //   <h3 class='input-title'>first and last name</h3>
    //   <i class='fa fa-check fa-modal-check' aria-hidden='true'></i>
    //   <input id='name' oninput='cardModal.modalInputChange(this, this.value)' type='text' placeholder='' name='name' class='modal-input'>
    // </div>

    const dealerTitle = button.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML;
    const modal = `
      <div class='modal-card'>
        <div class='modal-header-container'>
              <h4 class='modal-title-one'>email</h4>
              <h2 class='modal-title-two'>${dealerTitle}</h2>
              <i class='fa fa-times fa-modal-x' aria-hidden='true'></i>
        </div>
        <div class='modal-content-container'>
          <p class='modal-content-text'>Fill out the form below and Premium Pools & Spas of Charlotte will get in touch.</p>
          <form action='' class='modal-form-container'>
            ${}
            <div class='modal-input-container'>
              <h3 class='input-title'>comments or questions</h3>
              <p class='input-optional'>optional</p>
              <textarea id='comment' oninput='cardModal.modalInputChange(this, this.value)' rows='5' type='text' placeholder='' name='comments-questions' class='modal-input modal-textarea'></textarea>
            </div>
            <div class='modal-input-container'>
              <h3 class='input-title'>do you currently own a pool or spa?</h3>
              <p class='input-optional' id='optional-second'>optional</p>
              <input type='button' value='Yes' class='modal-input-button'>
              <input type='button' value='No' class='modal-input-button'>
              <div class='modal-button-container-mobile'>
                <input type='button' class='modal-button-mobile'>
                <p class='modal-button-text'>Yes</p>
                <input type='button' class='modal-button-mobile'>
                <p class='modal-button-text'>No</p>
              </div>
            </div>
            <div class='form-footer-container'>
              <button class='form-footer-button'>
                <p class='form-button-text'>Send my email</p>
                <i class='fa fa-chevron-right form-button-arrow' aria-hidden='true'></i>
              </button>
            </div>
          </form>
        </div>
        <div class='modal-footer-container'>
          <p class='modal-footer-text'>
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex.
          </p>
        </div>
      </div>
    `;
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('full-modal-container');
    document.body.append(modalContainer);
    modalContainer.innerHTML = modal;
    modalContainer.classList.toggle('visible');
    const modalCard = modalContainer.childNodes[1];
    //fire off function for animating modal
    cardModal.modalAnimation(modalContainer, modalCard);
    //fire off function for exiting modal
    cardModal.deleteModal(modalContainer, modalCard);
  },
  //delete the modal off the screen, either from the x button or the send email
  deleteModal: (modalContainer, modalCard) => {
    const exitButton = document.querySelector('.fa-modal-x');
    const sendButton = document.querySelector('.form-footer-button');
    exitButton.addEventListener('click', () => {
      cardModal.modalAnimation(modalContainer, modalCard)
      setTimeout(() => document.body.removeChild(modalContainer), 500)
    })
    sendButton.addEventListener('click', () => {
      cardModal.sendEmail(modalContainer, modalCard);
    })
  },
  //toggle the animation for the modal
  modalAnimation: (modalContainer, modalCard) => {
    if (modalContainer.classList.contains('show')) {
      setTimeout(() => modalCard.classList.toggle('card-reveal'), 100)
      setTimeout(() => modalContainer.classList.toggle('show'), 200)
    } else {
      setTimeout(() => modalContainer.classList.toggle('show'), 100)
      setTimeout(() => modalCard.classList.toggle('card-reveal'), 200)
    }
  },
  //Validate that the correct values are being enetered into the modal input fields
  modalInputChange: function(input, inputValue) {
    const check = input.parentNode.childNodes[1].childNodes[3];
    if (input.id === 'name') {
      if (inputValue.length >= 5 && typeof inputValue === 'string') {
        check.classList.contains('modal-checked') ? null : check.classList.add('modal-checked');
      } else if (inputValue === '' || inputValue.length < 5 || typeof inputValue !== 'string') {
        check.classList.remove('modal-checked')
      }
    } else if (input.id === 'phone') {
      if (inputValue.length >= 10 && typeof inputValue !== 'NaN') {
        check.classList.contains('modal-checked') ? null : check.classList.add('modal-checked');
      } else if (inputValue === '' || inputValue.length < 10 || typeof inputValue === 'NaN') {
        check.classList.remove('modal-checked')
      }
    } else if (input.id === 'email') {
      if (inputValue.length >= 5 && inputValue.includes('@' && '.com')) {
        check.classList.contains('modal-checked') ? null : check.classList.add('modal-checked');
      } else if (inputValue === '' || inputValue.length < 5 || !inputValue.includes('@' && '.com')) {
        check.classList.remove('modal-checked')
      }
    }
  },
  //make sure all required inputs are filled out before sending (not actually sending anything)
  sendEmail: (modalContainer, modalCard) => {
    const modalForms = document.querySelector('.modal-form-container');
    const checks = document.querySelectorAll('.modal-checked');
    if (checks.length === 3) {
      cardModal.modalAnimation(modalContainer, modalCard)
      setTimeout(() => document.body.removeChild(modalContainer), 500)
    }
  }
}

// all Event Listeners
const handlers = {
  //create Event Listener for inputs, fire-off state change when clicked
  filterInputEventListener: () => {
    //pull node list containing all checkbox input containers
    const checkboxContainers = document.querySelectorAll('.checkbox-input-container');
    for (let i = 0; i < checkboxContainers.length; i++) {
      checkboxContainers[i].childNodes[1].addEventListener('click', (e) => {
        e.target.classList.toggle('checked')
        inputCheck = e.target.nextSibling.nextSibling.checked;
        filter.filterStatus.forEach(function(element, index, array) {
          if (index === i) {
            array[i].status = !array[i].status
          }
        })
        filter.fetchData(filter.filterStatus)
      })
    }
  },
  //Create event listener for the card buttons once they are inserted into DOM
  modalEventListener: () => {
    const cardButtons = document.querySelectorAll('.card-button');
    for (let i = 0; i < cardButtons.length; i++) {
      cardButtons[i].addEventListener('click', e => {
        if (e.target.classList.contains('card-button')) {
          let button = e.target;
          cardModal.createModal(button)
        } else {
          let button = e.target.parentNode;
          cardModal.createModal(button)
        }
      })
    }
  },
  //Create event listener for navigation toggling button on mobile screens
  mobileNavEventListener: () => {
    const mobileNavToggleButton = document.querySelector('.menu-toggle-button');
    mobileNavToggleButton.addEventListener('click', (e) => {
      mobileMenu.createMobileNav();
    })
  },
  //Create event listener for the exit button on the navigation on mobile screens
  mobileNavExitEventListener: () => {
    const mobileNavExitButton = document.querySelector('.fa-nav-x');
    mobileNavExitButton.addEventListener('click', (e) => {
      const mobileNavHolder = document.querySelector('.mobile-nav-holder');
      mobileNavHolder.classList.toggle('nav-reveal');
      const mobileNav = e.target.parentNode.parentNode.parentNode.parentNode;
      setTimeout(() => document.body.removeChild(mobileNav), 300)
    })
  },
  //Create event listener for the filter list on the mobile screen
  mobileFilterToggleEventListener: () => {
    const filterResultsButton = document.querySelector('.filter-bar-right-button');
    filterResultsButton.addEventListener('click', (e) => {
      mobileFilter.mobileFilterToggle(e.target);
    })
  }

}

//all functions to do with the navigation menu on mobile
const mobileMenu = {
  //creating the mobile menu
  createMobileNav: () => {
    const mobileNav = `
      <div class='mobile-nav-container'>
        <div class='mobile-nav-header-container'>
          <div class='header-exit-button-container'>
            <i class='fa fa-times fa-nav-x' aria-hidden='true'></i>
          </div>
          <h2 class='mobile-nav-title'>menu</h2>
        </div>
        <ul class='mobile-nav-content-container'>
          <a href='#'><li class='mobile-nav'>
            <p class='mobile-nav-text'>pools & spas</p>
            <i class='fa fa-chevron-right fa-chevron-nav' aria-hidden='true'></i>
          </li></a>
          <a href='#'><li class='mobile-nav'>
            <p class='mobile-nav-text'>supplies</p>
            <i class='fa fa-chevron-right fa-chevron-nav' aria-hidden='true'></i>
          </li></a>
          <a href='#'><li class='mobile-nav'>
            <p class='mobile-nav-text'>resources</p>
            <i class='fa fa-chevron-right fa-chevron-nav' aria-hidden='true'></i>
          </li></a>
          <a href='#'><li class='mobile-nav'>
            <p class='mobile-nav-text'>services</p>
            <i class='fa fa-chevron-right fa-chevron-nav' aria-hidden='true'></i>
          </li></a>
        </ul>
      </div>
    `;
    const mobileNavHolder = document.createElement('div');
    mobileNavHolder.classList.add('mobile-nav-holder');
    document.body.append(mobileNavHolder);
    mobileNavHolder.innerHTML = mobileNav;
    const mobileNavContainer = document.querySelector('.mobile-nav-container');
    setTimeout(() => mobileNavHolder.classList.toggle('nav-reveal'), 100);
    handlers.mobileNavExitEventListener();
  }
}

// toggle the first list on mobile from the arrow button
const mobileFilter = {
  mobileFilterToggle: (target) => {
    //reavel filter container
    const filterContainer = document.querySelector('.filter-list-container');
    filterContainer.classList.toggle('filter-open');
    setTimeout(() => filterContainer.classList.toggle('filter-reveal'), 50)
    //animate the drop down arrow
    if (target.classList.contains('filter-bar-right-button')) {
      target.childNodes[1].classList.toggle('arrow-toggle');
    } else {
      target.classList.toggle('arrow-toggle');
    }
    const filterRightText = document.querySelector('.filter-right-text');
    filterRightText.classList.toggle('arrow-toggle-border');
    const filterRightButton = document.querySelector('.filter-bar-right-button');
    filterRightButton.classList.toggle('arrow-toggle-border');
  }
}

//fetch json data
filter.fetchData(filter.filterStatus);
//create event listeners
handlers.filterInputEventListener();
handlers.mobileNavEventListener();
handlers.mobileFilterToggleEventListener();
