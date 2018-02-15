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










//This function displays the OUTCOME of the search.
agesApp.displayAllArt = (object, century) => {
   
   let centuryToString = agesApp.numberToCentury(century);


   $.when(agesApp.getRijks(object, century),agesApp.getHarvard(object,centuryToString))
   .then((Rijks, Harvard) => {
      //Grabs the first webImage from the 1st item of the Rijks array
      $('.image-gallery-image').attr('src',Rijks[0].artObjects[0].webImage.url);
      //Grab the first image from the 1st item of the array from the Harvard query
      console.log(Rijks, Harvard);
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



agesApp.init = () => {
   agesApp.setupSlider();
   agesApp.userSelection();
}

$(function () {
   agesApp.init()
})