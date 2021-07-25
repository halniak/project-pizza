import { select, templates } from './../settings.js';
import { utils } from './../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor (element) {
    const thisBooking = this;

    thisBooking.render(element);
    //thisBooking.initWidgets();
  }

  render (element) {
    const thisBooking = this;

    /* generate HTML from template */
    const generatedHTML = templates.bookingWidget(element);

    /* generate empty object thisBooking.dom */
    thisBooking.dom = {};

    thisBooking.dom.peopleAmount = element.querySelector(
      select.booking.peopleAmount
    );
    console.log(thisBooking.dom.peopleAmount); //dlaczego null ?!?

    thisBooking.dom.hoursAmount = element.querySelector(
      select.booking.hoursAmount
    );

    /* add wrapper to thisBooking.dom and assing container to it*/
    thisBooking.dom.wrapper = element;

    /* add generated HTML to wrapper.innerHTML */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets () {
    const thisBooking = this;
    console.log(thisBooking.dom);
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      console.log('initWidgets');
    });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
