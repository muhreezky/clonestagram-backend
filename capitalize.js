/**
 * 
 * @param {string} str 
 */
function capitalize(str) {
  const lcase = str.toLowerCase().slice(1);
  const first = str.charAt(0).toUpperCase();
  return (first + lcase);
}

module.exports = capitalize;