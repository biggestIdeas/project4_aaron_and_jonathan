console.log('test');

const agesApp = {};

agesApp.userInput = '';

agesApp.artPeriod = '';


//function that takes the input from the user and puts that into the 'object' value of the data request of the ajax request.

agesApp.userSelection = function () {
   $('.object-input').on("change",function () {
      agesApp.userInput = $(this).val();
      console.log(agesApp.userInput);
      // make new ajax request
      // getArt($('.object-input),agesApp.artPeriod);
   });
}

//new line

//function that takes the input of the slider and puts that into the '_century' value of the data request.
agesApp.setupSlider = function(){
      $('.century-input').on("change",function(){
            agesApp.artPeriod = $(this).val();
            console.log(agesApp.artPeriod);
            // make new ajax request
            // getArt($('.object-input),agesApp.artPeriod);
      });

      $('.century-input').on("input",function(){
            console.log($(this).val());
            // changeBackground()
      })
}




// _century -> number between 0 and 21
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
agesApp.displayAllArt = () => {
   $.when(agesApp.getRijks('dog', 18),agesApp.getHarvard('dog', '18th century'))
   .then((Rijks, Harvard) => {
      console.log(Rijks, Harvard);
      // populate images
   })
   .fail((err1, err2) => {
      console.log(err1, err2);
   });
};



agesApp.init = () => {
  // agesApp.displayAllArt();
  agesApp.userSelection();
  agesApp.setupSlider();
}

$(function () {
   agesApp.init()
})