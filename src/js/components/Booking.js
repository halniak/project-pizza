import { select, templates } from './../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor (element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render (element) {
    const thisBooking = this;

    /* generate HTML from template */
    const generatedHTML = templates.bookingWidget(element);

    /* generate empty object thisBooking.dom */
    thisBooking.dom = {};

    /* add wrapper to thisBooking.dom and assing container to it*/
    thisBooking.dom.wrapper = element;

    /* add generated HTML to wrapper.innerHTML */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(
      select.booking.peopleAmount
    );

    thisBooking.dom.hoursAmount = element.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePicker = element.querySelector(
      select.widgets.datePicker.wrapper
    );

    thisBooking.dom.hourPicker = element.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }

  initWidgets () {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});

    thisBooking.date = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function () {});

    thisBooking.hour = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function () {});
  }
}

export default Booking;
