# ascii_art_maker

The primary goal is to create an easy-to-use editor. The DOM approach is significantly simpler to implement and maintain. The performance concerns are not a major issue for typical ASCII art dimensions (e.g., up to 150x150). The complexity of the <canvas> approach would introduce a steep development curve for features that the DOM gives us for free. We will build on the shoulders of giants by using the well-established pattern of a CSS-styled grid of <span> elements.
