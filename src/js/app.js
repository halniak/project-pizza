const app = {
  initMenu: function () {
    const thisApp = this;

    for (const productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        console.log('rawResponse: ', rawResponse);
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);

        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);

    thisApp.cart = new Cart(cartElem);
  },

  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
