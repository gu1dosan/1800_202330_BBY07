
// Get the current URL
const currentUrl = window.location.href;

// Get all the menu items
const menuItems = document.querySelector('footer.fixed-bottom').querySelectorAll('a');

// Iterate through each menu item
menuItems.forEach(menuItem => {
  // Get the URL of the menu item
  const menuItemUrl = menuItem.getAttribute('href');
  console.log(menuItemUrl, currentUrl);

  // Check if the menu item URL matches the current URL
  if (currentUrl.includes(menuItemUrl.slice(1))) {
    menuItem.style.backgroundColor = '#f2f2f2';
    menuItem.style.fontWeight = '700';
    // menuItem.style.fontSize = '1.2rem';
  }
});
