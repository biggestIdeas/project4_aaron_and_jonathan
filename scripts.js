const agesApp = {};

agesApp.userInput = '';

agesApp.artPeriod = '';

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
            agesApp.applyPeriodStyle(inputval);
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










//This function displays the art on the page.
agesApp.displayAllArt = (object, century) => {
   
   //Transforms the slider input to a century name string.
   let centuryToString = agesApp.numberToCentury(century);

   //Awaits the promise from the ajax call
   $.when(agesApp.getRijks(object, century),agesApp.getHarvard(object,centuryToString))

   //returning the promises from both Rijks and Harvard
   .then((Rijks, Harvard) => {
      console.log(Rijks, Harvard);

      //Grabs the first webImage from the 1st item of the Rijks array
      // $('.image-gallery-image').attr('src',Rijks[0].artObjects[0].webImage.url);

      //Grab the first image from the 1st item of the array from the Harvard query
      // $('.image-gallery-image-2').attr('src',Harvard[0].records[0].primaryimageurl);

      //Empty the two image galleries
      $('.gallery').empty();
      $('.gallery-2').empty();

      //Code that populates a gallery with the 10 images from the Rijks query.
      // for (let i = 0; i < Rijks[0].artObjects.length; i++) {
      //    $('.gallery').append(`\
      //       <div class="gallery-object">\
      //          <figure>\
      //             <img src=${Rijks[0].artObjects[i].webImage.url}>\
      //          </figure>\
      //          <div class="gallery-object-text">\
      //             <h2>Title</h2>\
      //             <h3>${Rijks[0].artObjects[i].title}</h3>\
      //             <h2>Artist</h2>\
      //             <h3>${Rijks[0].artObjects[i].principalOrFirstMaker}</h3>\
      //             <a class="gallery-object-link" href="${Rijks[0].artObjects[i].links.web}" target="_blank">More Information</a>\
      //          </div>\
      //       </div>\
      //       `)
      // };

      //Code that populates a gallery with the 10 images from the Harvard query.
      for (let i = 0; i < Harvard[0].records.length; i++) {
         $('.gallery-2').append(`\
         <div class="gallery-object">\
            <figure>\
               <img src=${Harvard[0].records[i].primaryimageurl}>\
            </figure>\
            <div class="gallery-object-text">\
               <h2>Title</h2>\
               <h3>${Harvard[0].records[i].title}</h3>\
               <h2>Artist</h2>\
               <h3>${Harvard[0].records[i].people}</h3>\
               <a class="gallery-object-link" href="${Harvard[0].records[i].url}" target="_blank">More Information</a>\
            </div>\
         </div>\
         `)
      }
   })
   .fail((err1, err2) => {
      console.log(err1, err2);
   });
};


agesApp.numberToCentury = function(num) {
   //Takes a number and translates to a century string.
   let numString = num.toString();
   return agesApp.periodArray[numString];
};


agesApp.setPeriodStyles = function(){
      // 1) Ancient
      agesApp.addStyleForPeriod(-3,"background","bg-ancient");
      agesApp.addStyleForPeriod(-2,"background","bg-ancient");
      agesApp.addStyleForPeriod(-1,"background","bg-ancient");
      // 2) Classical
      agesApp.addStyleForPeriod(0,"background","bg-classical");
      agesApp.addStyleForPeriod(1,"background","bg-classical");
      agesApp.addStyleForPeriod(2,"background","bg-classical");
      agesApp.addStyleForPeriod(3,"background","bg-classical");
      // 3) Dark Ages
      agesApp.addStyleForPeriod(4,"background","bg-dark");
      agesApp.addStyleForPeriod(5,"background","bg-dark");
      agesApp.addStyleForPeriod(6,"background","bg-dark");
      agesApp.addStyleForPeriod(7,"background","bg-dark");
      agesApp.addStyleForPeriod(8,"background","bg-dark");
      agesApp.addStyleForPeriod(9,"background","bg-dark");
      agesApp.addStyleForPeriod(10,"background","bg-dark");
      // 4) Medieval
      agesApp.addStyleForPeriod(11,"background","bg-medieval");
      agesApp.addStyleForPeriod(12,"background","bg-medieval");
      agesApp.addStyleForPeriod(13,"background","bg-medieval");
      // 5) Renaissance
      agesApp.addStyleForPeriod(14,"background","bg-renaissance");
      agesApp.addStyleForPeriod(15,"background","bg-renaissance");
      agesApp.addStyleForPeriod(16,"background","bg-renaissance");
      // 6) 1600s
      agesApp.addStyleForPeriod(17,"background","bg-17");
      // 7) 1700s
      agesApp.addStyleForPeriod(18,"background","bg-18");
      // 8) 1800s
      agesApp.addStyleForPeriod(19,"background","bg-19");
      // 9) 1900s
      agesApp.addStyleForPeriod(19,"background","bg-20");
      // 9) 2000s
      agesApp.addStyleForPeriod(20,"background","bg-21");
}

agesApp.applyPeriodStyle = function(periodNumber){
      let styleObj = agesApp.getStylesForPeriod(periodNumber);
      let bgStyle = styleObj["background"];

      if(agesApp.lastSelectedPeriod !=null){
            let lastStyleObj = agesApp.getStylesForPeriod(agesApp.lastSelectedPeriod);
            let lastBgStyle = lastStyleObj["background"];
            $('body').removeClass(lastBgStyle);
      }
      agesApp.lastSelectedPeriod = periodNumber;

      $('body').addClass(bgStyle);
      console.log($('body').attr('class'));
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