export const stripHtml = (html) => {
  // Create a temporary div to parse HTML
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const formatForDisplay = (content) => {
  // For typing animation, we need plain text
  return stripHtml(content);
};
