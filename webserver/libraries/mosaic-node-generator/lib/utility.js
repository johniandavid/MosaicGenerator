"use strict";
exports.__esModule = true;
function catchEm(promise) {
    return promise.then(function (data) { return [null, data]; })["catch"](function (err) { return [err]; });
}
exports.catchEm = catchEm;
;
