var filter = {

  // initial filter status
  filterStatus: [
    {name: "firstInput", status: true, certifications: "Service Pro"},
    {name: "secondInput", status: true,  certifications: "Installation Pro"},
    {name: "thirdInput", status: true, certifications: "Residential Pro"},
    {name: "fourthInput", status: true, certifications: "Commercial Pro"}
  ],

  // fetch json data
  fetchData: function(filterStatus) {
    fetch('https://api.myjson.com/bins/lgb21')
      .then(res => {
        res.json().then(function(data) {
          var data = data;
          filter.updateStatus(filterStatus, data)
        })
      })
  },

  // fire from handlers - update the filterStatus array
  updateStatus: function(filterStatus, data) {
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
    filter.filterCards(cert, dealers)
  },

  // render cards based on filter values
  filterCards: function(cert, dealers) {
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
        filter.createCardElement(card, cardData)
      } else {
        console.log("filtered out")
      }
    })
  },

  // Render card element with correct data from Json
  createCardElement: function(card, cardData) {
    //append card to the cardContainer
    card.classList.add("card");
    var cardContainer = document.querySelector(".card-container");
    cardContainer.append(card);
    // full HTML card element
    var cardElement =  '  <div class="card-title-container">' +
                       '    <h2 class="card-title">' + cardData.data.name + '</h2>' +
                       '  </div>' +
                       '  <div class="card-content-container">' +
                       '    <div class="card-content-top">' +
                       '      <div class="number-container">' +
                       '        <i class="fa fa-phone" aria-hidden="true"></i>' +
                       '        <p class="phone-number">' + cardData.data.phone1 + '</p>' +
                       '      </div>' +
                       '      <p class="number-sub-text">Can’t talk now? Click below to send an email.</p>' +
                       '    </div>' +
                       '    <div class="card-content-middle">' +
                       '      <button class="card-button">' +
                       '        <i class="fa fa-envelope" aria-hidden="true"></i>' +
                       '        <p class="card-button-text">Contact this Pro</p>' +
                       '      </button>' +
                       '    </div>' +
                       '    <div class="card-content-bottom">' +
                       '      <h4 class="card-content-bottom-title">Business House</h4>' +
                       '      <p class="card-content-bottom-text">Weekdays ' + cardData.data.weekHours.mon + '<br>Saturdays ' + dataSifting.saturdayCalc(cardData) + '<br>Sundays ' + dataSifting.sundayCalc(cardData) + '</p>' +
                       '    </div>' +
                       '  </div>' +
                       '  <div class="card-footer-container">' + dataSifting.footerContentFilter(cardData) + '</div></div>';
    //insert HTML card template into the card
    card.innerHTML = cardElement;
    console.log(card);
  }
}

var dataSifting = {
  sundayCalc: function(cardData) {
    var weekHoursObj = cardData.data.weekHours;
    if (weekHoursObj.sun === "") {
      return "- CLOSED"
    } else if (weekHoursObj.sun === "On Call") {
      return "- " + weekHoursObj.sun
    } else {
      return weekHoursObj.sun
    }
  },
  saturdayCalc: function(cardData) {
    var weekHoursObj = cardData.data.weekHours;
    if (weekHoursObj.sat === "") {
      return "- CLOSED"
    } else {
      return weekHoursObj.sat
    }
  },
  footerContentFilter: function(cardData) {
    var cert = cardData.data.certifications;
    var footerElements = {
      Element: ""
    }
    cert.forEach(function(e, i, arr) {
      var starIcon = '<i class="fa fa-star fa-card-icon" aria-hidden="true"></i>'
      var cogIcon = '<i class="fa fa-cog fa-card-icon" aria-hidden="true"></i>'
      var houseIcon = '<i class="fa fa-home fa-card-icon" aria-hidden="true"></i>'
      var userIcon = '<i class="fa fa-user fa-card-icon" aria-hidden="true"></i>'
      var currentIcon = ""
      if (e === "Installation Pro") {
        currentIcon = starIcon;
      } else if (e === "Service Pro") {
        currentIcon = cogIcon;
      } else if (e === "Residential Pro") {
        currentIcon = houseIcon;
      } else if (e === "Commercial Pro") {
        currentIcon = userIcon;
      }
      footerElements.Element = footerElements.Element + '<div class="footer-text-container">' + currentIcon + '<p class="footer-text">' + cert[i] + '</p>' + '</div>'
    })
    console.log(footerElements.Element)
    return footerElements.Element
  }

}


var handlers = {

  //create Event Listener for inputs, fire-off state change when clicked
  filterInputEventListener: function() {
    //pull node list containing all checkbox input containers
    var checkboxContainers = document.querySelectorAll(".checkbox-input-container");
    for (let i = 0; i < checkboxContainers.length; i++) {
      checkboxContainers[i].childNodes[1].addEventListener('click', function(e) {
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

}


handlers.filterInputEventListener();
