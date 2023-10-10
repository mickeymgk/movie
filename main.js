(function ($) {
  $.fn.redraw = function () {
    return this.map(function () { this.offsetTop; return this; });
  };
})(jQuery);

var Movie = {
  canPay: false,
  modeOrder: false,
  totalPrice: 0,
  programming: null,
  reservedSeats: [],
  movies: [
    {
      id: 0,
      title: 'Blue Beetle',
      genre: 'Action, Science Fiction',
      source:
        'https://image.tmdb.org/t/p/original//1syW9SNna38rSl9fnXwc9fP7POW.jpg',
      duration: 128,
      timings: ["1:00", "7:00", "3:00", "9:00"],
      price: 7000
    }, {
      id: 1,
      title: 'Gran Turismo',
      genre: 'Action, Drama',
      source:
        'https://image.tmdb.org/t/p/original//51tqzRtKMMZEYUpSYkrUE7v9ehm.jpg',
      duration: 60,
      timings: ["1:00", "4:00", "9:00", "12:00"],
      price: 1400
    }, {
      id: 2,
      title: 'Meg 2: The Trench',
      genre: 'Action, Horor',
      source:
        'https://image.tmdb.org/t/p/original//4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',
      duration: 80,
      timings: ["12:00", "2:00", "3:00", "14:00"],
      price: 1700
    }, {
      id: 3,
      title: 'Fast X',
      genre: 'Action, Crime',
      source:
        'https://image.tmdb.org/t/p/original//fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
      duration: 90,
      timings: ["16:00", "1:00", "3:00", "7:00"],
      price: 8000
    }, {
      id: 4,
      title: 'Carls Date',
      genre: 'Animation, Adventure',
      source:
        'https://image.tmdb.org/t/p/original//y8NtM6q3PzntqyNRNw6wgicwRYl.jpg',
      duration: 30,
      timings: ["1:00", "5:00", "7:00", "9:00"],
      price: 1100
    }, {
      id: 5,
      title: 'Carls Date',
      genre: 'Animation, Adventure',
      source:
        'https://image.tmdb.org/t/p/original//vd8YdaH7dzeIMGTNwQinlSiA1gV.jpg',
      duration: 60,
      timings: ["2:00", "4:00", "6:00", "8:00"],
      price: 1300
    },

  ],
  selectedMovieId: null,

  init: function (options) {
    Telegram.WebApp.ready();
    Movie.apiUrl = options.apiUrl;
    Movie.mode = options.mode;
    Movie.userId = options.userId;
    Movie.userHash = options.userHash;
    $('body').show();

    let html = ''; // Initialize an empty string to store the HTML content
    const menu = document.querySelector('#menu'); // Corrected selector

    Movie.movies.forEach(function (movie) {
      // Build the HTML for each movie item
      html += `
      <li id="${movie.id}" class="movie-item button-item ripple-handler">
        <div class="movie-item-image">
          <img src="${movie.source}">
        </div>
        <p class="movie-title">${movie.title}</p>
        <p class="movie-genre">${movie.genre}</p>
      </li>`;
    });

    menu.innerHTML = html; // adding the html to DOM
    menu.addEventListener('click', function (event) {
      const target = event.target;
      if (target.closest('.movie-item')) {
        const movieId = target.closest('.movie-item').id;
        Movie.initDetail(movieId);
        Movie.selectedMovieId = movieId;
        Movie.toggleMode(true);
      }
    });

    $('.js-status').on('click', Movie.eStatusClicked);
    Telegram.WebApp.MainButton.setParams({
      text_color: '#fff'
    }).onClick(Movie.mainBtnClicked);
    Telegram.WebApp.BackButton.onClick(Movie.backBtnClicked);
    Telegram.WebApp.setHeaderColor('bg_color');
  },
  initDetail: function (id) {
    const movie = this.movies.at(id);
    $('#poster').attr('src', movie.source);
    $('#detail').html(`
    <h4 class="movie-title">${movie.title}</h4>
    <p class="margin-zero"><span class="movie-genre-span">Genre: </span>${movie.genre}</p>
    <p class="movie-detail-item-text"><span class="movie-genre-span">Duration: </span>${movie.duration} min</p>`);

    movie.timings.forEach((option, index) => {
      const chip = $('<div>').addClass('chip').text(option);

      // Add click event handler to handle selection
      chip.on('click', function () {
        // Remove 'selected' class from all chips
        $('.chip').removeClass('selected');

        // Add 'selected' class to the clicked chip
        $(this).addClass('selected');
        Movie.programming = option;
      });

      // Initially, select the first option
      if (index === 0) {
        chip.addClass('selected');
        Movie.programming = movie.timings.at(0);
      }

      // Append the chip to the radio group
      $('#chips').append(chip);
    });

    // Loop to create 8x6 grid items
    for (let j = 0; j < 63; j++) {
      const gridItem = document.createElement("div");
      // gridItem.classList.add("rounded-md", "aspect-w-1", "aspect-h-1");
      gridItem.classList.add("movie-seat");
      gridItem.id = `seat-${j}`;
      gridItem.dataset.state = 'off'; // Initial state is off
      gridItem.addEventListener('click', function () {
        if (this.dataset.state === 'off') {
          this.dataset.state = 'on';
          Movie.reservedSeats.push(this.id);
          this.classList.toggle('on');
        } else if (this.dataset.state === 'on') {
          this.dataset.state = 'off';
          this.classList.toggle('on');
          Movie.reservedSeats.splice(Movie.reservedSeats.indexOf(this.id), 1);
        }
        Movie.updateTotalPrice();
      });
      $('#seats').append(gridItem);
    }
    // mark 10 random seats as reserved for demo purpose
    for (let i = 0; i < 10; i++) {
      const random = Math.floor(Math.random() * 63);
      const disabledDiv = $("#seat-" + random);
      disabledDiv.data("state", "disabled").addClass("disabled");
    }

  },
  backBtnClicked: function () {
    $("#chips").empty();
    $("#seats").empty();
    Movie.reservedSeats = [];
    Movie.selectedMovieId = null;
    Movie.programming = null;
    Movie.updateTotalPrice();
    Movie.updateMainButton();
    Movie.toggleMode(false);
  },
  formatPrice: function (price) {
    return '$' + Movie.formatNumber(price / 1000, 2, '.', ',');
  },
  formatNumber: function (number, decimals, decPoint, thousandsSep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
    var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
    var s = ''
    var toFixedFix = function (n, prec) {
      if (('' + n).indexOf('e') === -1) {
        return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
      } else {
        var arr = ('' + n).split('e')
        var sig = ''
        if (+arr[1] + prec > 0) {
          sig = '+'
        }
        return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
      }
    }
    s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
  },
  updateBackgroundColor: function () {
    var style = window.getComputedStyle(document.body);
    var bg_color = parseColorToHex(style.backgroundColor || '#fff');
    Telegram.WebApp.setBackgroundColor(bg_color);
  },
  updateMainButton: function () {
    var mainButton = Telegram.WebApp.MainButton;
    if (Movie.modeOrder) {
      if (Movie.isLoading) {
        mainButton.setParams({
          is_visible: true,
          color: '#65c36d'
        }).showProgress();
      } else {
        mainButton.setParams({
          is_visible: !!Movie.canPay,
          text: Movie.mode == 'inline' ? 'CREATE ORDER' : (Movie.mode == 'link' ? 'CHOOSE A CHAT…' : 'PAY ' + Movie.formatPrice(Movie.totalPrice)),
          color: '#31b545'
        }).hideProgress();
      }
    }
    Telegram.WebApp.isClosingConfirmationEnabled = !!Movie.canPay;
  },
  updateTotalPrice: function () {
    Movie.canPay = Movie.reservedSeats.length > 0;
    Movie.totalPrice = Movie.reservedSeats.length * Movie.movies.at(Movie.selectedMovieId).price;
    Movie.updateMainButton();
  },
  toggleMode: function (mode_order) {
    Movie.modeOrder = mode_order;
    var anim_duration, match;
    try {
      anim_duration = window.getComputedStyle(document.body).getPropertyValue('--page-animation-duration');
      if (match = /([\d\.]+)(ms|s)/.exec(anim_duration)) {
        anim_duration = +match[1];
        if (match[2] == 's') {
          anim_duration *= 1000;
        }
      } else {
        anim_duration = 400;
      }
    } catch (e) {
      anim_duration = 400;
    }
    if (mode_order) {
      var height = $('.movie-items').height();
      $('.movie-order-overview').show();
      $('#menu').hide();
      $('.movie-items').css('maxHeight', height).redraw();
      $('body').addClass('order-mode');
      Telegram.WebApp.expand();
      Telegram.WebApp.BackButton.show();
    } else {
      $('body').removeClass('order-mode');
      setTimeout(function () {
        $('.movie-items').css('maxHeight', '');
        $('.movie-order-overview').hide();
        $('#menu').show();
      }, anim_duration);
      Telegram.WebApp.BackButton.hide();
    }
    Movie.updateBackgroundColor();
    Movie.updateMainButton();
  },
  toggleLoading: function (loading) {
    Movie.isLoading = loading;
    Movie.updateMainButton();
    $('body').toggleClass('loading', !!Movie.isLoading);
    Movie.updateTotalPrice();
  },
  mainBtnClicked: function () {
    if (!Movie.canPay || Movie.isLoading) {
      return false;
    }
    if (Movie.modeOrder) {
      var movie = Movie.movies.at(Movie.selectedMovieId);
      var title = movie.title;
      var description = Movie.reservedSeats.join(', ');

      // conver the telegram init data params to object
      var params = new URLSearchParams(Telegram.WebApp.initData);
      var initData = {};
      params.forEach(function (value, key) {
        if (key === 'user') {
          initData[key] = JSON.parse(decodeURIComponent(value));
        } else {
          initData[key] = value;
        }
      });

      var tit = title + " ( " + Movie.programming + " )"
      var params = {
        user_id: initData.user.id,
        title: tit,
        description: description,
        price: Movie.totalPrice,
        photo: movie.source
      };
      var invoiceSupported = Telegram.WebApp.isVersionAtLeast('6.1');
      if (invoiceSupported) {
        params.invoice = 1;
      }
      Movie.toggleLoading(true);
      Movie.apiRequest(params, function (result) {
        var r = JSON.parse(result);
        Movie.toggleLoading(false);
        if (r.ok) {
          if (invoiceSupported) {
            Telegram.WebApp.openInvoice(r.result, function (status) {
              if (status == 'paid') {
                Telegram.WebApp.close();
              } else if (status == 'failed') {
                Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                Movie.showStatus('Payment has been failed.');
              } else {
                Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
                Movie.showStatus('You have cancelled this order.');
              }
            });
          } else {
            Telegram.WebApp.close();
          }
        }
        if (result.error) {
          Telegram.WebApp.HapticFeedback.notificationOccurred('error');
          Movie.showStatus(result.error);
        }
      });
    } else {
      Movie.toggleMode(true);
    }
  },
  eStatusClicked: function () {
    Movie.hideStatus();
  },
  showStatus: function (text) {
    clearTimeout(Movie.statusTo);
    $('.js-status').text(text).addClass('shown');
    if (!Movie.isClosed) {
      Movie.statusTo = setTimeout(function () { Movie.hideStatus(); }, 2500);
    }
  },
  hideStatus: function () {
    clearTimeout(Movie.statusTo);
    $('.js-status').removeClass('shown');
  },
  apiRequest: function (data, onCallback) {
    var formData = $.param(data);
    $.ajax({
      url: Movie.apiUrl,
      type: 'POST',
      data: formData, // Convert the data object to a JSON string
      contentType: "application/x-www-form-urlencoded",
      success: function (result) {
        onCallback && onCallback(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        onCallback && onCallback({ error: 'Server error' });
        console.error('AJAX failed request:', errorThrown);
      }
    });
  }
};

function parseColorToHex(color) {
  color += '';
  var match;
  if (match = /^\s*#([0-9a-f]{6})\s*$/i.exec(color)) {
    return '#' + match[1].toLowerCase();
  }
  else if (match = /^\s*#([0-9a-f])([0-9a-f])([0-9a-f])\s*$/i.exec(color)) {
    return ('#' + match[1] + match[1] + match[2] + match[2] + match[3] + match[3]).toLowerCase();
  }
  else if (match = /^\s*rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)\s*$/.exec(color)) {
    var r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
    r = (r < 16 ? '0' : '') + r.toString(16);
    g = (g < 16 ? '0' : '') + g.toString(16);
    b = (b < 16 ? '0' : '') + b.toString(16);
    return '#' + r + g + b;
  }
  return false;
}
