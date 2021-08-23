/* global Flickity */
import { select, templates } from '../settings.js';

class Home {
  constructor (element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }

  render (element) {
    const thisHome = this;
    const generatedHTML = templates.homePage(element);

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets () {
    const thisHome = this;
    const element = document.querySelector(select.widgets.carousel);

    new Flickity(element, {
      // options
      wrapAround: true,
      autoPlay: 2500,
      prevNextButtons: false,
      imagesLoaded: true,
    });

    thisHome.tileLinks = document.querySelectorAll(select.home.tileLinks);
    for (let tileLink of thisHome.tileLinks) {
      tileLink.addEventListener('click', function (event) {
        event.preventDefault();
      });
    }
  }
}

export default Home;
