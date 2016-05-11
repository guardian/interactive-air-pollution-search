import iframeMessenger from 'guardian/iframe-messenger'
import reqwest from 'reqwest'
import doT from 'olado/doT'
import madlib from './lib/madlib'
import sendEvent from './lib/event'
import geocode from './lib/geocode'
import distance from './lib/distance'

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
                    sendEvent('location', {'latlng': [center[1], center[0]], 'type': 'user'});
                }
            });
        
    });

    if ('geolocation' in navigator) {
        userLocationEl.style.display = 'block';
        userLocationEl.addEventListener('click', () => {
            userLocationEl.removeAttribute('data-has-error');
            userLocationEl.setAttribute('data-is-loading', '');

            navigator.geolocation.getCurrentPosition(function (position) {
                var loc = position.coords.latitude + "," + position.coords.longitude;
                // console.log(loc);

                // geocode(loc, (err, resp) => {
                //     if (!err) {
                //         console.log(resp);
                //     }
                // });
            }, function (err) {
                console.log(err);
                userLocationEl.removeAttribute('data-is-loading');
                userLocationEl.addAttribute('data-has-error', '');
            });

            userLocationEl.blur();
        });
    }

    window.addEventListener('location', evt => {
        var latlng = evt.detail.latlng;
        console.log(distance(contrib.latlng, latlng))
    });

    iframeMessenger.enableAutoResize();
};
