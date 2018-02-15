console.log('test');

const agesApp = {};

agesApp.userInput = '';

agesApp.artPeriod = '';

agesApp.periodArray = {
   '-3': '3rd century BCE',
   '-2': '2nd century BCE',
   '-1': '1st century BCE',
   '1': '1st century CE',
   '2': '2nd century CE',
   '3': '3rd century CE',
   '4': '4th century CE',
   '5': '5th century CE',
   '6': '6th century',
   '7': '7th century',
   '8': '8th century',
   '9': '9th century',
   '10': '10th century',
   '11': '11th century',
   '12': '12th century',
   '13': '13th century',
   '14': '14th century',
   '15': '15th century',
   '16': '16th century',
   '17': '17th century',
   '18': '18th century',
   '19': '19th century',
   '20': '20th century',
   '21': '21st century'
};


//function that takes the input from the user and puts that into the 'object' value of the data request of the ajax request.

agesApp.userSelection = function () {
   $('.object-input').change(function () {
      userInput = $(this).val();
   })
}

//function that takes the input of the slider and puts that into the '_century' value of the data request.





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
agesApp.displayAllArt = (object, century) => {
   agesApp.numberToCentury();



   // $.when(agesApp.getRijks(),agesApp.getHarvard())
   // .then((Rijks, Harvard) => {
   //    console.log(Rijks, Harvard);
   // })
   // .fail((err1, err2) => {
   //    console.log(err1, err2);
   // });
};


agesApp.numberToCentury = (num) => {
   //Takes a number and translates to a century string.
   let numString = num.toString();
   return agesApp.periodArray[numString];
};



agesApp.init = () => {
   agesApp.displayAllArt();
}

$(function () {
   agesApp.init()
})