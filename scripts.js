const agesApp = {};

// data structure to convert integers to strings (primarily for Harvard Art API)
agesApp.periodArray = {
   '-3': '3rd century BCE',
   '-2': '2nd century BCE',
   '-1': '1st century BCE',
   '0': '1st century CE',
   '1': '2nd century CE',
   '2': '3rd century CE',
   '3': '4th century CE',
   '4': '5th century CE',
   '5': '6th century',
   '6': '7th century',
   '7': '8th century',
   '8': '9th century',
   '9': '10th century',
   '10': '11th century',
   '11': '12th century',
   '12': '13th century',
   '13': '14th century',
   '14': '15th century',
   '15': '16th century',
   '16': '17th century',
   '17': '18th century',
   '18': '19th century',
   '19': '20th century',
   '20': '21st century'
};

agesApp.defaultSelectionArray = [
   {'dog': '8' },
   {'man': '20'},
   {'bowl': '0'}
]

//A function that applies default selections upon initialization of the app.
agesApp.defaultSelection = () => {
   const ran = Math.floor(Math.random() * agesApp.defaultSelectionArray.length);
   const search = agesApp.defaultSelectionArray[ran];
   const ranInput = (Object.keys(search)[0]);
   const timePeriod = (Object.values(search)[0])
   $('.object-input').val(ranInput);
   $('.century-input').val(timePeriod);
   agesApp.handleInputChange();
}

// object to contain the styles that pertain to various periods that can be selected
agesApp.periodStyles = {};

// the last time period in which the user has decided to search
agesApp.lastSelectedPeriod = null;

// adds a style for a given periodNumber and elementType
// (i.e) addStyleForPeriod(4,"footer","footer-style-4");
agesApp.addStyleForPeriod = function(periodNumber,elementType,styleClass){
      // if there isnt a style for given period, make one
      if(!agesApp.periodStyles[periodNumber.toString()]){
            agesApp.periodStyles[periodNumber.toString()] = {};
      }

      agesApp.periodStyles[periodNumber.toString()][elementType] = styleClass;     
}

// get the styles for a given periodNumber
agesApp.getStylesForPeriod = function(periodNumber){
      return agesApp.periodStyles[periodNumber.toString()];
}

// applies event listeners to object text input
agesApp.setupObjectInput = function () {
   $('.object-input').change(function () {
      agesApp.handleInputChange();
   })
}

// on an input change, display art to the page if there are valid inputs
agesApp.handleInputChange = function(){
      let userObjectInput = $('.object-input').val();
      let centuryInput = $('.century-input').val();
      if(userObjectInput !== ''){
            agesApp.displayAllArt(userObjectInput,centuryInput);
      }
}

// applies event listeners to century slider input
agesApp.setupSlider = function(){
      $('.century-input').on("change",function(){
            agesApp.handleInputChange();
      });

      $('.century-input').on("input",function(){
            let inputval = $(this).val();
            agesApp.applyPeriodStyle(inputval);
            agesApp.displayPeriodToSearchIn(inputval);
      })
}

// for a given object query and century query, return a promise from the Rijksmuseum API
// (string, number) -> Ajax Promise
agesApp.getArtFromRijksmuesumAPI = (object, _century) => {
   return $.ajax({
      url: 'https://www.rijksmuseum.nl/api/en/collection',
      dataType: 'json',
      method: 'GET',
      data: {
         key: 'fscdda7g',
         format: 'json',
         q: object,
         imgonly: true,
         "f.dating.period": _century,
      }
   });
};

// for a given object query and century query, return a promise from the Harvard Art Museum API
// (string, string) -> Ajax Promise
agesApp.getArtFromHarvardArtAPI = (object, _century) => {
   return $.ajax({
      url : "https://api.harvardartmuseums.org/object",
      format : "json",
      method: "GET",
      data: {
            apikey : "83ec36b0-1103-11e8-967e-6df5e50af9ba",
            century: _century,
            title : object,
      }            
   });
};

// add an item from a Rijksmuseum API response to DOM
// (object) -> null
agesApp.displayRijksmuseumArtObject = (item) => {
   $('.gallery').append(`\
      <div class="gallery-object">\
         <figure>\
            <img src=${item.webImage.url}>\
         </figure>\
         <div class="gallery-object-text">\
            <h2>Title</h2>\
            <h3>${item.title}</h3>\
            <h2>Artist</h2>\
            <h3>${item.principalOrFirstMaker}</h3>\
            <a class="gallery-object-link" href="${item.links.web}" target="_blank">More Information</a>\
         </div>\
      </div>\
   `)
}

// add an item from a Harvard Art API response to DOM
// (object) -> null
agesApp.displayHarvardArtObject = (item) => {
      const titleLabel = $('<h2>').text('Title');
      const title = $('<h3>').text(item.title);
      const artistLabel = $('<h2>').text('Artist');
      const artLink = $('<a class="gallery-object-link" target="_blank">').attr('href',item.url).text('More Information');

      const container = $('<div class="gallery-object">');

      const textBlock = $('<div class="gallery-object-text">').append(titleLabel, title);
      if (item.people) {
            const artist = $('<h3>').text(item.people[0].name);
            textBlock.append(artistLabel, artist);
      }
      textBlock.append(artLink);

      if(item.primaryimageurl !== null){
            const image = $('<img>').attr('src',item.primaryimageurl);
            const imgFigure = $('<figure>').append(image);
            container.append(imgFigure,textBlock);
            $('.gallery').append(container);
      }
}

//This function displays the art on the page.
agesApp.displayAllArt = (object, century) => {
      //Transforms the slider input to a century name string.
      let centuryToString = agesApp.numberToCentury(century);

      let rijksmuseumRequest = agesApp.getArtFromRijksmuesumAPI(object, century);
      let harvardRequest = agesApp.getArtFromHarvardArtAPI(object,centuryToString);

      $.when(rijksmuseumRequest,harvardRequest)
      //returning the promises from both Rijks and Harvard
            .then((rijks, harvard) => {
                  $('.gallery').empty();
                  agesApp.weaveAndDisplayResults(rijks,harvard);
            });
}

// weave the and display the results from both API's
agesApp.weaveAndDisplayResults = function(rijksResponse,harvardResponse){
      let rijksObjects = rijksResponse[0].artObjects.slice();
      let harvardObjects = harvardResponse[0].records.slice();

      if(!rijksObjects.length > 0 && !harvardObjects.length > 0){
            agesApp.displayNoResults();
      }

      let i = 0;
      //while one of the responses still has objects.
      while (rijksObjects.length > 0 || harvardObjects.length > 0) {
            if (i % 2 === 0 && rijksObjects.length > 0) {
                  let rPop = rijksObjects.pop();
                  agesApp.displayRijksmuseumArtObject(rPop);
            }
            if (i % 2 === 1 && harvardObjects.length > 0) {
                  let hPop = harvardObjects.pop();
                  agesApp.displayHarvardArtObject(hPop);
            }
            i++;
      };      
}

agesApp.numberToCentury = function(num) {
   //Takes a number and translates to a century string.
   let numString = num.toString();
   return agesApp.periodArray[numString];
};

// alert user that no results could be found
agesApp.displayNoResults = function(){
      let century = agesApp.periodArray[$('.century-input').val().toString()];
      let object = $('.object-input').val();
      let pluralMod = '';
      
      if(!object.endsWith('s')){
            pluralMod = "the";
      }

      $('.gallery').append(`<h3 class = "no-results-message"> The ${century} was a bad time for ${pluralMod} ${object}...</h3>`)      
}

agesApp.setPeriodStyles = function(){
      // 1) Ancient
      agesApp.addStyleForPeriod(-3,"header","header-ancient");
      agesApp.addStyleForPeriod(-2,"header","header-ancient");
      agesApp.addStyleForPeriod(-1,"header","header-ancient");


      agesApp.addStyleForPeriod(-3,"century-to-search","font-ancient");
      agesApp.addStyleForPeriod(-2,"century-to-search","font-ancient");
      agesApp.addStyleForPeriod(-1,"century-to-search","font-ancient");

      // 2) Classical
      agesApp.addStyleForPeriod(0,"header","header-classical");
      agesApp.addStyleForPeriod(1,"header","header-classical");
      agesApp.addStyleForPeriod(2,"header","header-classical");
      agesApp.addStyleForPeriod(3,"header","header-classical");   

      agesApp.addStyleForPeriod(0,"century-to-search","font-classical");
      agesApp.addStyleForPeriod(1,"century-to-search","font-classical");
      agesApp.addStyleForPeriod(2,"century-to-search","font-classical");
      agesApp.addStyleForPeriod(3,"century-to-search","font-classical"); 

      // 3) Dark Ages
      agesApp.addStyleForPeriod(4,"header","header-dark-ages");
      agesApp.addStyleForPeriod(5,"header","header-dark-ages");
      agesApp.addStyleForPeriod(6,"header","header-dark-ages");
      agesApp.addStyleForPeriod(7,"header","header-dark-ages");
      agesApp.addStyleForPeriod(8,"header","header-dark-ages");
      agesApp.addStyleForPeriod(9,"header","header-dark-ages");
      agesApp.addStyleForPeriod(10,"header","header-dark-ages");

      agesApp.addStyleForPeriod(4,"century-to-search","font-dark-ages");
      agesApp.addStyleForPeriod(5,"century-to-search","font-dark-ages");
      agesApp.addStyleForPeriod(6,"century-to-search","font-dark-ages");
      agesApp.addStyleForPeriod(7,"century-to-search","font-dark-ages");
      agesApp.addStyleForPeriod(8,"century-to-search","font-dark-ages");
      agesApp.addStyleForPeriod(9,"century-to-search","font-dark-ages");
      agesApp.addStyleForPeriod(10,"century-to-search","font-dark-ages");

      // 4) Medieval
      agesApp.addStyleForPeriod(11,"header","header-medieval");
      agesApp.addStyleForPeriod(12,"header","header-medieval");
      agesApp.addStyleForPeriod(13,"header","header-medieval");

      agesApp.addStyleForPeriod(11,"century-to-search","font-medieval");
      agesApp.addStyleForPeriod(12,"century-to-search","font-medieval");
      agesApp.addStyleForPeriod(13,"century-to-search","font-medieval");

      // 5) Renaissance
      agesApp.addStyleForPeriod(14,"header","header-renaissance");
      agesApp.addStyleForPeriod(15,"header","header-renaissance");
      agesApp.addStyleForPeriod(16,"header","header-renaissance");

      agesApp.addStyleForPeriod(14,"century-to-search","font-medieval");
      agesApp.addStyleForPeriod(15,"century-to-search","font-medieval");
      agesApp.addStyleForPeriod(16,"century-to-search","font-medieval");

      // 6) 1700s
      agesApp.addStyleForPeriod(17,"header","header-rococo");
      agesApp.addStyleForPeriod(17,"century-to-search","font-medieval");

      // 7) 1800s
      agesApp.addStyleForPeriod(18,"header","header-victorian");
      agesApp.addStyleForPeriod(18,"century-to-search","font-19th-century");
           
      // 8) 1900s
      agesApp.addStyleForPeriod(19,"header","header-art-deco");
      agesApp.addStyleForPeriod(19,"century-to-search","font-20th-century");

      // 9) 2000s
      agesApp.addStyleForPeriod(20,"header","header-modern");
      agesApp.addStyleForPeriod(20,"century-to-search","font-21st-century");

      
}

// apply the relevant styles for a given periodNumber
agesApp.applyPeriodStyle = function(periodNumber){
      let styleObj = agesApp.getStylesForPeriod(periodNumber);
      let headerStyle = styleObj["header"];
      let centuryToSearch = styleObj["century-to-search"];

      if(agesApp.lastSelectedPeriod !=null){
            let lastStyleObj = agesApp.getStylesForPeriod(agesApp.lastSelectedPeriod);
            let lastHeaderStyle = lastStyleObj["header"];
            let lastCenturyToSearch = lastStyleObj["century-to-search"];

            $('.sub-header').removeClass(lastHeaderStyle);
            $('.century-to-search').removeClass(lastCenturyToSearch);
      }
      agesApp.lastSelectedPeriod = periodNumber;

      $('.sub-header').addClass(headerStyle);
      $('.century-to-search').addClass(centuryToSearch);
}

agesApp.displayPeriodToSearchIn = function(periodNumber){
      $('.century-to-search').text(agesApp.periodArray[periodNumber.toString()]);
}


agesApp.init = () => {
   agesApp.defaultSelection();
   agesApp.setupSlider();
   agesApp.setupObjectInput();
   agesApp.setPeriodStyles();

   agesApp.applyPeriodStyle($('.century-input').val());
   agesApp.displayPeriodToSearchIn($('.century-input').val());
}

$(function () {
   agesApp.init()
})