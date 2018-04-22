/*
 * JavaScript code to make a large image out of a bunch of other smaller images
 * Smaller images can be clicked to become the large image made up of smaller images
 * All images are selected at random from Flickr
 */

//Gets the mosiac element that will store a bunch of images to become a larger image
var mosaic = document.getElementById('mosaic-container');
mosaic.width = window.innerWidth;
mosaic.height = window.innerHeight;

//The constants that represent the resolutions of the outer and inner images; resolutions are squares
var outerResolution = 75;
var innerResolution = Math.min(window.innerHeight, window.innerWidth) / outerResolution;

//How each image location translates to an ID name
function idForLocation(row, column) {
    return "r:" + row + ";c:" + column;
}

//Initializes the image elements
for (var i = 0; i < outerResolution; i++) {
    for (var j = 0; j < outerResolution; j++) {
        mosaic.appendChild(document.createElement('img'));
        mosaic.lastChild.id = idForLocation(i, j);
        mosaic.lastChild.src = "null.png";
        mosaic.lastChild.width = innerResolution;
        mosaic.lastChild.height = innerResolution;
    }
    mosaic.appendChild(document.createElement('br'));
}

//Gets whether the mosaic has been completed or not
function isMosaicComplete() {
    for (var i = 0; i < outerResolution; i++) {
        for (var j = 0; j < outerResolution; j++) {
            if (document.getElementById(idForLocation(i, j)).src.endsWith("null.png")) {
                return false;
            }
        }
    }
    return true;
}

//Takes in an image and sets its source to a random image from Flickr
function setSourceToRandom(image) {
    $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
        {
            tagmode: "any",
            format: "json"
        },
        function(data) {
            var rnd = Math.floor(Math.random() * data.items.length);
            image.src = data.items[rnd]['media']['m'].replace("_m", "_b");
        }
    );
}

//The actual function that handles making a mosaic of an image
function makeMosaicOf(image) {
    //Gets a 2d array of colors that represents the image; dimensions are outerResolution x outerResolution
    function getPixelDataForImage(image) {
        var pixelData = document.createElement('canvas');
        pixelData.width = outerResolution;
        pixelData.height = outerResolution;
        var renderer = pixelData.getContext('2d');
        renderer.drawImage(image, 0, 0, outerResolution, outerResolution);
        data = [];
        for (var i = 0; i < outerResolution; i++) {
            data.push([]);
            for (var j = 0; j < outerResolution; j++) {
                data[i].push(renderer.getImageData(j, i, 1, 1).data);
            }
        }
        return data;
    }
    //Gets the dominant color of an image if stretched to innerResolution x innerResolution
    function reduceImageToColor(image) {
        var pixelData = document.createElement('canvas');
        pixelData.width = innerResolution;
        pixelData.height = innerResolution;
        var renderer = pixelData.getContext('2d');
        renderer.drawImage(image, 0, 0, innerResolution, innerResolution);
        colorCounts = {};
        for (var i = 0; i < innerResolution; i++) {
            for (var j = 0; j < innerResolution; j++) {
                var color = renderer.getImageData(j, i, 1, 1).data;
                if (color in colorCounts) {
                    colorCounts[color] += 1;
                } else {
                    colorCounts[color] = 1;
                }
            }
        }
        return JSON.parse("[" + Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b) + "]");
    }
    //Sets all images to have no source
    for (var i = 0; i < outerResolution; i++) {
        for (var j = 0; j < outerResolution; j++) {
            document.getElementById(idForLocation(i, j)).src = "null.png";
        }
    }
    //How much each inner image can differ from the overall image in terms of color
    var colorFaultTolerance = 20;
    //The colors for the image to draw
    var outerImageColors = getPixelDataForImage(image);
    //The actual part of the program that sets the mosaic
    var mosaicFiller = window.setInterval(function() {
        if (isMosaicComplete()) {
            window.clearInterval(mosaicFiller);
            return;
        }
        var innerImageCandidate = document.createElement('img');
        setSourceToRandom(innerImageCandidate);
        window.setTimeout(function() {
            var imageCandidateColor = reduceImageToColor(innerImageCandidate);
            for (var i = 0; i < outerResolution; i++) {
                for (var j = 0; j < outerResolution; j++) {
                    if (outerImageColors[i][j].map((a, index) => Math.pow(a - imageCandidateColor[index], 2)).reduce((a, b) => a + b, 0) < Math.pow(colorFaultTolerance, 2)) {
                        document.getElementById(idForLocation(i, j)).src = innerImageCandidate.src;
                    }
                }
            }
        }, 50);
    }, 50);
}

//Starts the program by making a mosaic of a random image
var randomImage = document.createElement('img');
setSourceToRandom(randomImage);
window.setTimeout(function() {
    makeMosaicOf(randomImage);
}, 50);
