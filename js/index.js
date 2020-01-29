ymaps.ready(init);
let current_adress = "";
let current_coords = "";

let current_adress_input = document.querySelector("#map_adress");
let current_coords_input = document.querySelector("#map_coords");

function init() {
  var myPlacemark;
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
      console.log("gdsf");
      myMap.geoObjects.remove(myPlacemark);
      myPlacemark = false;
    }
  });
  // Слушаем клик на карте.
  myMap.events.add("click", function(e) {
    var coords = e.get("coords");

    // Если метка уже создана – просто передвигаем ее.
    if (myPlacemark) {
      myPlacemark.geometry.setCoordinates(coords);
    }
    // Если нет – создаем.
    else {
      myPlacemark = createPlacemark(coords);
      myMap.geoObjects.add(myPlacemark);
      // Слушаем событие окончания перетаскивания на метке.
      myPlacemark.events.add("dragend", function() {
        getAddress(myPlacemark.geometry.getCoordinates());
      });
    }
    getAddress(coords);
  });

  // Создание метки.
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
        // Выбираем первый результат геокодирования.
        var firstGeoObject = res.geoObjects.get(0),
          // Координаты геообъекта.
          coords = firstGeoObject.geometry.getCoordinates(),
          // Область видимости геообъекта.
          bounds = firstGeoObject.properties.get("boundedBy");

        if (myPlacemark) {
          myPlacemark.geometry.setCoordinates(coords);
        }
        // Если нет – создаем.
        else {
          myPlacemark = createPlacemark(coords);
          myMap.geoObjects.add(myPlacemark);
          // Слушаем событие окончания перетаскивания на метке.
          myPlacemark.events.add("dragend", function() {
            getAddress(myPlacemark.geometry.getCoordinates());
          });
        }
        // Масштабируем карту на область видимости геообъекта.
        myMap.setBounds(bounds, {
          // Проверяем наличие тайлов на данном масштабе.
          checkZoomRange: true
        });
      });
  });

  // Определяем адрес по координатам (обратное геокодирование).
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
