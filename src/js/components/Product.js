import { select, templates, classNames } from './../settings.js';
import {utils} from './../utils.js';
import AmountWidget from './AmountWidget.js';

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
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable);
    
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form);
    
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs);
    
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton);
    
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem);
    
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper);
    
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget);
    
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
      const activeProduct = document.querySelector(
        select.all.menuProductsActive);
      
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
    thisProduct.priceSingle = thisProduct.data.price;

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
        const optionImage = thisProduct.imageWrapper.querySelector(
          '.' + paramId + '-' + optionId);
        
        if (formData[paramId].includes(optionId)) {
          if (optionImage !== null) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
          if (!option['default']) {
            thisProduct.priceSingle += option['price'];
          }
        } else if (!formData[paramId].includes(optionId)) {
          if (optionImage !== null) {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (option['default']) {
            thisProduct.priceSingle -= option['price'];
          }
        }
      }
    }

    /* multiply price by amount */
    const price = thisProduct.priceSingle * thisProduct.amountWidget.value;

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

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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
      const param = thisProduct.data.params[paramId];

      /* [DONE] initialize label and options */
      params[paramId] = {
        label: param.label,
        options: {},
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

export default Product;