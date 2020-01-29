ymaps.ready(init);
let current_adress = "";
let current_coords = "";

let current_adress_input = document.querySelector("#map_adress");
let current_coords_input = document.querySelector("#map_coords");

function init() {
  var placeMark;
  myMap = new ymaps.Map(
    "map",
    {
      center: [57.1076545712598, 65.57202407215911],
      zoom: 12
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
  var suggestView1 = new ymaps.SuggestView("map_adress", {});
  suggestView1.events.add("select", function(e) {
    ymaps
      .geocode(e.get("item").value, {
        results: 1
      })
      .then(function(res) {
        var firstGeoObject = res.geoObjects.get(0),
          coords = firstGeoObject.geometry.getCoordinates(),
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

  function getAddress(coords) {
    ymaps.geocode(coords).then(function(res) {
      var firstGeoObject = res.geoObjects.get(0);
      (current_adress = firstGeoObject.getAddressLine()),
        (current_coords = coords);
      current_coords_input.value = current_coords;
      current_adress_input.value = current_adress;
    });
  }
}
