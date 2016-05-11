const R = 6371000; // metres

function radians(deg) {
    return deg * Math.PI / 180;
}

export default function distance(latlng1, latlng2) {
    var φ1 = radians(latlng1[0]);
    var φ2 = radians(latlng2[0]);
    var Δφ = radians(latlng2[0] - latlng1[0]);
    var Δλ = radians(latlng2[1] - latlng1[1]);

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}