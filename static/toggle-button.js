const dropdownMenu = document.getElementById("dropdown-menu");
const dropdownBtn = document.getElementById("dropdown-btn");
const toggleDropdown = () => {
  dropdownBtn.classList.toggle("show");
  dropdownMenu.classList.toggle("show");
};
dropdownBtn.addEventListener("click", e => {
  e.stopPropagation();
  toggleDropdown();
});
document.addEventListener("click", e => {
  if (dropdownMenu.classList.contains("show")) {
    toggleDropdown();
  }
});
