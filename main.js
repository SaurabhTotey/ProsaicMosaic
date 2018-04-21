/*
 * JavaScript code to make a large image out of a bunch of other smaller images
 * Smaller images can be clicked to become the large image made up of smaller images
 * All images are selected at random from Google Images
 */

//Gets the mosiac table that will store an image in each cell to become the larger image
var table = document.getElementById('mosaic-container');
table.width = window.innerWidth;
table.height = window.innerHeight;

//The constants that represent the resolutions of the outer and inner images; resolutions are squares
var outerResolution = 75;
var innerResolution = Math.min(window.innerHeight, window.innerWidth) / outerResolution;

//How each cell location translates to an ID name
function idForLocation(row, column) {
    return "r:" + row + ";c:" + column;
}

//Initializes the table cells
for (var i = 0; i < outerResolution; i++) {
    table.appendChild(document.createElement('tr'));
    for (var j = 0; j < outerResolution; j++) {
        table.lastChild.appendChild(document.createElement('td'));
        table.lastChild.lastChild.appendChild(document.createElement('img'));
        table.lastChild.lastChild.lastChild.id = idForLocation(i, j);
        table.lastChild.lastChild.lastChild.width = innerResolution;
        table.lastChild.lastChild.lastChild.height = innerResolution;
    }
}
