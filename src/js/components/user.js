import doT from 'olado/doT'
import common from '../lib/common'
import share from '../lib/share'
import madlib from '../lib/madlib'
import scrollTo from '../lib/scrollTo'
import sendEvent from '../lib/event'
import geocode from '../lib/geocode'
import distance from '../lib/distance'

import template from './templates/user.html!text'

var templateFn = doT.template(template);

var shareFn = share('How can you help the refugee crisis?', 'http://www.theguardian.com/world/ng-interactive/2015/oct/03/refugee-help-efforts', '#refugee');

export default function User(el, contributions, onTypeChange) {
    var $$ = s => [].slice.apply(el.querySelectorAll(s));

    el.innerHTML = templateFn({contributions, 'types': common.types});

    madlib(el.querySelector('.js-location'), loc => {
        geocode(loc, (err, resp) => {
            if (!err) {
                var center = resp.features[0].center;
                sendEvent('location', {'latlng': [center[1], center[0]], 'type': 'user'});
            }
        });
    });

    var contributionsEl = el.querySelector('.js-contributions');
    contributionsEl.classList.add('type--all');

    var enabledTypes = [];
    $$('.js-type').forEach(typeEl => {
        var type = typeEl.getAttribute('data-type');
        typeEl.addEventListener('click', () => {
            var index = enabledTypes.indexOf(type);
            if (index !== -1) {
                enabledTypes.splice(index, 1);
            } else {
                enabledTypes.push(type);
            }
            typeEl.classList.toggle('is-selected', index === -1);
            contributionsEl.classList.toggle(`type--${type}`, index === -1);
            contributionsEl.classList.toggle('type--all', enabledTypes.length === 0);

            onTypeChange(enabledTypes);
        });
    });

    var contributionEls = $$('.js-contribution');
    var lastContributionId;
    contributionEls.forEach((contributionEl, contributionId) => {
        contributionEl.addEventListener('click', () => {
            if (contributionId === lastContributionId) {
                sendEvent('hide-contribution');
                lastContributionId = -1;
            } else {
                sendEvent('show-contribution', {'id': contributionId})
                lastContributionId = contributionId;
            }
        });
    });

    var clearEl = el.querySelector('.js-clear');
    clearEl.addEventListener('click', () => sendEvent('clear'));

    $$('.interactive-share').forEach(shareEl => {
        var network = shareEl.getAttribute('data-network');
        shareEl.addEventListener('click', () => shareFn(network));
    });

    if ('geolocation' in navigator) {
        let userLocationEl = el.querySelector('.js-gps');
        userLocationEl.style.display = 'block';
        userLocationEl.addEventListener('click', () => {
            userLocationEl.removeAttribute('data-has-error');
            userLocationEl.setAttribute('data-is-loading', '');

            navigator.geolocation.getCurrentPosition(function (position) {
                sendEvent('location', {'latlng': [position.coords.latitude, position.coords.longitude], 'type': 'user'});
                userLocationEl.removeAttribute('data-is-loading');
            }, function (err) {
                console.log(err);
                userLocationEl.removeAttribute('data-is-loading');
                userLocationEl.addAttribute('data-has-error', '');
            });

            userLocationEl.blur();
        });
    }

    var currentContributionEl;
    window.addEventListener('hide-contribution', () => {
        currentContributionEl.classList.remove('is-selected');
        currentContributionEl = null;
    });
    window.addEventListener('show-contribution', evt => {
        var contributionEl = contributionEls[evt.detail.id];
        if (currentContributionEl) {
            currentContributionEl.classList.remove('is-selected');
        }

        scrollTo(contributionsEl.scrollTop, contributionEl.offsetTop, y => contributionsEl.scrollTop = y);

        currentContributionEl = contributionEl;
        contributionEl.classList.add('is-selected');
    });

    var resultsEl = el.querySelector('.js-results');
    var resultsTextEl = el.querySelector('.js-results-text');
    window.addEventListener('location', evt => {
        var latlng = evt.detail.latlng;
        var count = 0;
        var topContributionEl = contributionsEl.childNodes[0];
        contributions.forEach((contrib, contributionId) => {
            var isResult = distance(contrib.latlng, latlng) < common.threshold;
            var contributionEl = contributionEls[contributionId];
            contributionEl.classList.toggle('is-not-result', !isResult);
            if (isResult) {
                contributionsEl.insertBefore(contributionEl, topContributionEl);
                count++;
            }
        });
        resultsEl.classList.add('has-results');
        resultsTextEl.textContent = `${count} result${count !== 1 ? 's' : ''} within 10 miles of your location`;
    });

    window.addEventListener('clear', () => {
        resultsEl.classList.remove('has-results');
        contributionEls.forEach(contributionEl => contributionEl.classList.remove('is-not-result'));
    });
}
