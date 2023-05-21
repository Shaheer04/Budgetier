var mealPrices = 860;
var departureCity;
var arrivalCity;
var flightClass = "Economy";
var adults = 0;
var children = 0;
var nextDestination;
var meals = 2;
var airline;

$(document).ready(function () {
  $("#txtAirlines").selectize({
    delimiter: ",",
    persist: false,
    placeholder: "Select Airline",
    options: null,
    labelField: "item",
    valueField: "item",
    onChange: function (value) {
      airline = value;
      CalculateBudget();
    },
  });

  $("#txtClass").selectize({
    placeholder: "Select Flight Class",
    onChange: function (value) {
      flightClass = value;
      CalculateBudget();
    },
  });

  var departureCities = _.uniq(flights.map((x) => x.from))
    .sort()
    .map(function (x) {
      return { item: x };
    });

  $("#txtDepartureCity").selectize({
    delimiter: ",",
    placeholder: "Select Departure",
    persist: false,
    options: departureCities,
    labelField: "item",
    valueField: "item",
    onChange: function (value) {
      departureCity = value;
      PopulateAirlines();
      CalculateBudget();
    },
  });

  var arrivalCities = _.uniq(flights.map((x) => x.to))
    .sort()
    .map(function (x) {
      return { item: x };
    });

  $("#txtArrivalCity").selectize({
    delimiter: ",",
    persist: false,
    placeholder: "Select Arrival",
    options: arrivalCities,
    labelField: "item",
    valueField: "item",
    onChange: function (value) {
      arrivalCity = value;
      $("#btnAddNewRow").prop("disabled", false);
      PopulateAirlines();
      PopulateNextDestination();
      CalculateBudget();
    },
  });
});

function PopulateAirlines() {
  var airlines = _.uniq(
    _.filter(flights, function (row) {
      return row.from == departureCity && row.to == arrivalCity;
    }).map((x) => x.airline)
  )
    .sort()
    .map(function (x) {
      return { item: x };
    });

  var selectize = $("#txtAirlines")[0].selectize;
  selectize.clear();
  selectize.clearOptions();
  selectize.load(function (callback) {
    callback(airlines);
  });
}

function AdultsChanged(e) {
  adults = $(e).val();
  CalculateBudget();
}

function ChildrenChanged(e) {
  children = $(e).val();
  CalculateBudget();
}

function PopulateNextDestination() {
  $(
    $("#table-row-1").children()[0]
  ).children()[0].innerHTML = `<option value="${arrivalCity}">${arrivalCity}</option>`;

  DestinationChanged($($("#table-row-1").children()[0]).children()[0]);
}

function DestinationChanged(e) {
  var hotelsSelect = $(e).parent().parent().children()[2].children[0];

  var availableHotels = _.filter(hotels, function (x) {
    return x.HotelAddress == e.value;
  });

  var html = "";

  for (var i = 0; i < availableHotels.length; i++)
    html += `<option value="${availableHotels[i].HotelName}">${availableHotels[i].HotelName}</option>`;

  hotelsSelect.innerHTML = html;

  var rowIndex = $($(e).parent()).parent()[0].rowIndex;

  var transportSelect = $(e).parent().parent().children()[1].children[0];

  var tableRows = $("#tblDestinations tbody").children().length;

  if (tableRows > 1) {
    var lastDestination = $(
      $("#tblDestinations tbody").children()[rowIndex - 2]
    ).children()[0].children[0].value;

    if (rowIndex != 1) {
      var availableTransports = _.filter(transport, function (x) {
        return x.departureCity == lastDestination && x.arrivalCity == e.value;
      });

      transportSelect.innerHTML = "";
      for (var i = 0; i < availableTransports.length; i++)
        transportSelect.innerHTML += `<option value="${availableTransports[i].type}">${availableTransports[i].type}</option>`;
    }
  }

  CalculateBudget();
}

function TransportChanged(e) {
  CalculateBudget();
}

function HotelChanged(e) {
  CalculateBudget();
}

function DaysChanged(e) {
  CalculateBudget();
}

function AddNewDestination() {
  var tableRows = $("#tblDestinations tbody").children().length;

  var lastDestination = $(
    $("#tblDestinations tbody").children()[tableRows - 1]
  ).children()[0].children[0].value;
  $("#tblDestinations tbody").append(`<tr id="table-row-${tableRows + 1}">
        <td><select class="txtDestination form-select" onchange="DestinationChanged(this)">${
          lastDestination == "Mecca"
            ? '<option value = "Medina">Medina</option><option value = "Jeddah">Jeddah</option>'
            : lastDestination == "Medina"
            ? '<option value = "Mecca">Mecca</option><option value = "Jeddah">Jeddah</option>'
            : '<option value = "Mecca">Mecca</option><option value="Medina">Medina</option>'
        }</select></td>
        <td><select class="txtTransport form-select" onchange="TransportChanged(this)"></select></td>
        <td><select class="txtHotels form-select" onchange="HotelChanged(this)"></select></td>
        <td><input type="number" class="form-control" min="0" value="1" onchange="DaysChanged(this)"></td>
    </tr>`);

  DestinationChanged(
    $($("#tblDestinations tbody").children()[tableRows]).children()[0]
      .children[0]
  );
}

function MealsChanged(e) {
  meals = $(e).val();
  CalculateBudget();
}

function CalculateBudget() {
  var amount = 0;

  if (!arrivalCity) return;
  else if (!airline) return;
  else if (!flightClass) return;

  var flight = _.find(flights, function (x) {
    return (
      x.from == departureCity && x.to == arrivalCity && x.airline == airline
    );
  });

  flightPrice =
    flightClass == "Economy" ? flight.economy_price : flight.business_price;

  amount += flightPrice * adults;

  amount += flightPrice - ((flightPrice * 25) / 100) * children;

  var rowCount = $("#tblDestinations tbody").children().length;

  var transportCost = 0;
  var hotelCost = 0;
  var totalDays = 0;

  for (var i = 0; i < rowCount; i++) {
    var transportType = $(
      $("#tblDestinations tbody").children()[i]
    ).children()[1].children[0].value;

    var hotel = $($("#tblDestinations tbody").children()[i]).children()[2]
      .children[0].value;

    var days = $($("#tblDestinations tbody").children()[i]).children()[3]
      .children[0].value;

    var currentDestination = $(
      $("#tblDestinations tbody").children()[i]
    ).children()[0].children[0].value;

    var rowIndex = $("#tblDestinations tbody").children()[i].rowIndex;

    if (transportType && transportType != "") {
      var lastDestination = $(
        $("#tblDestinations tbody").children()[rowIndex - 2]
      ).children()[0].children[0].value;

      transportCost += _.find(transport, function (x) {
        return x.departureCity == lastDestination &&
          x.arrivalCity == currentDestination &&
          x.type == transportType;
      }).price * 75;
    }

    if (hotel && hotel != "") {
      hotelCost +=
        _.find(hotels, function (x) {
          return x.HotelName == hotel;
        }).Price *
        75 *
        parseFloat(days);

      totalDays += parseFloat(days);
    }
  }

  amount += transportCost;
  amount += hotelCost;
  amount += meals * mealPrices * totalDays;
  
  $('#lblBudget').text(amount.toLocaleString());
}
