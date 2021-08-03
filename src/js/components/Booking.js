import { classNames, select, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor (element) {
    const thisBooking = this;

    thisBooking.tableSelected = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData () {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        const bookingData = {
          bookings: bookings,
          eventsCurrent: eventsCurrent,
          eventsRepeat: eventsRepeat,
        };
        thisBooking.parseData(bookingData);
      });
  }

  parseData (bookingData) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookingData.bookings) {
      thisBooking.makeBooked(item);
    }

    for (let item of bookingData.eventsCurrent) {
      thisBooking.makeBooked(item);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of bookingData.eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          item.date = utils.dateToStr(loopDate);
          thisBooking.makeBooked(item);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked (item) {
    const thisBooking = this;

    if (typeof thisBooking.booked[item.date] == 'undefined') {
      thisBooking.booked[item.date] = {};
    }

    const startHour = utils.hourToNumber(item.hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + item.duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[item.date][hourBlock] == 'undefined') {
        thisBooking.booked[item.date][hourBlock] = [];
      }
      thisBooking.booked[item.date][hourBlock].push(item.table);
    }
  }

  updateDOM () {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = element.querySelector(select.booking.floorPlan);
    thisBooking.dom.form = element.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.form.querySelector(
      select.booking.phone
    );
    thisBooking.dom.address = thisBooking.dom.form.querySelector(
      select.booking.address
    );
    thisBooking.dom.starters = thisBooking.dom.form.querySelectorAll(
      select.booking.starters
    );
  }

  initWidgets () {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      thisBooking.removeTableSelection();
    });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      thisBooking.removeTableSelection();
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function () {
      thisBooking.removeTableSelection();
    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function () {
      thisBooking.removeTableSelection();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.prepareBooking();
    });
  }

  initTables (event) {
    event.preventDefault();

    const thisBooking = this;
    const element = event.target;

    const isTable = element.classList.contains(classNames.booking.table);
    const isBooked = element.classList.contains(classNames.booking.tableBooked);
    const isSelected = element.classList.contains(
      classNames.booking.tableSelected
    );

    if (isTable && !isBooked) {
      thisBooking.removeTableSelection();
      if (!isSelected) {
        element.classList.toggle(classNames.booking.tableSelected);
        thisBooking.tableSelected = parseInt(
          element.getAttribute('data-table')
        );
      }
    }
  }

  removeTableSelection () {
    const thisBooking = this;

    for (const table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.tableSelected);
    }
    thisBooking.tableSelected = [];
  }

  prepareBooking () {
    const thisBooking = this;

    if (thisBooking.tableSelected != null) {
      if (thisBooking.tableSelected.length == 0) {
        thisBooking.tableSelected = null;
      }
    }

    let payload = {};
    payload.date = thisBooking.datePicker.value;
    payload.hour = thisBooking.hourPicker.value;
    payload.table = thisBooking.tableSelected;
    payload.duration = thisBooking.hoursAmount.value;
    payload.ppl = thisBooking.peopleAmount.value;
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;
    payload.starters = [];
    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    const fetchArgs = {
      url: settings.db.url + '/' + settings.db.booking,
      payload: payload,
    };
    thisBooking.send(fetchArgs);

    thisBooking.makeBooked(payload);
  }

  send (fetchArgs) {
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(fetchArgs.payload),
    };

    fetch(fetchArgs.url, options);
  }
}

export default Booking;
