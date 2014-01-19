/* AmeriPride Presentation Javascript */

var presentation = {
  printing: false,
  nav_position: 0,
  current_slide: 0,
  slide_width: 0,
  max_slides: 0,
  speed: 500,
  title_hidden: false,
  _data: {},
    
  run: function() {
    presentation.init_date();
    presentation.init_title();
    presentation.init_links();
    presentation.init_swipes();
  },
  
  edit: function (editing) {
    if (editing === 'true') {
      presentation.begin_edit();
    } else if (editing === 'false') {
      presentation.end_edit();
    }
  },

  clear: function() {
    presentation._data = {};
    window.location.reload();
  },
  
  print: function() {
    $('link[href="stylesheets/screen.css"]').attr('href','stylesheets/print.css');
  },
  
  load: function(data) {
    if (data) {
      try {
        data = jQuery.parseJSON(unescape(data));
        if (data && data[$('body').attr('data-title')]) {
          presentation._data = data[$('body').attr('data-title')];
        }
      } catch (err) {
        console.log(err);
      }
    }
    
    $('div.slide').each(function(index) {
      var value = presentation.get_item('toggle_' + $(this).attr('id'));
      if (value != null) {
        if (value === "true") {
          $('a[href=#' + $(this).attr('id') + ']').show();
          $(this).show();
        } else {
          $('a[href=#' + $(this).attr('id') + ']').hide();
          $(this).hide();
        }
      }
    });
    
    $('.editable').each(function(index) {
      var value = presentation.get_item($(this).attr('data-key'));
      if (value) {
        $(this).html(value);
      }
    });
    
    $('.imageeditable').each(function(index) {
      var image = $('img', this);
      var value = presentation.get_item($(image).attr('data-key'));
      if (value) {
        $(image).attr('src', value);
      }
    });
  },
  
  save: function() {
    var data = {}
    data[$('body').attr('data-title')] = presentation._data;
    return escape(JSON.stringify(data));
  },
  
  init_date: function() {
    var date = new Date();
    $('.date').html(date.format('mmmm dS, yyyy'));
  },
    
  init_title: function() {
    $('div#title img').click(function(e) {
      $('div#title').fadeOut();
      presentation.title_hidden = true;
    });
    
    var mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(function(mql) {
      if (mql.matches) {
          $('div#title').show();
      } else {
        if (presentation.title_hidden) {
          $('div#title').hide();
        }
      }
    });
  },
    
  init_links: function() {
    $('nav a').bind('click', function(event) {
      event.preventDefault();
    });
  },
    
  init_swipes: function() {
    presentation.slide_width = $('div.slide').width();
    presentation.max_slides = $('div.slide').length;

    presentation.scroll_nav(0, 0);
    presentation.scroll_slide(0, 0);

    $('div#slides').swipe({
      click: presentation.on_click,
      swipeStatus: presentation.on_slide_swipe,
      excludedElements: "button, input, select, textarea",
      allowPageScroll:"none"
    });
  
    $('div#nav_inner_container').swipe({
      click: presentation.on_click,
      swipeStatus: presentation.on_nav_swipe,
      excludedElements: "button, input, select, textarea",
      allowPageScroll:"none"
    });
  },
  
  begin_edit: function() {
    $('div.slide').each(function(index) {
      $('a[href=#' + $(this).attr('id') + ']').show();
      $(this).show();
    });
    $(".nonreturnable").keypress(function(e){ return e.which != 13; });
    $('div.toggle_control').show().each(function(index) {
      var value = presentation.get_item($('form > input[type=checkbox]', this).attr('name'));
      if (value != null) {
        if (value === "true") {
          $('form > input[type=checkbox]', this).prop('checked', true);
        } else {
          $('form > input[type=checkbox]', this).prop('checked', false);
        }
      }
      
      $('form > input[type=checkbox]', this).click(function(event) {
        presentation.set_item($(this).attr('name'), $(this).prop('checked'));
      });
    });
    $('.imageeditable form').show();
    $('.imageeditable input').bind('change', function(event) {
      var files = event.target.files;
      var image = $(this).closest('.imageeditable').find('img');
      
      for (var i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) {
          continue;
        }

        var reader = new FileReader();
        reader.onload = (function(file) {
          return function(e) {
            $(image).attr('src', e.target.result);
            $(image).attr('title', escape(file.name));
            $(image).attr('alt', escape(file.name));
            presentation.set_item($(image).attr('data-key'), e.target.result);
          };
        })(f);
        reader.readAsDataURL(f);
      }
      
      $(this).replaceWith($(this).val('').clone(true));
    });
    $('.editable').addClass('editing').attr('contenteditable', true).live('blur', function() {
      presentation.set_item($(this).attr('data-key'), $(this).html());
    }).each(function(index) {
      $(this).show();
    });
  },
  
  end_edit: function() {
    $('div.slide').each(function(index) {
      var value = presentation.get_item('fs_toggle_' + $(this).attr('id'));
      if (value != null) {
        if (value === "true") {
          $('a[href=#' + $(this).attr('id') + ']').show();
          $(this).show();
        } else {
          $('a[href=#' + $(this).attr('id') + ']').hide();
          $(this).hide();
        }
      }
    });
    
    $(".nonreturnable").keypress(function(e){ return; });
    $('div.toggle_control').hide().each(function(index) {
      $('form > input:checkbox', this).unbind();
    });
    $('.imageeditable form').hide();
    $('.imageeditable form input').unbind();
    $('.editable').removeClass('editing').attr('contenteditable', false).die().each(function(index) {
      if ($(this).html().length == 0) {
        $(this).hide();
      }
    });
  },
  
  get_item: function(key) {
    return presentation._data[key];
  },
  
  set_item: function(key, value) {
    presentation._data[key] = value;
  },
    
  on_click: function(event) {
    var url = $(event.target).prop('href');
    if (url) {
      var tag = url.substring(url.indexOf('#')).replace('#', '');
      presentation.slide_to_tag(tag);
    }
  },
    
  on_slide_swipe: function(event, phase, direction, distance) {
    if(phase == "move" && (direction == "left" || direction == "right")) {
      var duration = 0;
      
      if (direction == "left") {
        presentation.scroll_slide((presentation.slide_width * presentation.current_slide) + distance, duration);
      } else if (direction == "right") {
        presentation.scroll_slide((presentation.slide_width * presentation.current_slide) - distance, duration);
      }
    } else if (phase == "cancel") {
      presentation.scroll_slide(presentation.slide_width * presentation.current_slide, presentation.speed);
    } else if (phase == "end") {
      if (direction == "left") {
        presentation.slide_next();
      } else if (direction == "right") {
        presentation.slide_previous();
      }
    }
  },
    
  on_nav_swipe: function(event, phase, direction, distance) {
    if(phase == "move" && (direction == "left" || direction == "right")) {
      var duration = 0;
      
      if (direction == "left") {
        presentation.scroll_nav(presentation.nav_position + distance, duration);
      } else if (direction == "right") {
        presentation.scroll_nav(presentation.nav_position - distance, duration);
      }
    } else if (phase == "cancel") {
      presentation.scroll_nav(presentation.nav_position, presentation.speed);
    } else if (phase == "end") {
      if (direction == "left") {
        var delta = presentation.nav_position + distance;
        var nav_width = $('nav#nav_top_nav').width() - 1029;
        
        if (delta > nav_width) {
          presentation.scroll_nav(nav_width, presentation.speed);
          presentation.nav_position = nav_width;
        } else {
          presentation.nav_position = delta;
        }
      } else if (direction == "right") {
        var delta = presentation.nav_position - distance;
        
        if (delta <= 0) {
          presentation.scroll_nav(0, presentation.speed);
          presentation.nav_position = 0;
        } else {
          presentation.nav_position = delta;
        }
      }
    }
  },
  
  scroll_nav: function(distance, duration) {
    $('div#nav_inner_container').css("-webkit-transition-duration", (duration / 1000).toFixed(1) + "s");
  
    var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
  
    $('div#nav_inner_container').css("-webkit-transform", "translate3d(" + value + "px, 0px, 0px)");
  },
  
  scroll_slide: function(distance, duration) {
    $('div#slide_container').css("-webkit-transition-duration", (duration / 1000).toFixed(1) + "s");
  
    var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
  
    $('div#slide_container').css("-webkit-transform", "translate3d(" + value + "px, 0px, 0px)");
  },
  
  slide_previous: function() {
    presentation.current_slide = Math.max(presentation.current_slide - 1, 0);
    presentation.scroll_slide(presentation.slide_width * presentation.current_slide, presentation.speed);
  },
  
  slide_next: function() {
    presentation.current_slide = Math.min(presentation.current_slide + 1, presentation.max_slides - 1);
    presentation.scroll_slide(presentation.slide_width * presentation.current_slide, presentation.speed);
  },

  slide_to_index: function(index) {
    if (index >= 0 && index < presentation.max_slides) {
      presentation.scroll_slide(presentation.slide_width * index, presentation.speed);
      presentation.current_slide = index;
    }
  },
    
  slide_to_tag: function(tag) {
    var index = $('div.slide:visible').index($('div#' + tag));
    presentation.slide_to_index(index);
  }
}