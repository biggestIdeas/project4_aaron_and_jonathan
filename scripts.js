const agesApp = {};

agesApp.userInput = '';

agesApp.artPeriod = '';

agesApp.rijksArt = [];

agesApp.harvardArt = [];

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

agesApp.periodStyles = {};

agesApp.lastSelectedPeriod = null;

agesApp.addStyleForPeriod = function(periodNumber,elementType,styleClass){
      // if there isnt a style for given period, make one
      if(!agesApp.periodStyles[periodNumber.toString()]){
            agesApp.periodStyles[periodNumber.toString()] = {};
      }

      agesApp.periodStyles[periodNumber.toString()][elementType] = styleClass;     
}

agesApp.getStylesForPeriod = function(periodNumber){
      return agesApp.periodStyles[periodNumber.toString()];
}


//function that takes the input from the user and puts that into the 'object' value of the data request of the ajax request.

agesApp.userSelection = function () {
   $('.object-input').change(function () {
      agesApp.displayAllArt($(this).val(), $('.century-input').val());
      agesApp.userInput = $(this).val();
   })
}


//function that takes the input of the slider and puts that into the '_century' value of the data request.

agesApp.setupSlider = function(){
      $('.century-input').on("change",function(){
            agesApp.displayAllArt($('.object-input').val(), $(this).val());
            agesApp.artPeriod = $(this).val();
            // agesApp.artPeriod = $(this).val();
            // console.log('a change was made');
            // make new ajax request
            // getArt($('.object-input),agesApp.artPeriod);
      });

      $('.century-input').on("input",function(){
            let inputval = $(this).val();
            console.log(agesApp.numberToCentury($(this).val()));
            console.log($(this).val());
            agesApp.applyPeriodStyle(inputval);
            agesApp.displayPeriodToSearchIn(inputval);
            // changeBackground()
      })

      //new line
}

// _century -> number between -3 and 20
agesApp.getRijks = (object, _century) => {
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

// _century requires special formatting
// in the early centuries, requires CE and BCE 
// 3rd vs. 4th
// full argument looks like '11th century' or '3rd century CE' or '2nd century BCE'
agesApp.getHarvard = (object, _century) => {
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

agesApp.populateRijks = (item) => {
   $('.gallery').append(`\
      <div class="gallery-object">\
         <figure>\
            <img src=${item.webImage.url}>\
         </figure>\
         <div class="gallery-object-text">\
            <h2>Rijks Title</h2>\
            <h3>${item.title}</h3>\
            <h2>Artist</h2>\
            <h3>${item.principalOrFirstMaker}</h3>\
            <a class="gallery-object-link" href="${item.links.web}" target="_blank">More Information</a>\
         </div>\
      </div>\
   `)
}

   // item.filter((piece) => {
   //    return item.primaryimageurl !== null
   // })

agesApp.populateHarvard = (item) => {
   const image = $('<img>').attr('src',item.primaryimageurl);
   const titleLabel = $('<h2>').text('Harvard Title');
   const title = $('<h3>').text(item.title);
   const artistLabel = $('<h2>').text('Artist');
   const artLink = $('<a class="gallery-object-link" target="_blank">').attr('href',item.url).text('More Information');
   const imgFigure = $('<figure>').append(image);
   const textBlock = $('<div class="gallery-object-text">').append(titleLabel, title);

   // Check to see if there is an artist
   if (item.people) {
      const artist = $('<h3>').text(item.people[0].name);
      textBlock.append(artistLabel, artist);
   }
   textBlock.append(artLink);

   const container = $('<div class="gallery-object">').append(imgFigure, textBlock);
   $('.gallery').append(container);
}

//This function displays the art on the page.
agesApp.displayAllArt = (object, century) => {
   //Transforms the slider input to a century name string.
   let centuryToString = agesApp.numberToCentury(century);
   //Awaits the promise from the ajax call
   $.when(agesApp.getRijks(object, century),agesApp.getHarvard(object,centuryToString))
   //returning the promises from both Rijks and Harvard
   .then((Rijks, Harvard) => {
      rijksObjects = Rijks[0].artObjects.slice();
      harvardObjects = Harvard[0].records.slice();
      //Empty the image galleries
      $('.gallery').empty();
      // A variable for the following "if" loops.
      let i = 0;
      //while one of the responses still has objects.
      while (rijksObjects.length > 0 || harvardObjects.length > 0) {
         if (i % 2 === 0 && rijksObjects.length > 0) {
            // console.log('R');
            let rPop = rijksObjects.pop();
            agesApp.populateRijks(rPop);
         }
         if (i % 2 === 1 && harvardObjects.length > 0) {
            // console.log('H');
            let hPop = harvardObjects.pop();
            console.log(hPop);
            agesApp.populateHarvard(hPop);
         }
         i++;
      };
   });
}

agesApp.numberToCentury = function(num) {
   //Takes a number and translates to a century string.
   let numString = num.toString();
   return agesApp.periodArray[numString];
};


agesApp.setPeriodStyles = function(){
      // 1) Ancient
      agesApp.addStyleForPeriod(-3,"header","header-ancient");
      agesApp.addStyleForPeriod(-2,"header","header-ancient");
      agesApp.addStyleForPeriod(-1,"header","header-ancient");

      // 2) Classical
      agesApp.addStyleForPeriod(0,"header","header-classical");
      agesApp.addStyleForPeriod(1,"header","header-classical");
      agesApp.addStyleForPeriod(2,"header","header-classical");
      agesApp.addStyleForPeriod(3,"header","header-classical");   

      // 3) Dark Ages
      agesApp.addStyleForPeriod(4,"header","header-dark-ages");
      agesApp.addStyleForPeriod(5,"header","header-dark-ages");
      agesApp.addStyleForPeriod(6,"header","header-dark-ages");
      agesApp.addStyleForPeriod(7,"header","header-dark-ages");
      agesApp.addStyleForPeriod(8,"header","header-dark-ages");
      agesApp.addStyleForPeriod(9,"header","header-dark-ages");
      agesApp.addStyleForPeriod(10,"header","header-dark-ages");

      // 4) Medieval
      agesApp.addStyleForPeriod(11,"header","header-medieval");
      agesApp.addStyleForPeriod(12,"header","header-medieval");
      agesApp.addStyleForPeriod(13,"header","header-medieval");

      // 5) Renaissance
      agesApp.addStyleForPeriod(14,"header","header-renaissance");
      agesApp.addStyleForPeriod(15,"header","header-renaissance");
      agesApp.addStyleForPeriod(16,"header","header-renaissance");

      // 6) 1700s
      agesApp.addStyleForPeriod(17,"header","header-rococo");
      // 7) 1800s
      agesApp.addStyleForPeriod(18,"header","header-rococo");
      // 8) 1900s
      agesApp.addStyleForPeriod(19,"background","bg-19");
      // 9) 2000s
      agesApp.addStyleForPeriod(20,"background","bg-20");

      
}

agesApp.applyPeriodStyle = function(periodNumber){
      let styleObj = agesApp.getStylesForPeriod(periodNumber);
      //let bgStyle = styleObj["background"];
      let headerStyle = styleObj["header"];

      if(agesApp.lastSelectedPeriod !=null){
            let lastStyleObj = agesApp.getStylesForPeriod(agesApp.lastSelectedPeriod);
           // let lastBgStyle = lastStyleObj["background"];
            let lastHeaderStyle = lastStyleObj["header"];
           // $('body').removeClass(lastBgStyle);
            $('.sub-header').removeClass(lastHeaderStyle);
      }
      agesApp.lastSelectedPeriod = periodNumber;

     // $('body').addClass(bgStyle);
      $('.sub-header').addClass(headerStyle);
      console.log($('body').attr('class'));
}

agesApp.displayPeriodToSearchIn = function(periodNumber){
      $('.century-to-search').text(agesApp.periodArray[periodNumber.toString()]);
}


agesApp.init = () => {
   agesApp.setupSlider();
   agesApp.userSelection();
   agesApp.setPeriodStyles();

   console.log(agesApp.periodStyles);
}

$(function () {
   agesApp.init()
})