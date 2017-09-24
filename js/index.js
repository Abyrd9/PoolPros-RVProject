const filter = {

  // initial filter status
  filterStatus: [
    {name: "firstInput", status: true, certifications: "Service Pro"},
    {name: "secondInput", status: true,  certifications: "Installation Pro"},
    {name: "thirdInput", status: true, certifications: "Residential Pro"},
    {name: "fourthInput", status: true, certifications: "Commercial Pro"}
  ],

  // fetch json data
  fetchData: (filterStatus) => {
    fetch('https://api.myjson.com/bins/lgb21')
      .then(res => {
        res.json().then(function(data) {
          var data = data;
          filter.updateStatus(filterStatus, data)
        })
      })
  },

  // fire from handlers - update the filterStatus array
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
    // fire off filterCards
    filter.filterCards(cert, dealers, data)
  },

  // render cards based on filter values
  filterCards: (cert, dealers, data) => {
    // Create
    const filteredDealers = {
      number: 0
    }
    // Empty the cardContainer of any current cards
    var cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = ""
    // if any value in the dealer certifications array matches any value in the cert array, fire off createCardElement
    dealers.forEach(function(e, i, arr) {
      // set cardDate for the specific individual dealer
      var cardData = e
      // set function for comparing values between both arrays
      var isMatching = function(cardDataCerts, cert) {
        return cert.some(function(el) {
          return cardDataCerts.indexOf(el) >= 0;
        })
      }
      // if the dealer certificates have a value from cert array, fire off createCardElement
      if (isMatching(cardData.data.certifications, cert) === true) {
        var card = document.createElement('div');
        filteredDealers.number = filteredDealers.number + 1;
        filter.createCardElement(card, cardData)
      } else {
        console.log("filtered out")
      }
    })
    filter.filterInfo(filteredDealers.number, data);
    cardModal.modalEventListener();
  },

  filterInfo: function(number, data) {
    const filterTextInfo = document.querySelector(".filter-left-text");
    filterTextInfo.innerHTML = `${number} dealers in ${data.zipcode}`;
  },

  // Render card element with correct data from Json
  createCardElement: (card, cardData) => {
    //append card to the cardContainer
    card.classList.add("card");
    var cardContainer = document.querySelector(".card-container");
    cardContainer.append(card);
    // full HTML card element
    var cardElement = `
    <div class="card-title-container">
      <h2 class="card-title">${cardData.data.name}</h2>
    </div>
    <div class="card-content-container">
      <div class="card-content-top">
        <div class="number-container">
          <i class="fa fa-phone" aria-hidden="true"></i>
          <p class="number-text">Tap to call</p>
          <p class="phone-number">${cardData.data.phone1}</p>
        </div>
        <p class="number-sub-text">Can’t talk now? Click below to send an email.</p>
      </div>
      <div class="card-content-middle">
        <button class="card-button">
          <i class="fa fa-envelope" aria-hidden="true"></i>
          <p class="card-button-text">Contact this Pro</p>
        </button>
      </div>
      <div class="card-content-bottom">
        <h4 class="card-content-bottom-title">Business Hours</h4>
        <p class="card-content-bottom-text">Weekdays ${cardData.data.weekHours.mon}<br>Saturdays ${dataSifting.saturdayCalc(cardData)}<br>Sundays ${dataSifting.sundayCalc(cardData)}</p>
      </div>
    </div>
    <div class="card-footer-container">
      <div class="card-footer-content-container">
        <div class="card-footer-content-left">${cardData.data.certifications.map(cert => dataSifting.footerContentFilterLeft(cert)).join('')}</div>
        <div class="card-footer-content-right">${cardData.data.certifications.map(cert => dataSifting.footerContentFilterRight(cert)).join('')}</div>
      </div>
    </div>
    `;
    //insert HTML card template into the card
    card.innerHTML = cardElement;
    console.log(card);
  }
}

var dataSifting = {
  sundayCalc: (cardData) => {
    var weekHoursObj = cardData.data.weekHours;
    if (weekHoursObj.sun === "") {
      return "- CLOSED";
    } else if (weekHoursObj.sun === "On Call") {
      return `- ${weekHoursObj.sun}`;
    } else {
      return weekHoursObj.sun
    }
  },
  saturdayCalc: (cardData) => {
    var weekHoursObj = cardData.data.weekHours;
    if (weekHoursObj.sat === "") {
      return "- CLOSED"
    } else {
      return weekHoursObj.sat
    }
  },
  footerContentFilterLeft: (cert) => {
    console.log(cert)
    const starIcon = `<i class="fa fa-star fa-card-icon" aria-hidden="true"></i>`
    const houseIcon = `<i class="fa fa-home fa-card-icon" aria-hidden="true"></i>`
    if (cert === "Installation Pro") {
      var currentIcon = starIcon;
      return `<div class="footer-text-container">${currentIcon}<p class="footer-text">${cert}</p></div>`
    } else if (cert === "Residential Pro") {
      var currentIcon = houseIcon;
      return `<div class="footer-text-container">${currentIcon}<p class="footer-text">${cert}</p></div>`
    }
  },
  footerContentFilterRight: (cert) => {
    console.log(cert)
    const cogIcon = `<i class="fa fa-cog fa-card-icon" aria-hidden="true"></i>`
    const userIcon = `<i class="fa fa-user fa-card-icon" aria-hidden="true"></i>`
    if (cert === "Service Pro") {
      var currentIcon = cogIcon;
      return `<div class="footer-text-container">${currentIcon}<p class="footer-text">${cert}</p></div>`
    } else if (cert === "Commercial Pro") {
      var currentIcon = userIcon;
      return `<div class="footer-text-container">${currentIcon}<p class="footer-text">${cert}</p></div>`
    }
  },
}

const cardModal = {
  modalEventListener: () => {
    const cardButtons = document.querySelectorAll(".card-button");
    for (let i = 0; i < cardButtons.length; i++) {
      cardButtons[i].addEventListener('click', e => {
        if (e.target.classList.contains("card-button")) {
          let button = e.target;
          cardModal.createModal(button)
        } else {
          let button = e.target.parentNode;
          cardModal.createModal(button)
        }
      })
    }
  },
  createModal: (button) => {
    const dealerTitle = button.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].innerHTML;
    const modal = `
      <div class="modal-card">
        <div class="modal-header-container">
          <div class="modal-header-content-container">
            <div class="modal-header-left-container">
              <h4 class="modal-title-one">email</h4>
              <h2 class="modal-title-two">${dealerTitle}</h2>
            </div>
            <div class="modal-header-right-container">
              <i class="fa fa-times fa-modal-x" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <div class="modal-content-container">
          <p class="modal-content-text">Fill out the form below and Premium Pools & Spas of Charlotte will get in touch.</p>
          <form action="" class="modal-form-container">
            <div class="modal-input-container">
              <div class="input-title-container">
                <h3 class="input-title">first and last name</h3>
                <i class="fa fa-check fa-modal-check" aria-hidden="true"></i>
              </div>
              <input oninput="cardModal.modalInputChange(this, this.value)" type="text" placeholder="" name="name" class="modal-input">
            </div>
            <div class="modal-input-container phone-number">
              <div class="input-title-container">
                <h3 class="input-title">phone number</h3>
                <i class="fa fa-check fa-modal-check" aria-hidden="true"></i>
              </div>
              <input oninput="cardModal.modalInputChange(this, this.value)" type="tel" placeholder="" name="phone-number" class="modal-input">
            </div>
            <div class="modal-input-container">
              <div class="input-title-container">
                <h3 class="input-title">email address</h3>
                <i class="fa fa-check fa-modal-check" aria-hidden="true"></i>
              </div>
              <input oninput="cardModal.modalInputChange(this, this.value)" type="text" placeholder="" name="email" class="modal-input">
            </div>
            <div class="modal-input-container">
              <div class="input-title-container">
                <h3 class="input-title">comments or questions</h3>
                <p class="input-optional">optional</p>
              </div>
              <textarea oninput="cardModal.modalInputChange(this, this.value)" rows="5" type="text" placeholder="" name="comments-questions" class="modal-input modal-textarea"></textarea>
            </div>
            <div class="modal-input-container">
              <div class="input-title-container">
                <h3 class="input-title">do you currently own a pool or spa?</h3>
                <p class="input-optional">optional</p>
              </div>
              <div class="modal-button-container">
                <input type="button" value="Yes" class="modal-input-button">
                <input type="button" value="No" class="modal-input-button">
              </div>
            </div>
            <div class="form-footer-container">
              <button class="form-footer-button">
                <p class="form-button-text">Send my email</p>
                <i class="fa fa-chevron-right form-button-arrow" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </div>
        <div class="modal-footer-container">
          <p class="modal-footer-text">
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex.
          </p>
        </div>
      </div>
    `;
    //modal animation
    const modalContainer = document.createElement("div");
    modalContainer.classList.add("full-modal-container");
    document.body.append(modalContainer);
    modalContainer.innerHTML = modal;
    modalContainer.classList.toggle("visible");
    const modalCard = modalContainer.childNodes[1];
    //fire off function for animating modal
    cardModal.modalAnimation(modalContainer, modalCard);
    //fire off function for exiting modal
    cardModal.deleteModal(modalContainer, modalCard);
  },
  deleteModal: (modalContainer, modalCard) => {
    const exitButton = document.querySelector(".fa-modal-x");
    const sendButton = document.querySelector(".form-footer-button");
    exitButton.addEventListener('click', () => {
      cardModal.modalAnimation(modalContainer, modalCard)
      setTimeout(() => document.body.removeChild(modalContainer), 500)
    })
    sendButton.addEventListener('click', () => {
      cardModal.modalAnimation(modalContainer, modalCard)
      setTimeout(() => document.body.removeChild(modalContainer), 500)
    })
  },
  modalAnimation: (modalContainer, modalCard) => {
    if (modalContainer.classList.contains("show")) {
      setTimeout(() => modalCard.classList.toggle("card-reveal"), 100)
      setTimeout(() => modalContainer.classList.toggle("show"), 200)
    } else {
      setTimeout(() => modalContainer.classList.toggle("show"), 100)
      setTimeout(() => modalCard.classList.toggle("card-reveal"), 200)
    }
  },
  modalInputChange: function(input, inputValue) {
    const check = input.parentNode.childNodes[1].childNodes[3];
    if (inputValue !== "") {
      check.classList.contains('modal-checked') ? null : check.classList.toggle('modal-checked');
    } else {
      check.classList.toggle('modal-checked')
    }
  }
}


const handlers = {

  //create Event Listener for inputs, fire-off state change when clicked
  filterInputEventListener: () => {
    //pull node list containing all checkbox input containers
    var checkboxContainers = document.querySelectorAll(".checkbox-input-container");
    for (let i = 0; i < checkboxContainers.length; i++) {
      checkboxContainers[i].childNodes[1].addEventListener('click', (e) => {
        e.target.classList.toggle("checked")
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
  mobileNavEventListener: () => {
    const mobileNavToggleButton = document.querySelector(".menu-toggle-button");
    mobileNavToggleButton.addEventListener('click', (e) => {
      mobileMenu.createMobileNav();
    })
  },
  mobileNavExitEventListener: () => {
    const mobileNavExitButton = document.querySelector('.fa-nav-x');
    mobileNavExitButton.addEventListener('click', (e) => {
      const mobileNavHolder = document.querySelector('.mobile-nav-holder');
      mobileNavHolder.classList.toggle("nav-reveal");
      const mobileNav = e.target.parentNode.parentNode.parentNode.parentNode;
      console.log(mobileNav)
      document.body.removeChild(mobileNav)
    })
  },
  mobileFilterToggleEventListener: () => {
    const filterResultsButton = document.querySelector(".filter-bar-right-button");
    filterResultsButton.addEventListener('click', (e) => {
      mobileFilter.mobileFilterToggle(e.target);
    })
  }

}

const mobileMenu = {
  createMobileNav: () => {
    const mobileNav = `
      <div class="mobile-nav-container">
        <div class="mobile-nav-header-container">
          <div class="header-exit-button-container">
            <i class="fa fa-times fa-nav-x" aria-hidden="true"></i>
          </div>
          <h2 class="mobile-nav-title">menu</h2>
        </div>
        <ul class="mobile-nav-content-container">
          <a href="#"><li class="mobile-nav">
            <p class="mobile-nav-text">pools & spas</p>
            <i class="fa fa-chevron-right fa-chevron-nav" aria-hidden="true"></i>
          </li></a>
          <a href="#"><li class="mobile-nav">
            <p class="mobile-nav-text">supplies</p>
            <i class="fa fa-chevron-right fa-chevron-nav" aria-hidden="true"></i>
          </li></a>
          <a href="#"><li class="mobile-nav">
            <p class="mobile-nav-text">resources</p>
            <i class="fa fa-chevron-right fa-chevron-nav" aria-hidden="true"></i>
          </li></a>
          <a href="#"><li class="mobile-nav">
            <p class="mobile-nav-text">services</p>
            <i class="fa fa-chevron-right fa-chevron-nav" aria-hidden="true"></i>
          </li></a>
        </ul>
      </div>
    `;
    const mobileNavHolder = document.createElement('div');
    mobileNavHolder.classList.add('mobile-nav-holder');
    document.body.append(mobileNavHolder);
    mobileNavHolder.innerHTML = mobileNav;
    const mobileNavContainer = document.querySelector('.mobile-nav-container');
    setTimeout(() => mobileNavHolder.classList.toggle("nav-reveal"), 100);
    handlers.mobileNavExitEventListener();
  }
}

const mobileFilter = {
  mobileFilterToggle: (target) => {
    //reavel filter container
    const filterContainer = document.querySelector('.filter-list-container');
    filterContainer.classList.toggle('filter-open');
    //animate the drop down arrow
    if (target.classList.contains('filter-bar-right-button')) {
      console.log("It does!")
      target.childNodes[1].classList.toggle('arrow-toggle');
    } else {
      console.log("yay")
      target.classList.toggle('arrow-toggle');
    }
    const filterRightText = document.querySelector('.filter-right-text');
    filterRightText.classList.toggle('arrow-toggle-border');
    const filterRightButton = document.querySelector('.filter-bar-right-button');
    filterRightButton.classList.toggle('arrow-toggle-border');
  }
}

filter.fetchData(filter.filterStatus);
handlers.filterInputEventListener();
handlers.mobileNavEventListener();
handlers.mobileFilterToggleEventListener();


// switch to const and let
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
// http://getbem.com/
// Do Module 1 and 3 Wes Bos course before turning in project.

//create DOM node elements
