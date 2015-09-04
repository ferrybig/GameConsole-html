var mainEndPoint = "http://82.95.146.179:8000/service";
var currentseed = "";
var proofOfWorkRequired = 0;
var myProofOfWorks = [];
var webWorkersProofs;
var workNow = 0;
var sessionToken = "";
var processors = navigator.hardwareConcurrency + 1 || 4;
var constructedPasswordCallback = false;
var userLoggedIn = false;
var knownServers = {};
var runningStateTimeouts = [];
var activeServer = undefined;

$(function () {
    $.ajax({
        type: "GET",
        url: mainEndPoint + "?service=config",
        dataType: "json",
        success: function (data) {
            var endpoints = data.endpoints;
            console.log("New endpoints discovered: " + endpoints);
            if (endpoints.length > 0) {
                var newLoc = getLocation(endpoints[0]);
                console.log("New loc: " + newLoc);
                var oldLoc = getLocation(mainEndPoint);
                console.log("Old loc: " + oldLoc);
                if (newLoc.host === undefined || newLoc.host.length === 0) {
                    newLoc.host = oldLoc.host;
                }
                if (newLoc.protocol === undefined || newLoc.protocol.length === 0) {
                    newLoc.protocol = oldLoc.protocol;
                }
                if (newLoc.port === undefined || newLoc.port.length === 0) {
                    newLoc.port = oldLoc.port || (newLoc.protocol === "https" ? 443 : 80);
                }

                mainEndPoint = newLoc.protocol + "//" + newLoc.host + newLoc.pathname;
                console.log("New mainendpoint: " + mainEndPoint);
            }
            if (data.authmethod === "none") {
                mainPanel();
            } else if (data.authmethod === "password") {
                authPassword();
            } else if (data.authmethod === "url") {
                authURL();
            } else {
                errorOut("Unsupported auth method: " + data.authmethod);
            }
        },
        error: function (errMsg, shortError, longError) {
            errorOut("Throuble with connecting to main endpoint: (" + shortError + ": " + longError + ")");
        }
    });

});

function errorOut(message) {
    $("#loginContainer").removeClass("fullsize");
    $("#loginContainer").addClass("error");
    $("#loginContainer > *").hide();
    $("#loginContainer > #auth-error").show();
    $("#errormessage").text(message);
    console.log(message);
}

function authPassword() {
    $("#loginContainer > *").hide();
    $("#loginContainer > #auth-password").show();
    currentseed === "";
    if (!constructedPasswordCallback) {
        constructedPasswordCallback = true;
        $("#auth-password").submit(function () {
            $("#loginContainer > *").hide();
            $("#loginContainer > #auth-password-next").show();
            userLoggedIn = true;
            checkPasswordLogin();
            event.preventDefault();
        });
    }
    requestNewSeed();
}
function checkPasswordLogin() {
    if (userLoggedIn) {
        if (currentseed === "") {
            $("#auth-password-next-message").text("Requesting auth token...");
        } else if (myProofOfWorks.lenght < proofOfWorkRequired) {
            $("#auth-password-next-message").text("Using cpu time to prove your a real human... ("
                    + myProofOfWorks.lenght + "/" + proofOfWorkRequired + ")");
        } else {
            // Can login now...
            userLoggedIn = false;
            $("#auth-password-next-message").text("Logging in...");
            $.ajax({
                type: "POST",
                url: mainEndPoint + "?service=password",
                dataType: "json",
                data: JSON.stringify(
                        {
                            password: $("#password").val(),
                            username: $("#username").val(),
                            random: currentseed,
                            proofofwork: myProofOfWorks
                        }
                ),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    sessionToken = data.session_token;
                    if (sessionToken === undefined || sessionToken.length === 0) {
                        authPassword();
                    } else {
                        mainPanel();
                    }
                },
                error: function (errMsg, shortError, longError) {
                    errorOut("Throuble with connecting to the password endpoint: (" + shortError + ": " + longError + ")");
                }
            });
        }
    }
}

function requestNewSeed() {
    $.ajax({
        type: "POST",
        url: mainEndPoint + "?service=password",
        dataType: "json",
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            currentseed = data.random;
            proofOfWorkRequired = data.proofs || 0;
            myProofOfWorks = [];
            checkPasswordLogin();
            if (proofOfWorkRequired > 0) {
                startGeneratingProofOfWork();
            }
        },
        error: function (errMsg, shortError, longError) {
            errorOut("Throuble with connecting to the password endpoint: (" + shortError + ": " + longError + ")");
        }
    });
}
function startGeneratingProofOfWork() {
    if (typeof (Worker) !== "undefined") {
        if (typeof (w) === "undefined") {
            w = [];
            for (var i = 0; i < processors; i++)
                w[i] = new Worker("js/webworker_proof_of_work.js");
        }
        workNow = 1;
        var message = {
            dificulty: 4,
            seed: currentseed
        };
        for (var i = 0; i < processors; i++) {
            (function (t) {
                w[t].onmessage = function (event) {

                    myProofOfWorks.push(event.data);
                    if (workNow++ < proofOfWorkRequired)
                        w[t].postMessage(message);

                    else
                    {
                        stopWorker();
                    }
                    checkPasswordLogin();
                };
                w[t].postMessage(message);
            })(i);
        }
    } else {
        errorOut("No webworker support, cannot generate proof of work to verify I am a legit computer")
    }
}

function stopWorker() {
    for (var i = 0; i < processors; i++) {
        w[i].terminate();
    }
    w = undefined;
}
function authURL() {

}
function getLocation(href) {
    var match = href.match(/^((https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?))?(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[2],
        host: match[3],
        hostname: match[4],
        port: match[5],
        pathname: match[6],
        search: match[7],
        hash: match[8]
    };
}

//$(function () {
//    $(".server-information .navbar > *").click(function () {
//        var l = $(this);
//        $(".server-information .tabs > *").hide();
//        $(".server-information .tabs > ." + l.attr('class')).show();
//    });
//});








function mainPanel(hasAllPermissions) {
    $("#loginContainer > *").hide();
    $("#loginContainer").addClass("fullsize");
    $("#loginContainer > #console-frame").show();
    if (hasAllPermissions) {
        $(".create-server").show();
    }
    refreshServers();
    runningStateTimeouts.push(window.setInterval(refreshServers, 60000));
}
function refreshServers() {
    var newServers = {};
    $.ajax({
        type: "POST",
        url: mainEndPoint + "",
        dataType: "json",
        data: JSON.stringify({
            action: "status",
            target: "management",
            authkey: sessionToken
        }),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            $.each(data, function (index, element) {
                newServers[index] = {
                    status: element.status,
                    name: element.smalldescription || index,
                    binding: element.ip,
                    owner: element.owner,
                    exitCode: element.exitCode,
                    readIndex: knownServers[index] && knownServers[index].readIndex || 0,
                    log: knownServers[index] && knownServers[index].log || []
                };
            });
        }
    });
    $.each(knownServers, function (index, element) {
        if (!newServers[index]) {
            if (element.elementList) {
                if(activeServer === index) {
                    activeServer = undefined;
                }
                element.elementList.remove();
                element.elementPanel.remove();
            }
        }
    });
    $.each(newServers, function (index, element) {
        if (knownServers[index] !== undefined) {
            element.elementList = $('#console-servers').append($("#server-template-list").html());
                element.elementPanel = $('#console-body').append($("#server-template-main").html());
                element.elementList.click(function () {
                    $('#console-body .server-information').hide();
                    element.elementPanel.show();
                    activeServer = index;
                });
                $(".server-title",element.elementList).text(element.name);
                $(".quickdesc",element.elementList).text(element.binding);
                $(".owner",element.elementList).text(element.owner);
        }
    });
    knownServers = newServers;
    $.each(knownServers, function (index, element) {
        setStatus(element.elementList, element.status, element.exitCode);
    });
}
function setStatus(serverDiv, status, exitcode) {
    var newStatus;
    var newStatusClass;
    if (status === "stopped") {
        if (exitcode !== "0" && exitcode !== undefined) {
            newStatusClass = "error";
            newStatus = "Crashed: " + exitcode;
        } else {
            newStatusClass = "offline";
            newStatus = "Offline";
        }
    } else {
        newStatusClass = "online";
        newStatus = "online";
    }
    var id = $(".server-status", serverDiv);
    id.attr("class", "server-status");
    id.addClass(newStatusClass);
    id.text(newStatus);
}
var consoleInterval = undefined;
function fetchConsole() {
    if (consoleInterval !== undefined) {
        window.clearTimeout(consoleInterval);
    }
    fetchConsoleTask();
}
function fetchConsoleTask() {
    consoleInterval = undefined;
    $.ajax({
        type: "POST",
        url: mainEndPoint,
        data: JSON.stringify(
                {
                    "target": "server",
                    "action": "log",
                    "server": activeServer,
                    "blocking": true,
                    "readIndex": knownServers[activeServer].readIndex
                }
        ),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (readIndex !== data.oldReadIndex && readIndex !== 0) {
                appendLog("\\nBUFFER OVERRUN, skipping " + (data.oldReadIndex - readIndex) + " characters of console output\\n", 2);
            }
            readIndex = data.nextReadIndex;
            if (data.log)
                appendLog(data.log);
            if (consoleInterval === undefined)
                if (data.oldReadIndex === data.nextReadIndex) {

                    consoleInterval = window.setTimeout(fetchConsoleTask, 5000);
                } else if (data.readIndex !== data.nextReadIndex) {
                    consoleInterval = window.setTimeout(fetchConsoleTask, 100);
                } else {
                    window.setTimeout(fetchConsoleTask, 1000);
                }

        },
        error: function (errMsg) {
            consoleInterval = window.setTimeout(fetchConsoleTask, 10000);
        }
    });
}