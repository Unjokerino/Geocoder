ymaps.ready(init);
let current_adress = "";
let current_coords = "";
let error_kinds = ["hydro", "vegetation"];
let current_adress_input = document.querySelector("#map_adress");
let current_coords_input = document.querySelector("#map_coords");

function init() {
  var placeMark;
  myMap = new ymaps.Map(
    "map",
    {
      center: [57.1076545712598, 65.57202407215911],
      zoom: 12,
      controls: ["zoomControl", "geolocationControl"]
    },
    {
      searchControlProvider: null
    }
  );
  current_adress_input.addEventListener("change", function(e) {
    if (e.target.value === "") {
      myMap.geoObjects.remove(placeMark);
      placeMark = false;
    }
  });

  myMap.events.add("click", function(e) {
    var coords = e.get("coords");

    if (placeMark) {
      placeMark.geometry.setCoordinates(coords);
    } else {
      placeMark = createPlacemark(coords);
      myMap.geoObjects.add(placeMark);

      placeMark.events.add("dragend", function() {
        getAddress(placeMark.geometry.getCoordinates());
      });
    }
    getAddress(coords);
  });

  function createPlacemark(coords) {
    return new ymaps.Placemark(
      coords,
      {},
      {
        preset: "islands#icon",
        iconColor: "#0095b6",
        draggable: true
      }
    );
  }
  var suggestView = new ymaps.SuggestView("map_adress", {
    provider: {
      suggest: function(request, options) {
        var parseItems = ymaps
          .suggest("Россия, " + request)
          .then(function(items) {
            return filterAdresses(items);
          });
        return parseItems;
      }
    }
  });

  function filterAdresses(items) {
    for (var i = 0; i < items.length; i++) {
      var displayNameArr = items[i].displayName.split(",");

      var newDisplayName = [];

      for (var j = 0; j < displayNameArr.length; j++) {
        if (displayNameArr[j].indexOf("район") == -1) {
          if (displayNameArr[j].indexOf("Россия") == -1) {
            newDisplayName.push(displayNameArr[j]);
          }
        }
      }

      items[i].displayName = newDisplayName.join();
    }
    return items;
  }

  function filterAdress(items) {
    var displayNameArr = items.split(",");
    var newDisplayName = [];
    for (var j = 0; j < displayNameArr.length; j++) {
      if (displayNameArr[j].indexOf("район") == -1) {
        if (displayNameArr[j].indexOf("Россия") == -1) {
          newDisplayName.push(displayNameArr[j]);
        }
      }
    }
    return newDisplayName;
  }

  suggestView.events.add("select", function(e) {
    current_adress_input.value = filterAdress(e.get("item").value).join();
    document.querySelector(".message").innerHTML = "";
    ymaps
      .geocode(e.get("item").value, {
        results: 1
      })
      .then(function(res) {
        var firstGeoObject = res.geoObjects.get(0),
          coords = firstGeoObject.geometry.getCoordinates();
        kind = firstGeoObject.properties.get(
          "metaDataProperty.GeocoderMetaData.kind"
        );

        error_kinds.forEach(error => {
          kind === error ? showError() : "";
        });

        bounds = firstGeoObject.properties.get("boundedBy");

        if (placeMark) {
          placeMark.geometry.setCoordinates(coords);
        } else {
          placeMark = createPlacemark(coords);
          myMap.geoObjects.add(placeMark);

          placeMark.events.add("dragend", function() {
            getAddress(placeMark.geometry.getCoordinates());
          });
        }

        myMap.setBounds(bounds, {
          checkZoomRange: true
        });
      });
  });

  function showError() {
    document.querySelector(".message").innerHTML =
      "<div class='error'>  Не удалось точно определить адрес. Введите адрес снова или передвиньте метку на карте туда, где находится объект</div>";
  }

  function getAddress(coords) {
    document.querySelector(".message").innerHTML = "";
    ymaps.geocode(coords).then(function(res) {
      var firstGeoObject = res.geoObjects.get(0);
      kind = firstGeoObject.properties.get(
        "metaDataProperty.GeocoderMetaData.kind"
      );

      error_kinds.forEach(error => {
        kind === error ? showError() : "";
      });
      current_adress = firstGeoObject.getAddressLine();
      current_coords = coords;
      current_coords_input.value = current_coords;
      current_adress_input.value = filterAdress(current_adress);
    });
  }
}
