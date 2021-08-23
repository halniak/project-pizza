import { classNames, settings, select } from './settings.js';
import Booking from './components/Booking.js';
import Cart from './components/Cart.js';
import Product from './components/Product.js';
import Home from './components/Home.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisApp.pages[0].id;

    for (const page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let navLink of thisApp.navLinks) {
      navLink.addEventListener('click', function (event) {
        const thisElement = this;
        event.preventDefault();

        const id = thisElement.getAttribute('href').replace('#', '');

        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* set active class to activated page and remove from non-activated */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* set active class to activated link and remove from non-activated */
    for (let navLink of thisApp.navLinks) {
      navLink.classList.toggle(
        classNames.nav.active,
        navLink.getAttribute('href') == '#' + pageId
      );
    }
  },

  initHome: function () {
    const homeContainer = document.querySelector(select.containerOf.home);
    new Home(homeContainer);
  },

  initMenu: function () {
    const thisApp = this;

    for (const productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);

    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      thisApp.cart.add(event.detail.product);
    });
  },

  initBooking: function () {
    const reservationContainer = document.querySelector(
      select.containerOf.booking
    );
    new Booking(reservationContainer);
  },

  init: function () {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initHome();
    thisApp.initBooking();
  },
};

app.init();

export default app;
