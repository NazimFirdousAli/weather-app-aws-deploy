import jQuery from "jquery";
import { db } from "../backend/app_backend";
import Swal from "sweetalert2";
import * as weatherAPI from "./getCurrentWeather";
import axios from "axios";
const getGeolocation = () => {
  //check if the user's device supports Geolocation API
  if (navigator.geolocation) {
    const OPTIONS = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    };
    const error = (error) => {
      Swal.fire({
        toast: true,
        text: error.message,
        icon: "warning",
        timer: 1000,
        position: "top",
        showConfirmButton: false,
      }).then((willProceed) => {
        // @see line 52
        weatherAPI.scrollToElement("weatherContainer");
      });
    };
    navigator.geolocation.watchPosition(
      (position) => {
        //check if the user's position was saved before
        if (!db.get("USER_LONGITUDE") && !db.get("USER_LATITUDE")) {
          db.create("USER_LONGITUDE", position.coords.longitude);
          db.create("USER_LATITUDE", position.coords.latitude);
        } else {
          //if saved, then get the current weather using their coordinates
          const longitude =
              position.coords.longitude || db.get("USER_LONGITUDE"),
            latitude = position.coords.latitude || db.get("USER_LATITUDE");
          axios
            .post(
              "https://8quza8v1gk.execute-api.eu-north-1.amazonaws.com/location/",
              {
                user_latitude: latitude,
                user_longitude: longitude,
                API_KEY: weatherAPI.API_KEY,
                WEATHER_UNIT: weatherAPI.WEATHER_UNIT,
              }
            )
            .then((response) => {
              if (response.status != 200) {
                Swal.fire({
                  toast: true,
                  position: "top",
                  text: "Something went wrong!",
                  icon: "info",
                  showConfirmButton: false,
                  timer: 3000,
                }).then((willProceed) => {
                  //scroll to top after notification
                  weatherAPI.scrollToElement("weatherContainer");
                });
              } else {
                //if API call was successful
                weatherAPI.updateReactDom(response.data);
                weatherAPI.scrollToElement("weatherContainer");
              }
            })
            .catch((error) => {
              Swal.fire({
                toast: true,
                text: error,
                icon: "warning",
                timer: 2000,
                position: "top",
                showConfirmButton: false,
              }).then((willProceed) => {
                // @see line 52
                weatherAPI.scrollToElement("weatherContainer");
              });
            });
        }
      },
      error,
      OPTIONS
    );
  } else {
    Swal.fire({
      toast: true,
      text: "Geolocation not supported!",
      icon: "error",
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

export default getGeolocation;
