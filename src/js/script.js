/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      thisProduct.processOrder();
      console.log('menu product: ', thisProduct);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
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
          console.log('activeProduct: ', activeProduct);
          activeProduct.classList.remove('active');
        }

        /* [DONE] toggle class active on thisProduct.element */
        thisProduct.element.classList.toggle('active');
        console.log('thisProduct.element.classList: ', thisProduct.element.classList);
      });
    }

    initOrderForm() {
      const thisProduct = this;
      console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      console.log('thisProduct.formInputs: ', thisProduct.formInputs);
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        /* dodaj produkt do koszyka */
      });
    }

    processOrder() {
      const thisProduct = this;

      /* [DONE] convert form to object structure */
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData: ', formData);

      /* [DONE] set price to default price */
      let price = thisProduct.data.price;

      /* [DONE] for every category in sourceData */
      for (let paramId in thisProduct.data.params) {
        console.log('param key: ', paramId);
        const param = thisProduct.data.params[paramId];

        /* [DONE] for every option in category */
        for (let optionId in param.options) {

          /* [DONE] determine option value */
          const option = param.options[optionId];
          console.log('optionId: ', optionId);

          /* [DONE] adjust price and product image */
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if (formData[paramId].includes(optionId)) {
            if (optionImage !== null) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            if (!option['default']) {
              price += option['price'];
            }
          }

          else if (!formData[paramId].includes(optionId)) {
            if (optionImage !== null) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            if (option['default']) {
              price -= option['price'];
            }
          }
        }
      }

      /* [DONE] update price in price element */
      thisProduct.priceElem.innerHTML = price;
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp data: ', thisApp.data);

      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
