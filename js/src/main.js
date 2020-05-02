
function onClick() {
    var element = document.getElementById("popup");
    element.style.display = "block";
}

function onClick1() {
    var element = document.getElementById("popup1");
    element.style.display = "block";
}

function onClick2() {
    var element = document.getElementById("popup1");
    element.style.display = "none";
    var element = document.getElementById("popup");
    element.style.display = "none";
}