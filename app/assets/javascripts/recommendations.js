$(document).ready(function(){

  function logClickEvent(event, eventAction, eventLabel){
    var link = $(event.target);
    var recommendation = link.parents('article.recommendation').first();
    logInteraction(recommendation.data('recommendation-id'), eventAction, eventLabel);
  }

  function logInteraction(eventCategory, eventAction, eventLabel){
    if(typeof gtag != 'undefined'){
      gtag('event', 'recommendation_interaction', {
        event_category: eventCategory,
        event_action: eventAction,
        event_label: eventLabel
      });
    } else {
      console.log('Logging: ' + eventCategory + ':' + eventAction + ':' + eventLabel);
    }
  }

  function switchToBackContent(event){
    var link = $(event.target);
    var recommendation = link.parents('article.recommendation').first();

    recommendation.find(".front").hide();
    recommendation.find(".back").show();
    recommendation.addClass('item-highlight');
  }

  $('.recommendations-page a[target=_blank]').click(function(event){
    logClickEvent(event, 'click', event.target.href);
  });

  $('.recommendations-page a.not_for_me').click(function(event){
    logClickEvent(event, 'not_for_me');
    switchToBackContent(event);
    return(false);
  });

  $('.recommendations-page a.interest').click(function(event){
    logClickEvent(event, 'interest');
    // TODO: UI feedback
    return false;
  });

  $('.recommendations-page a.yes').click(function(event){
    logClickEvent(event, 'want_to_start', 'yes');
    switchToBackContent(event);
    return false;
  });

  $('.recommendations-page a.no').click(function(event){
    logClickEvent(event, 'want_to_start', 'no');
    switchToBackContent(event);
    return false;
  });

  var hit_recommendations = [];
  var waypoints = $('article.recommendation').waypoint({
    handler: function(direction) {
      var recommendation_id = $(this.element).data('recommendation-id')
      if(!hit_recommendations.includes(recommendation_id)){
        hit_recommendations.push(recommendation_id);
        logInteraction(recommendation_id, 'view');
      }
    },
    offset: '50%'
  })
});
