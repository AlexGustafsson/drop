import "./style.css"

function helloWorld() {
  alert("Hello, World!!!");
}

async function main() {
  document.getElementById("button").addEventListener("click", helloWorld);
}

document.addEventListener("DOMContentLoaded", main);
