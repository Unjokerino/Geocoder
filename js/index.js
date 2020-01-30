ymaps.ready(init);
let current_adress = "";
let current_coords = "";
let error_kinds = ["hydro", "vegetation", "country", "district"];
let current_adress_input = document.querySelector("#map_adress");
let current_coords_input = document.querySelector("#map_coords");
let clear_input_btn = document.querySelector("#map_clear_input");

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
      suppressMapOpenBlock: true,
      searchControlProvider: null
    }
  );

  current_adress_input.addEventListener("input", checkClear);

  current_adress_input.addEventListener("oninput", checkClear);

  current_adress_input.addEventListener("change", function(e) {
    checkClear();
    let value = e.target.value;
    current_adress_input.value = filterAdress(value).join();
    if (value !== "") {
      document.querySelector(".message").innerHTML = "";
      ymaps
        .geocode("Россия, " + value, {
          results: 3
        })
        .then(function(res) {
          var firstGeoObject = res.geoObjects.get(0);

          res.geoObjects.each(elem => {
            let option = document.createElement("option");
            let adress = filterAdress(
              elem.properties.get("metaDataProperty.GeocoderMetaData.text")
            );
            option.innerHTML = adress;
            option.value = adress;
            document.querySelector("#suggestions").append(option);
          });

          coords = firstGeoObject.geometry.getCoordinates();
          kind = firstGeoObject.properties.get(
            "metaDataProperty.GeocoderMetaData.kind"
          );
          name = firstGeoObject.properties.get(
            "metaDataProperty.GeocoderMetaData.text"
          );
          current_adress_input.value = filterAdress(name);

          error_kinds.forEach(error => {
            kind === error
              ? showError(
                  "Не удалось точно определить адрес. Введите адрес снова или передвиньте метку на карте туда, где находится объект"
                )
              : "";
          });

          bounds = firstGeoObject.properties.get("boundedBy");
          current_coords_input.value = coords;
          if (kind !== "country") {
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
          }
          current_adress_input.value = value;
          checkClear();
        });
    } else {
      removePlaceMark();
    }
  });

  clear_input_btn.addEventListener("click", () => {
    current_adress_input.value = "";
    showError("");
    checkClear();
    removePlaceMark();
  });

  function removePlaceMark() {
    myMap.geoObjects.remove(placeMark);
    placeMark = false;
  }

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

  function checkClear() {
    let value = current_adress_input.value;

    if (value !== "") {
      clear_input_btn.style.visibility = "visible";
    } else {
      clear_input_btn.style.visibility = "hidden";
    }
  }

  function showError(message) {
    document.querySelector(
      ".message"
    ).innerHTML = `<div class='error'> ${message} </div>`;
  }

  function getAddress(coords) {
    document.querySelector(".message").innerHTML = "";
    ymaps.geocode(coords).then(function(res) {
      var firstGeoObject = res.geoObjects.get(0);
      kind = firstGeoObject.properties.get(
        "metaDataProperty.GeocoderMetaData.kind"
      );

      error_kinds.forEach(error => {
        kind === error
          ? showError(
              "Не удалось точно определить адрес. Введите адрес снова или передвиньте метку на карте туда, где находится объект"
            )
          : "";
      });

      current_adress = firstGeoObject.getAddressLine();

      current_coords = coords;
      current_coords_input.value = current_coords;

      current_adress_input.value = filterAdress(current_adress);
      checkClear();
    });
  }
}
