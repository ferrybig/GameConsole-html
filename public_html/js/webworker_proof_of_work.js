importScripts('jssha/src/sha512.js');
onmessage = function (e) {
    var tempStr;
    var discoveredPieces = 0;
    var start = e.data.seed + Math.random();
    var temp = 0;
    var difficulty = e.data.dificulty;
    while (discoveredPieces < difficulty)
    {

        tempStr = start + (temp++) + Math.random();

        var hashObj = new jsSHA(
                "SHA-512",
                "TEXT",
                {numRounds: 1}
        );

        hashObj.update(tempStr);
        var tmp = hashObj.getHash("HEX");

        for (var i = 0, len = tmp.length; i < len; i++)
        {

            if (tmp[i] !== "0")
                break;

        }

        discoveredPieces = i;

    }

    postMessage(tempStr);
};