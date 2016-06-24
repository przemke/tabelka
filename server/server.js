var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================



app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


var people = [{
    name: "Jan",
    lastName: "Kowalski",
    age: 23
}, {
    name: "Janina",
    lastName: "Kowalska",
    age: 22
}, {
    name: "Grzegorz",
    lastName: "Brzęczyszczykiwicz",
    age: 22
}, {
    name: "Marian",
    lastName: "Kowalski",
    age: 55
}, {
    name: "Sydney",
    lastName: "Polak",
    age: 46
}, {
    name: "Bronisław",
    lastName: "Wiśniewski",
    age: 39
}, {
    name: "Michał",
    lastName: "Anioł",
    age: 40
}, {
    name: "Bożydar",
    lastName: "Jędrzejski",
    age: 41
}, {
    name: "Michał",
    lastName: "Musiał",
    age: 25
}, {
    name: "Hanna",
    lastName: "Mostowiak",
    age: 32
}, {
    name: "Karolina",
    lastName: "Wiśniewska",
    age: 35
}, {
    name: "Małgorzata",
    lastName: "Andrzejewicz",
    age: 32
}, {
    name: "Jakub",
    lastName: "Błaszczykowski",
    age: 45
}, {
    name: "Andrzej",
    lastName: "Gołota",
    age: 56
}, {
    name: "Krzysztof",
    lastName: "Krawczyk",
    age: 62
}, {
    name: "Maryla",
    lastName: "Rodowicz",
    age: 65
}, {
    name: "Jakub",
    lastName: "Dębski",
    age: 32
}, {
    name: "Janusz",
    lastName: "Tracz",
    age: 49
}, {
    name: "Jonasz",
    lastName: "Koran-Mekka",
    age: 77
}, {
    name: "Andrzej",
    lastName: "Duda",
    age: 48
}, {
    name: "Mirosław",
    lastName: "Hermaszewski",
    age: 82
}, {
    name: "Adam",
    lastName: "Małysz",
    age: 38
}, {
    name: "Kazik",
    lastName: "Staszewski",
    age: 52
}, {
    name: "Krzysztof",
    lastName: "Gonciarz",
    age: 31
}, {
    name: "Aleksandra",
    lastName: "Szwed",
    age: 27
}, {
    name: "Ewa",
    lastName: "Farna",
    age: 28
}, {
    name: "Kinga",
    lastName: "Duda",
    age: 21
}, {
    name: "Anna-Maria",
    lastName: "Wesołowska",
    age: 44
}, {
    name: "Anna",
    lastName: "Mucha",
    age: 34
}, {
    name: "Joanna",
    lastName: "Krupa",
    age: 32
}, {
    name: "Marta",
    lastName: "Wierzbicka",
    age: 24
}, {
    name: "Maria",
    lastName: "Skłodowska-Curie",
    age: 160
}, {
    name: "Bożena",
    lastName: "Dykiel",
    age: 67
}, {
    name: "Ryszard",
    lastName: "Lubicz",
    age: 64
}, {
    name: "Paweł",
    lastName: "Lubicz",
    age: 52
}, ];

//funkcja sortująca wg wybranej metody
var sortByValue = function(array, method) {
    var sorted = array.slice(0);
    if (method == "byName") {
        sorted.sort(function(a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    } else if (method == "byLastName") {
        sorted.sort(function(a, b) {
            var x = a.lastName.toLowerCase();
            var y = b.lastName.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
    } else {
        sorted.sort(function(a, b) {
            return a.age - b.age;
        });
    }
    return sorted;
};

var processedRecords = [];

//pobranie 10 rekordów
app.get('/api/people', function(req, res, next) {
    var startTime = Date.now(),
        pageSize = 10,
        resultArrays = [],
        resultPage = [],
        result = [];

    console.log('start: ' + startTime);

    if (req.query.pattern.length > 0) { //filtrowanie wyników
        var words = req.query.pattern.match(/\S+/g); //wyciąganie słów kluczowych
        var filtered = people;

        //filtrowanie kolejno po słowach kluczowych
        for (var i = 0; i < words.length; i++) {
            filtered = filtered.filter(function(el) {
                return el.name.toLowerCase().indexOf(words[i]) !== -1 ||
                    el.lastName.toLowerCase().indexOf(words[i]) !== -1 ||
                    el.age.toString().indexOf(words[i]) !== -1;
            });
        }
        result = sortByValue(filtered, req.query.sort); //sortowanie wyników

    } else { //puste zapytanie - zwracanie wszystkich wyników
        result = sortByValue(people, req.query.sort); //sortowanie wyników
    }

    //dzielenie wyników na strony
    while (result.length > 0) {
        resultArrays.push(result.splice(0, pageSize));
    }

    //zapisywanie wyników dla późniejszych zapytań zmiany strony
    processedRecords = resultArrays;

    //wczytanie pierwszej strony
    resultPage = resultArrays[0];

    var currTime = Date.now();
    var passed = currTime - startTime;
    if (passed < 1000) {
        setTimeout(function() {
            //wysłanie pierwszej strony i informacji o ilości stron
            res.json({
                people: resultPage,
                pageCount: resultArrays.length,
            });
        }, 1000 - passed);
    } else {
        //wysłanie pierwszej strony i informacji o ilości stron
        res.json({
            people: resultPage,
            pageCount: resultArrays.length,
        });
    }
});

//pobranie strony
app.get('/api/page', function(req, res, next) {
  setTimeout(function(){
    res.json(processedRecords[req.query.page - 1]);
  }, 1000);

});


// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");
