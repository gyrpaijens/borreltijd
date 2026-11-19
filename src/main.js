// Startpunt. De volgorde is bewust gelijk aan het originele HTML-bestand:
// eerst de lasers en het vuurwerk (eigen canvassen), dan de app zelf.
import './styles.css';
import './fx/lasers.js';
import './fx/fireworks.js';
import './legacy/borreltijd-app.js'; // mount de React-app in #root
