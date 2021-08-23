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
    /*     console.log(element);
    console.log(generatedHTML);
    console.log(utils.createDOMFromHTML(generatedHTML)); */

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets () {
    const element = document.querySelector(select.widgets.carousel);
    new Flickity(element, {
      // options
      //cellAlign: 'left',
      //contain: true,
      wrapAround: true,
      autoplay: true,
      imagesLoaded: true,
    });
  }
}

export default Home;
