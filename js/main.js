"use strict";

var chain = null;

var gui;

// Define p5.gui variables and their ranges

// Number of links
var numLinks = 3;
var previousNumLinks = numLinks;
var numLinksMin = 1;
var numLinksMax = 5;

// Length of each link
var lenValue = 100;
var previousLenValue = lenValue;
var lenValueMin = 10;
var lenValueMax = 200;

function draw() {
    clear();

    // Check if user has selected new value for number of links in p5.gui
    // If yes, re-initialize chain
    if (previousNumLinks != numLinks) {
        previousNumLinks = numLinks;
        setup();
    }


    // Check if user has selected new value for length of a link in p5.gui
    // If yes, re-initialize chain
    if (previousLenValue != lenValue) {
        previousLenValue = lenValue;
        setup();
    }

    // Set background colour
    background(220);

    // Create the static rigid support for the chain (horizontal bar)
    strokeWeight(12);
    stroke('#000000');
    line(windowWidth / 2 - 35, 197, windowWidth / 2 + 35, 197);

    // Render the chain of links
    chain.draw();
}

function setup() {

    createCanvas(windowWidth, windowHeight);

    // Initialize p5.gui
    // sliderRange(0, 90, 1);
    gui = createGui('p5.gui');
    gui.addGlobals('numLinks', 'lenValue');


    // Define Link object
    function Link(x, y, angle, len, color, childLink) {
        this.x = x;
        this.y = y;
        this.len = len;
        this.angle = angle;
        this.color = color;
        this.childLink = childLink;
        return this;
    }

    // Attach a child link to parent link
    Link.prototype.appendchildLink = function (childLink) {
        this.childLink = childLink;
    }

    // Render the chain
    Link.prototype.draw = function () {
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        strokeWeight(8);
        stroke(this.color);
        line(0, 0, this.len, 0);

        // Recursively draw the children
        this.childLink && this.childLink.draw();
        pop();
    }

    // Inverse Kinematics CCD Algorithm
    Link.prototype.inverseKinematics = function (target) {

        // The child link coordinates are defined with respect to the parent space
        // Define the coordinates with respect to the canvas coordinates
        let currentTarget = rotatePoint(target[0] - this.x, target[1] - this.y, -this.angle);

        let endTarget = void 0;

        let childExists = this.childLink;
        let calculatedEndTarget;

        if (childExists) {
            calculatedEndTarget = this.childLink.inverseKinematics(currentTarget);
        }
        else {
            calculatedEndTarget = [this.len, 0];
        }

        endTarget = calculatedEndTarget;

        let firstAngle = calculateAngle(currentTarget[0], currentTarget[1]);
        let secondAngle = calculateAngle(endTarget[0], endTarget[1]);
        let changeInAngle = firstAngle - secondAngle;

        this.angle += changeInAngle;

        let newXY = rotatePoint(endTarget[0], endTarget[1], this.angle);
        return translatePoint(newXY[0], newXY[1], this.x, this.y);
    }

    // Initialize the chain
    function initialize() {
        var chainlen = numLinks;
        let initialX = windowWidth / 2;
        let initialY = 200;

        // Equal to 90 degrees
        let initialAngle = 1.5708;
        let len = lenValue;

        let colors = ['#ffb37f', '#5fa6bf', '#137ea8', '#9a6356'];

        for (let i = 0; i < chainlen; i++) {
            let colorIndex = i % 4;

            // Top most one-end fixed link
            if (i == 0) {
                chain = new Link(initialX, initialY, initialAngle, len, colors[colorIndex]);
                var copyOfChain = chain;
                initialX = len;
                initialY = 0;
                initialAngle = 0;
            }

            // All the other links below the first
            else {
                copyOfChain.appendchildLink(new Link(initialX, initialY, initialAngle, len, colors[colorIndex]));
                copyOfChain = copyOfChain.childLink;
            }
        }
    }

    initialize();
}

// Given two points, xCoord and yCoord, and an angle, apply rotation
function rotatePoint(xCoord, yCoord, angle) {
    return [xCoord * Math.cos(angle) - yCoord * Math.sin(angle), xCoord * Math.sin(angle) + yCoord * Math.cos(angle)];
}

// Given two points, xCoord and yCoord, and change in X (deltaX) and change in Y (deltaY), apply translation
function translatePoint(xCoord, yCoord, deltaX, deltaY) {
    return [xCoord + deltaX, yCoord + deltaY];
}

// Given two points, find the inverse tan angle between them
function calculateAngle(xCoord, yCoord) {
    return Math.atan2(yCoord, xCoord);
}

// Apply inverse kinematics algorithm on chain whenever mouse movement is detected
function mouseMoved() {
    for (let i = 0; i < 10; i++) {
        chain.inverseKinematics([mouseX, mouseY]);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}