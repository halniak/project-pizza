import { templates } from './../settings.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element) {
        const thisBooking = this;

        /* generate HTML from template */
        const generatedHTML = templates.bookingWidget;

        /* generate empty object thisBooking.dom */
        thisBooking.dom = {};

        /* add wrapper to thisBooking.dom and assing container to it*/
        thisBooking.dom.wrapper = element;

        /* add generated HTML to wrapper.innerHTML */
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
    }

    initWidgets() {
        console.log('initWidgets');
    }
}

export default Booking;