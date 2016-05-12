import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import doT from 'olado/doT'
import madlib from './lib/madlib'
import sendEvent from './lib/event'
import geocode from './lib/geocode'
import distance from './lib/distance'
import toTitleCase from './lib/toTitleCase'
import cities from './data/pollution_geolocated.json!'
import statsHTML from './text/stats.html!text'

var templateFn = doT.template(statsHTML);

function locateForce(lat, lng) {
    reqwest({
        'url': `https://data.police.uk/api/locate-neighbourhood?q=${lat},${lng}`,
        'type': 'json',
        'crossOrigin': true,
        'success': resp => sendEvent('show-force', {'forceId': resp.force})
    });
}

window.embed = function (el) {
    var userLocationEl = el.querySelector('.js-gps');

    window.addEventListener('show-force', evt => {
        el.querySelector('.placeholder').style.display = 'none';
        el.querySelector('.data').style.display = 'block';
    });

    madlib(el.querySelector('.js-postcode'), loc => {
       
            geocode(loc, (err, resp) => {
                if (!err) {
                    var center = resp.features[0].center;
                    sendEvent('location', {'latlng': [center[1], center[0]]});
                }
            });
        
    });

    if ('geolocation' in navigator) {
        userLocationEl.style.display = 'block';
        userLocationEl.addEventListener('click', () => {
            userLocationEl.removeAttribute('data-has-error');
            userLocationEl.setAttribute('data-is-loading', '');

            navigator.geolocation.getCurrentPosition(function (position) {
                userLocationEl.removeAttribute('data-is-loading');
                sendEvent('location', {'latlng': [position.coords.latitude, position.coords.longitude]});

            }, function (err) {
                userLocationEl.removeAttribute('data-is-loading');
                userLocationEl.addAttribute('data-has-error', '');
            });

            userLocationEl.blur();

        });
    }

    window.addEventListener('location', evt => {
        var latlng = evt.detail.latlng;
        var rankedCities = cities
            .map(city => { return {city, 'distance': distance([city.lat, city.lon], latlng), 'name': toTitleCase(city.City) }; })
            .sort((a, b) => a.distance - b.distance);

        var city = rankedCities[0].city;
        var howFar = rankedCities[0].distance;

        var statsEl = el.querySelector('.js-stats');
        statsEl.innerHTML = templateFn(rankedCities[0])

    });

    iframeMessenger.enableAutoResize();
};
