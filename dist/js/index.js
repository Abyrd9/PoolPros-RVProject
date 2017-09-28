
//ALl functions related to the dealers filter
const filter = {

  // initial filter status
  filterStatus: [
    {name: 'firstInput', status: true, certifications: 'Service Pro'},
    {name: 'secondInput', status: true,  certifications: 'Installation Pro'},
    {name: 'thirdInput', status: true, certifications: 'Residential Pro'},
    {name: 'fourthInput', status: true, certifications: 'Commercial Pro'}
  ],

  // fetch dealer json data
  fetchData: (filterStatus) => {
    fetch('https://api.myjson.com/bins/lgb21')
      .then(res => {
        res.json().then(data => {
          //update the rendered cards with the correct dealers based on the filter
          filter.updateStatus(filterStatus, data)
        })
      })
  },

  //create Event Listener for filter buttons, fire off a filter status update when clicked
  filterInputEventListener: () => {
    const checkboxContainers = document.querySelectorAll('.checkbox-input-container');
    for (let i = 0; i < checkboxContainers.length; i++) {
      checkboxContainers[i].childNodes[1].addEventListener('click', (e) => {
        e.target.classList.toggle('checked')
        inputCheck = e.target.nextSibling.nextSibling.checked;
        //match the filter status array number with the array number of the filter button. Change the status to the opposite of the current.
        filter.filterStatus.forEach((element, index, array) => {
          if (index === i) {
            array[i].status = !array[i].status
          }
        })
        //fetch the json Data
        filter.fetchData(filter.filterStatus)
      })
    }
  },

  //Create event listener for the filter list toggle on the mobile screen
  mobileFilterToggleEventListener: () => {
    const filterResultsButton = document.querySelector('.filter-bar-right-button');
    filterResultsButton.addEventListener('click', (e) => {
      mobileFilter.mobileFilterToggle(e.target);
    })
  },

  updateStatus: (filterStatus, data) => {
    // set new certifications array
    certifications = [];
    // get dealers array from Json data
    dealers = data.dealers;
    // if the status of the filterStatus is true, push it into the certifications array
    filterStatus.forEach((el, i, arr) => {
      if (arr[i].status === true) {
        //remove all current items in the certifications array
        while(certifications.length < 0) {
          certifications.pop();
        }
        certifications.push(el.certifications)
      }
    })
    filter.filterCards(certifications, dealers, data)
  },

  // render cards based on filter values
  filterCards: (cert, dealers, data) => {
    const filteredDealers = {
      number: 0
    }
    // Empty the cardContainer of any current cards
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ''
    // if any value in the dealer's certifications array matches any value in the certifications array, fire off createCardElement
    dealers.forEach((e, i, arr) => {
      // set cardDate for the specific individual dealer
      const cardData = e
      // set function for comparing values between both arrays
      const isMatching = (cardDataCerts, cert) => {
        return cert.some((el) => {
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
    cardModal.modalEventListener();
  },

  //update the data on filter bar text -- far left side
  filterInfo: (number, data) => {
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
  //make sure correct certifications and icons are showing up on left side card footer
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
  //make sure correct certifications and icons are showing up on right side card footer
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

//all functions having to do with pop-up modal
const cardModal = {
  //add correct title to modal and toggle animation
  createModal: (title) => {
    const modalTitle = document.querySelector('.modal-title-two');
    modalTitle.innerHTML = title;
    const modalContainer = document.querySelector('.full-modal-container')
    const modalCard = document.querySelector('.modal-card');
    //fire off function for animating modal
    cardModal.modalAnimation(modalContainer, modalCard);
  },
  //toggle the animation for the modal -- both on and off
  modalAnimation: (modalContainer, modalCard) => {
    if (!modalContainer.classList.contains("show-modal")) {
      modalContainer.classList.toggle("show-modal");
      setTimeout(() => modalContainer.classList.toggle("reveal-modal"), 100);
      setTimeout(() => modalCard.classList.toggle("modal-card-reveal"), 200);
    } else {
      modalCard.classList.toggle("modal-card-reveal");
      setTimeout(() => modalContainer.classList.toggle("reveal-modal"), 100);
      setTimeout(() => modalContainer.classList.toggle("show-modal"), 200);
    }
  },
  //Validate that the correct values are being enetered into the modal input fields
  modalInputChange: (input, inputValue) => {
    const check = input.parentNode.childNodes[1].childNodes[3];
    if (input.id === "name") {
      if (inputValue.length >= 5 && typeof inputValue === 'string') {
        check.classList.contains('modal-checked') ? null : check.classList.add('modal-checked');
      } else if (inputValue === "" || inputValue.length < 5 || typeof inputValue !== 'string') {
        check.classList.remove('modal-checked')
      }
    } else if (input.id === "phone") {
      if (inputValue.length >= 10 && typeof inputValue !== 'NaN') {
        check.classList.contains('modal-checked') ? null : check.classList.add('modal-checked');
      } else if (inputValue === "" || inputValue.length < 10 || typeof inputValue === 'NaN') {
        check.classList.remove('modal-checked')
      }
    } else if (input.id === "email") {
      if (inputValue.length >= 5 && inputValue.includes("@" && ".com")) {
        check.classList.contains('modal-checked') ? null : check.classList.add('modal-checked');
      } else if (inputValue === "" || inputValue.length < 5 || !inputValue.includes("@" && ".com")) {
        check.classList.remove('modal-checked')
      }
    }
  },

  //Create event listener for the card buttons once they are inserted into DOM
  modalEventListener: () => {
    const cardButtons = document.querySelectorAll('.card-button');
    Array.prototype.map.call(cardButtons, (el) => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('card-button')) {
          let title = e.target.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML;
          cardModal.createModal(title)
        } else {
          let title = e.target.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML;
          cardModal.createModal(title)
        }
      })
    })
  },
  //Create event listener for the x button and send button on the pop-up modal
  deleteModalEventListener: () => {
    const exitButton = document.querySelector(".fa-modal-x");
    const sendButton = document.querySelector(".form-footer-button");
    const modalContainer = document.querySelector('.full-modal-container')
    const modalCard = document.querySelector('.modal-card');
    exitButton.addEventListener('click', () => {
      cardModal.modalAnimation(modalContainer, modalCard);
    })
    sendButton.addEventListener('click', () => {
      cardModal.modalAnimation(modalContainer, modalCard);
    })
  },
}

//all functions to do with the navigation menu on mobile
const mobileMenu = {
  //Create event listener for navigation toggling button on mobile screens
  mobileNavEventListener: () => {
    const mobileNavToggleButton = document.querySelector('.menu-toggle-button');
    mobileNavToggleButton.addEventListener('click', (e) => {
      mobileMenu.openMobileNav();
    })
  },
  //Create event listener for the exit button on the navigation on mobile screens
  mobileNavExitEventListener: (mobileNavigationContainer) => {
    const mobileNavExitButton = document.querySelector('.fa-nav-x');
    mobileNavExitButton.addEventListener('click', (e) => {
      mobileMenu.closeMobileNav(mobileNavigationContainer)
    })
  },
  //opening the mobile menu
  openMobileNav: () => {
    const mobileNavigationContainer = document.querySelector('.mobile-navigation-full-container');
    mobileNavigationContainer.classList.add('show')
    setTimeout(() => mobileNavigationContainer.classList.add('mobile-navigation-reveal'), 100);
    mobileMenu.mobileNavExitEventListener(mobileNavigationContainer);
  },
  //closing the mobile menu
  closeMobileNav: (mobileNavigationContainer) => {
    mobileNavigationContainer.classList.remove('show')
    mobileNavigationContainer.classList.remove('mobile-navigation-reveal');
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
cardModal.deleteModalEventListener();
filter.filterInputEventListener();
mobileMenu.mobileNavEventListener();
filter.mobileFilterToggleEventListener();
