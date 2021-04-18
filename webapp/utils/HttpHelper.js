sap.ui.define([
  "com/lonwyr/MyranorBot/controller/BaseController"
], function(
    BaseController
) {
    "use strict";
  
    var usertoken;
    const url = "/myranorbot/";

    function sendRequest(urlsuffix, method, headers = [], content) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (response) {
                if (this.readyState == 4 && this.status >= 200) {
                    if (this.status < 400) {
                        resolve(this.response);
                    } else {
                        reject('Something went wrong');
                    }
                 }
            }
            xhr.open(method, url + urlsuffix, true)
            headers.forEach(header => xhr.setRequestHeader(header.key, header.value))
            xhr.setRequestHeader('usertoken', usertoken)
            xhr.send(JSON.stringify(content));
        });
    }

    function sendPost(urlsuffix, content, headers = []) {
        headers.push({
            key: 'Content-Type',
            value: 'application/json'
        })
        return sendRequest(urlsuffix, "POST", headers, content);
    }

    function sendGet(urlsuffix, content, headers = []) {
        return sendRequest(urlsuffix, "GET", headers, content);
    }

    return {
        isUserTokenSet: function () {
            return !!usertoken;
        },
        validateUserToken: function (usertoken) {
            return sendPost('validateuser', {"token": usertoken});
        },
        setUserToken: function (usertokeninput) {
            usertoken = usertokeninput;
        },
        checkAttribute: function (content) {
            return sendPost(`check/attribute`, content);
        },
        checkSkill: function (content) {
            return sendPost(`check/skill`, content);
        },
        checkSpell: function (content) {
            return sendPost(`check/spell`, content);
        },
        checkAttack: function (content) {
            return sendPost(`check/attack`, content);
        },
        checkDefense: function (content) {
            return sendPost(`check/defense`, content);
        },
        getStart: function () {
            return sendGet('start').then(function (startString) {
                return JSON.parse(startString);
            });
        }
    }
})


