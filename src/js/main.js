import reqwest from 'reqwest'
import bowser from 'ded/bowser'

import User from './components/user'
import Map from './components/map'

import mainHTML from './templates/main.html!text'

// Polyfills
import './lib/classList'

const contentURL = (bowser.msie && bowser.version < 10 ? '//' : 'https://') + 'interactive.guim.co.uk/docsdata/1f8nQa19Q0VMveMuPnfDFYBfh5IKRkP8APm5cLsyvXNk.json';

function pad(n) {
    return (n < 10 ? '0' : '') + n;
}

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML;

    reqwest({
        url: contentURL,
        type: 'json',
        crossOrigin: true,
        success: resp => {
            var date = new Date();
            var today = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());
            var contributions = resp.sheets.contributions.filter(c => !c.enddate || c.enddate >= today);

            contributions.forEach(contribution => {
                contribution.types = contribution.types.split(',').map(t => t.toLowerCase().trim()).filter(t => !!t);
                if (contribution.other) contribution.types.push('other');
                contribution.latlng = [parseFloat(contribution.latitude), parseFloat(contribution.longitude)];
            });

            app(contributions);
        }
    });

    function app(contributions) {
        var user = new User(el.querySelector('.js-user'), contributions,
                types => map.setVisibleTypes(types));
        var map = new Map(el.querySelector('.js-map'), config, contributions,
                contributionId => user.showContribution(contributionId));
    }
}
