// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require rails-ujs
//= require_tree .

function handleFormSubmit(event, eventCategory, eventAction, eventLabel) {
  // this is a bit tricksy, since submitting forms causes the page to unload
  // and stop javascript running.
  // See:
  // https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits#knowing_when_the_hit_has_been_sent

  var form = event.target,
      // Keeps track of whether or not the form has been submitted.
      // This prevents the form from being submitted twice in cases
      // where `hitCallback` fires normally.
      formSubmitted = false;

  // Prevents the browser from submitting the form
  // and thus unloading the current page.
  event.preventDefault();

  setTimeout(submitForm, 1000);  // in case the GA hit callback never fires

  function submitForm() {
    if (!formSubmitted) {
      formSubmitted = true;
      form.submit();
    }
  }

  gtag('event', 'form_submission', {
    event_category: eventCategory,
    event_action: eventAction,
    event_label: eventLabel,
    event_callback: function() {
      submitForm();
    }
  });

}

$(document).ready(function(){
  var required_interests = 5;

  $('.thumbs-up-down').hide();
  $('.thumbs-up-down:first').show();

  $('.thumbs-up-down input[type=radio]').change(function(){
    var radio_button = $(this);
    var current_fieldset = radio_button.parents('fieldset');
    var form = radio_button.parents('form');
    if($('.thumbs-up-down input:checked[value=yes]').length == required_interests) {
      form.submit();
    } else {
      var next_fieldset = current_fieldset.next('fieldset');
      if(next_fieldset.length > 0){
        current_fieldset.hide();
        next_fieldset.show();
      } else {
        form.submit();
      }
    }
  });

  $('#join-form-1').on('submit', function(event){
    if(typeof ga != 'undefined'){
      handleFormSubmit(event, 'Form', 'submit', 'join-form-1');
    }
  });
});


$(document).ready(function(){
  if($('#member-map').length > 0){
    initMap();
  }
});

function initMap(){
  var geocoder = new google.maps.Geocoder();
  var postcode = $('#member-map').data('postcode');
  geocoder.geocode( {address: postcode, componentRestrictions: {country: 'UK'}}, function(results, status) {
    if (status == 'OK') {
      var postcode_centre = results[0].geometry.location;
      var map = new google.maps.Map(document.getElementById('member-map'), {
        center: postcode_centre,
        zoom: 14
      });
      var colorPolygonLayer = r360.googleMapsPolygonLayer(map);
      setDistance(colorPolygonLayer, postcode_centre);
      $('#submission_distance').change(function(){
        setDistance(colorPolygonLayer, postcode_centre);
      });
      $('#submission_distance_mode').change(function(){
        setDistance(colorPolygonLayer, postcode_centre);
      });
    }
  });
}

function setDistance(colorPolygonLayer, lat_lng){
  var distanceMinutes = $('#submission_distance').val();
  var travelType = $('#submission_distance_mode').val();
  showDistance(colorPolygonLayer, lat_lng.lat(), lat_lng.lng(), travelType, distanceMinutes * 60);
}

function showDistance(layer, lat, lng, travelType, time) {
  var travelOptions = r360.travelOptions();
  travelOptions.setServiceKey($('#member-map').data('route360-key'));
  travelOptions.setServiceUrl("https://service.route360.net/britishisles/");
  travelOptions.addSource({ lat: lat, lng: lng });
  travelOptions.setTravelTimes([time]);
  travelOptions.setTravelType(travelType);

  // call the service
  r360.PolygonService.getTravelTimePolygons(travelOptions,
    function(polygons) {
      layer.update(polygons);
      layer.fitMap();
    },
    function(status, message) {
      console.log("The route360 API is not available - double check your configuration options.");
    }
  );
}

$(document).ready(function(){
  // Parse the URL parameter
  function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
  // Give the parameter a variable name
  var newLocation = getParameterByName('location');
  if (newLocation == null) {
    console.log("No location set");
  } else {
    $('#set-location').replaceWith(newLocation);
  }

});

$(document).ready(function(){
  if($('#admin-map').length > 0){
    var bounds = new google.maps.LatLngBounds();
    var map = new google.maps.Map(document.getElementById('admin-map'), {
      zoom: 14
    });
    $('#members .member').each(function(){
      var member = $(this);
      if(member.data('latitude')){
        var latLng = new google.maps.LatLng(member.data('latitude'),member.data('longitude'));
        var marker = new google.maps.Marker({
          position: latLng,
          title: member.find('.postcode').html()
        });
        var infowindow = new google.maps.InfoWindow({
          content: member.find('.postcode').html() + ' ' + member.find('.submissions').html()
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
        bounds.extend(marker.getPosition());
        marker.setMap(map);
      }
    });
    map.fitBounds(bounds);
  }
});
