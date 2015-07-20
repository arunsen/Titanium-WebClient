// Public functions // ================
function webClient(method, url, data, onSuccess, onError, extraParams) {

    Ti.API.info("url  ==> " + url);
    // Check internet
    if (Titanium.Network.online === true) {

        // Create some default params
        var onSuccess = onSuccess ||
        function() {
        };
        var onError = onError ||
        function() {
        };
        var extraParams = extraParams || {};
        extraParams.async = (extraParams.hasOwnProperty('async')) ? extraParams.async : true;
        extraParams.ttl = extraParams.ttl || false;
        extraParams.shouldAuthenticate = extraParams.shouldAuthenticate || false;
        // if you set this to true, pass username and password as well
        extraParams.contentType = extraParams.contentType || "application/json";

        // If there is nothing cached, send the request
        if (!extraParams.ttl) {

            // Create the HTTP connection
            var xhr = Titanium.Network.createHTTPClient({
                enableKeepAlive : false,
                timeout : 30 // Currently set to 30 sec
            });
            // Create the result object
            var result = {};

            // Open the HTTP connection
            if (method == "GET")
                xhr.open("GET", url, extraParams.async);
            else
                xhr.open("POST", url, extraParams.async);

            xhr.setRequestHeader('Content-Type', extraParams.contentType);

            // If we need to authenticate
            if (extraParams.shouldAuthenticate) {
                var authstr = 'Basic ' + Titanium.Utils.base64encode(extraParams.username + ':' + extraParams.password);
                xhr.setRequestHeader('Authorization', authstr);
            }

            // When the connection was successful
            xhr.onload = function() {
                // Check the status of this
                result.status = xhr.status == 200 ? "ok" : xhr.status;

                if (method == "GET") {
                    // Check the type of content we should serve back to the user
                    if (extraParams.contentType.indexOf("application/json") != -1) {
                        result.data = xhr.responseText;
                    } else if (extraParams.contentType.indexOf("text/xml") != -1) {
                        result.data = xhr.responseXML;
                    } else {
                        result.data = xhr.responseData;
                    }
                } else {
                    result.data = xhr.responseText;
                }
                onSuccess(result);
            };

            // When there was an error
            xhr.onerror = function(e) {
                // Check the status of this     
                result = getErrorResponse(e, null, null);
                onError(result);

            };

            if (method == "GET")
                xhr.send();
            else
                xhr.send(JSON.stringify(data));

        } else {
            var result = {};
            result.status = "cache";
            result.data = cache;
            onSuccess(result);
        }

    } else {
        var result = {};
        var data = {};

        result.status = "error";
        result.Message = "Failed to retrieve the location as network connectivity is unavailable.";
        data.error = "Failed to retrieve the location as network connectivity is unavailable.";
        result.data = data;
        result.ErrorCode = 404;
        onError(result);
    }
};

function getErrorResponse(errorObject, errorCode, message) {
    var result = {};
    var data = {};
    var message = "An unexpected error occurred while accessing network.";

    result.status = "error";

    if (errorObject !== null && errorObject.error != null && errorObject.error !== "") {

        // File not found
        if (errorObject.error.indexOf("HTTP error", 0) !== -1) {

            result.ErrorCode = errorObject.code;
            result.Message = "An unexpected error occurred while accessing network.";
            data.error = "An unexpected error occurred while accessing network.";
            result.data = data;
        } else if (errorObject.error.indexOf("The request timed out", 0) !== -1) {
            result.ErrorCode = errorObject.code;
            result.Message = "The request has timed out.";
            data.error = "An unexpected error occurred while accessing network.";
            result.data = data;
        }

    } else if (errorCode != null) {

        if (errorCode === 404) {

            result.ErrorCode = errorCode;

            if (message != null && message !== "") {
                result.Message = message;
            } else {
                result.Message = "Failed to retrieve the location as network connectivity is unavailable.";
            }
            data.error = "Failed to retrieve the location as network connectivity is unavailable.";
            result.data = data;

        } else {

            result.ErrorCode = errorCode;
            data.error = message;
            result.data = data;
            result.Message = message;
        }
    }

    return result;
}
