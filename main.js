/*
 * JavaScript code to make a large image out of a bunch of other smaller images
 * Smaller images can be clicked to become the large image made up of smaller images
 * All images are selected at random from Google Images
 */

//Gets the mosiac table that will store an image in each cell to become the larger image
var table = document.getElementById('mosaic-container');

//The constant that represents the resolution that all images will be reduced to
var resolution = 250;

//How each cell location translates to an ID name
function idForLocation(row, column) {
    return "r:" + row + ";c:" + column;
}

//Initializes the table cells
for (var i = 0; i < resolution; i++) {
    table.appendChild(document.createElement('tr'));
    for (var j = 0; j < resolution; j++) {
        var currentCell = document.createElement('td');
        currentCell.id = idForLocation(i, j);
        table.lastChild.appendChild(currentCell);
    }
}