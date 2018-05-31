"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function AddBreak(speech, second) {
    if (second === void 0) { second = 1; }
    return speech += "<break time=\"" + second + "s\"/>";
}
exports.AddBreak = AddBreak;
