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
        mosaic.lastChild.width = innerResolution;
        mosaic.lastChild.height = innerResolution;
    }
    mosaic.appendChild(document.createElement('br'));
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
        pixelData.getContext('2d').drawImage(image, 0, 0);
        data = [];
        for (var i = 0; i < outerResolution; i++) {
            data.push([]);
            for (var j = 0; j < outerResolution; j++) {
                data[i][j].push(pixelData.getImageData(j, i, 1, 1).data);
            }
        }
        return data;
    }
    //Gets the dominant color of an image if stretched to innerResolution x innerResolution
    function reduceImageToColor(image) {
        var pixelData = document.createElement('canvas');
        pixelData.width = innerResolution;
        pixelData.height = innerResolution;
        pixelData.getContext('2d').drawImage(image, 0, 0);
        colorCounts = {};
        for (var i = 0; i < innerResolution; i++) {
            for (var j = 0; j < innerResolution; j++) {
                var color = pixelData.getImageData(j, i, 1, 1).data;
                if (!color in colorCounts) {
                    colorCounts[color] = 1;
                } else {
                    colorCounts[color] += 1;
                }
            }
        }
        return Object.keys(colorCounts).reduce((a, b) => obj[a] > obj[b] ? a : b);
    }
}