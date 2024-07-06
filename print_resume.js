(async () => {
  const element = document.querySelector("#cv-container");
  if (!element) {
    console.error('Element not found!');
    return;
  }

  // Helper function to copy computed styles
  const copyComputedStyles = (src, dest) => {
    const computedStyle = getComputedStyle(src);
    for (let i = 0; i < computedStyle.length; i++) {
      dest.style[computedStyle[i]] = computedStyle.getPropertyValue(computedStyle[i]);
    }
    for (let i = 0; i < src.children.length; i++) {
      copyComputedStyles(src.children[i], dest.children[i]);
    }
  };

  // Clone the element and apply computed styles
  const clonedElement = element.cloneNode(true);
  copyComputedStyles(element, clonedElement);

  // Inline all the CSS styles
  const inlineAllStyles = (element) => {
    const styleElement = document.createElement('style');
    styleElement.textContent = '';
    const elements = element.querySelectorAll('*');
    for (const el of elements) {
      const computedStyle = getComputedStyle(el);
      let cssText = '';
      for (let i = 0; i < computedStyle.length; i++) {
        cssText += `${computedStyle[i]}: ${computedStyle.getPropertyValue(computedStyle[i])}; `;
      }
      styleElement.textContent += `${el.tagName.toLowerCase()} { ${cssText} } `;
    }
    element.appendChild(styleElement);
  };

  // Inline styles for the cloned element
  inlineAllStyles(clonedElement);

  // Create a new window and write the cloned element's HTML into it
  const newWindow = window.open('', '');
  newWindow.document.write(`
    <html>
      <head>
        <title>Print PDF</title>
        ${Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(style => style.outerHTML).join('\n')}
        <style>
          body, html { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${clonedElement.outerHTML}
      </body>
    </html>
  `);
  newWindow.document.close();

  // Wait for the new window to finish loading
  await new Promise(resolve => newWindow.onload = resolve);

  // Ensure all images and resources are loaded
  const images = newWindow.document.images;
  const imagePromises = Array.from(images).map(img => new Promise(resolve => {
    if (img.complete) {
      resolve();
    } else {
      img.onload = img.onerror = resolve;
    }
  }));

  await Promise.all(imagePromises);

  // Use the print function to print the new window
  newWindow.print();
})();