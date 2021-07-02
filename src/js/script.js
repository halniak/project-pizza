/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log('menu product: ', thisProduct);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    renderInMenu() {
      const thisProduct = this;

      /* [DONE] generate HTML of single product */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* [DONE] create DOM element based on HTML code */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* [DONE] find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* [DONE] insert DOM element into container */
      menuContainer.appendChild(thisProduct.element);
    }

    initAccordion() {
      const thisProduct = this;

      /* [DONE] add event listener to clickable trigger */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {

        /* [DONE] prevent default action for event */
        event.preventDefault();

        /* [DONE] find active elements and remove class active if it is not thisProduct.element */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          //console.log('activeProduct: ', activeProduct);
          activeProduct.classList.remove('active');
        }

        /* [DONE] toggle class active on thisProduct.element */
        thisProduct.element.classList.toggle('active');
        //console.log('thisProduct.element.classList: ', thisProduct.element.classList);
      });
    }

    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      //console.log('thisProduct.formInputs: ', thisProduct.formInputs);
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        /* dodaj produkt do koszyka */
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;

      /* [DONE] convert form to object structure */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ', formData);

      /* [DONE] set price to default price */
      //let price = thisProduct.data.price;

      /* [DONE] set single price to default price */
      thisProduct.priceSingle = thisProduct.data.price;//------

      /* [DONE] for every category in sourceData */
      for (let paramId in thisProduct.data.params) {
        //console.log('param key: ', paramId);
        const param = thisProduct.data.params[paramId];

        /* [DONE] for every option in category */
        for (let optionId in param.options) {

          /* [DONE] determine option value */
          const option = param.options[optionId];
          //console.log('optionId: ', optionId);

          /* [DONE] adjust price and product image */
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if (formData[paramId].includes(optionId)) {
            if (optionImage !== null) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            if (!option['default']) {
              thisProduct.priceSingle += option['price'];
            }
          }
          else if (!formData[paramId].includes(optionId)) {
            if (optionImage !== null) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            if (option['default']) {//------------
              thisProduct.priceSingle -= option['price'];//------
            }
          }
        }
      }

      /* multiply price by amount */
      let price = thisProduct.priceSingle * thisProduct.amountWidget.value; //-----------------

      /* [DONE] update price in price element */
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      // dlaczego ten sposob nie dziala?
      /* thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder()); */

      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = productSummary.amount * productSummary.priceSingle;
      productSummary.params = thisProduct.prepareCartProductParams();

      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      /* [DONE] convert form to object structure */
      const formData = utils.serializeFormToObject(thisProduct.form);

      const params = {};

      /* [DONE] for every category in sourceData */
      for (let paramId in thisProduct.data.params) {
        console.log('param key: ', paramId);
        const param = thisProduct.data.params[paramId];

        /* [DONE] initialize label and options */
        params[paramId] = {
          label: param.label,
          options: {}
        };

        /* [DONE] for every option in category */
        for (let optionId in param.options) {

          /* [DONE] determine option value and add label to product params */
          const option = param.options[optionId];

          /* [DONE] add label to product params if option was chosen */
          if (formData[paramId].includes(optionId)) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor argument: ', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      /* [DONE] add validation */
      if (newValue !== thisWidget.value && !isNaN(newValue)) {
        if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
          thisWidget.value = newValue;

          thisWidget.announce();
        }
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault;
        thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault;
        thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    // konstruktor tej klasy oczekuje na przekazanie referencji do diva, w którym ten koszyk ma być obecny
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new cart: ', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      console.log('Cart.add: ', menuProduct);

      const thisCart = this;

      /* [DONE] generate HTML of added product */
      const generatedHTML = templates.cartProduct(menuProduct);

      /* [DONE] create DOM element based on HTML code */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* [DONE] insert DOM element into container */
      thisCart.dom.productList.appendChild(generatedDOM);
    }
  }


  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp data: ', thisApp.data);

      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
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
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
