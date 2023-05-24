// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
// Wait until elements exists in the DOM
export const waitForElement = (selector) => {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

// https://stackoverflow.com/questions/7490660/converting-wind-direction-in-angles-to-text-words
// Get the cardinal direction of a radial number. (0 - 360)
export const getCardinalDirection = (angle) => {
  const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
  return directions[Math.round(angle / 45) % 8];
}