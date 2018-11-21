/*
 * JavaScript code to make a large image out of a bunch of other smaller images
 * Smaller images can be clicked to become the large image made up of smaller images
 * All images are selected at random from Flickr
 */

//Gets the mosiac element that will store a bunch of images to become a larger image
let mosaic = document.getElementById('mosaic-container');
mosaic.width = window.innerWidth;
mosaic.height = window.innerHeight;

//The constants that represent the resolutions of the outer and inner images; resolutions are squares
let outerResolution = 75;
let innerResolution = Math.min(window.innerHeight, window.innerWidth) / outerResolution;

//How much each inner image can differ from the overall image in terms of color
let colorFaultTolerance = 100;
//Whether the images can be used repeatedly for similar colors
let allowConsecutiveRepeats = true;

//How each image location translates to an ID name
function idForLocation(row, column) {
    return "r:" + row + ";c:" + column;
}

//Initializes the image elements
for (let i = 0; i < outerResolution; i++) {
    for (let j = 0; j < outerResolution; j++) {
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
    for (let i = 0; i < outerResolution; i++) {
        for (let j = 0; j < outerResolution; j++) {
            if (document.getElementById(idForLocation(i, j)).src.endsWith("null.png")) {
                return false;
            }
        }
    }
    return true;
}

//Takes in an image and sets its source to a random image from Flickr
function setSourceToRandom(image) {
    return new Promise(resolve => {
        $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
            {
                tagmode: "any",
                format: "json"
            },
            function (data) {
                let rnd = Math.floor(Math.random() * data.items.length);
                image.crossOrigin = "Anonymous";
                newSource = data.items[rnd]['media']['m'].replace("_m", "_b");
                if (newSource.includes("photo_unavailable")) {
                    throw new Error("Couldn't set image source to random: requested image was unavailable, please try again.");
                }
                image.onload = () => resolve();
                image.src = newSource;
            }
        );
    });
}

//Gets a 2d array of colors that represents the image; dimensions are outerResolution x outerResolution
function getPixelDataForImage(image) {
    let pixelData = document.createElement('canvas');
    pixelData.width = outerResolution;
    pixelData.height = outerResolution;
    let renderer = pixelData.getContext('2d');
    renderer.drawImage(image, 0, 0, outerResolution, outerResolution);
    data = [];
    for (let i = 0; i < outerResolution; i++) {
        data.push([]);
        for (let j = 0; j < outerResolution; j++) {
            data[i].push(renderer.getImageData(j, i, 1, 1).data);
        }
    }
    return data;
}

//Gets the dominant color of an image if stretched to innerResolution x innerResolution
function reduceImageToColor(image) {
    let pixelData = document.createElement('canvas');
    pixelData.width = innerResolution;
    pixelData.height = innerResolution;
    let renderer = pixelData.getContext('2d');
    renderer.drawImage(image, 0, 0, innerResolution, innerResolution);
    colorCounts = {};
    for (let i = 0; i < innerResolution; i++) {
        for (let j = 0; j < innerResolution; j++) {
            let color = renderer.getImageData(j, i, 1, 1).data;
            if (color in colorCounts) {
                colorCounts[color] += 1;
            } else {
                colorCounts[color] = 1;
            }
        }
    }
    let mostAbundantColor = JSON.parse("[" + Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b) + "]");
    // if (colorCounts[mostAbundantColor] < image.width * image.height * 0.35) {
    //     mostAbundantColor = null;
    // }
    return mostAbundantColor;
}

//Gets whether two colors are close enough to each other with the color difference tolerance
function colorsWithinTolerance(firstColor, secondColor) {
    let rMean = (firstColor[0] + secondColor[0]) / 2.0;
    let rDistance = firstColor[0] - secondColor[0];
    let gDistance = firstColor[1] - secondColor[1];
    let bDistance = firstColor[2] - secondColor[2];
    return (2.0 + rMean / 256.0) * rDistance * rDistance + 4.0 * gDistance * gDistance + (2.0 + (255.0 - rMean) / 256.0) * bDistance * bDistance <= Math.pow(colorFaultTolerance, 2);
}

//The actual function that handles making a mosaic of an image
function makeMosaicOf(image) {
    //Sets all images to have no source
    for (let i = 0; i < outerResolution; i++) {
        for (let j = 0; j < outerResolution; j++) {
            document.getElementById(idForLocation(i, j)).src = "null.png";
        }
    }
    //The colors for the image to draw
    let outerImageColors = getPixelDataForImage(image);
    //The actual part of the program that sets the mosaic
    let mosaicFiller = window.setInterval(async () => {
        if (isMosaicComplete()) {
            window.clearInterval(mosaicFiller);
            return;
        }
        let innerImageCandidate = document.createElement('img');
        await setSourceToRandom(innerImageCandidate);
        try {
            let imageCandidateColor = reduceImageToColor(innerImageCandidate);
            // if (imageCandidateColor == null) {
            //     return
            // }
            for (let i = 0; i < outerResolution; i++) {
                for (let j = 0; j < outerResolution; j++) {
                    let currentImg = document.getElementById(idForLocation(i, j));
                    if (currentImg.src.endsWith("null.png") && colorsWithinTolerance(outerImageColors[i][j], imageCandidateColor)) {
                        currentImg.src = innerImageCandidate.src;
                        if (!allowConsecutiveRepeats) {
                            return;
                        }
                    }
                }
            }
        } catch (e) { console.log(e); }
    }, 50);
}

//Starts the program by making a mosaic of a random image
let randomImage = document.createElement('img');
(async () => {
    await setSourceToRandom(randomImage);
    
    console.log(randomImage.src);

    makeMosaicOf(randomImage);

    let iconElement = document.createElement("link");
    iconElement.rel = "icon";
    iconElement.href = randomImage.src;
    document.getElementsByTagName("head")[0].appendChild(iconElement);
})();
