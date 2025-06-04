const dropdown = document.getElementById('dropdown');
const menu = document.getElementById('dropdownMenu');
let hideTimeout;

dropdown.addEventListener('mouseenter', () => {
  clearTimeout(hideTimeout);
  menu.classList.add('show');
});

dropdown.addEventListener('mouseleave', () => {
  hideTimeout = setTimeout(() => {
    menu.classList.remove('show');
  }, 2000); 
});

function myFunction() {
  var element = document.body;
  element.classList.toggle("dark-mode");
}
