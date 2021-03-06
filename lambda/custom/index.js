"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Alexa = __importStar(require("ask-sdk"));
var Class_1 = require("./Class");
var Constant_1 = require("./Constant");
// Helper
var SpeechHelper = __importStar(require("./SpeechHelper"));
var NewsAPI = require('newsapi');
var newsapi = new NewsAPI('abf132c54ec14a7a8d3817cb48abee71');
var request = require('request-promise');
var LaunchRequestHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, result, newUser, initialUserAttributes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        speechText = "";
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        result = _a.sent();
                        if (Object.keys(result).length === 0) {
                            speechText += "Welcome to Adventure Assistant! " +
                                "Say I am leaving before you going out and I will " +
                                "tell you about the news, the weather, and remind you what to bring before you leave the house! " +
                                "Now try saying I am leaving";
                            newUser = new Class_1.User();
                            newUser.InitializeUser();
                            initialUserAttributes = newUser.GetJson();
                            handlerInput.attributesManager.setPersistentAttributes(initialUserAttributes);
                            handlerInput.attributesManager.savePersistentAttributes();
                            handlerInput.attributesManager.setSessionAttributes({
                                IsFirstSession: true,
                                YesHandler: Constant_1.Handler.GoingOutIntentHandler,
                                NoHandler: Constant_1.Handler.GoodByeIntentHandler
                            });
                        }
                        else {
                            speechText += "Hi there, are you leaving for an adventure?";
                            handlerInput.attributesManager.setSessionAttributes({
                                IsFirstSession: false,
                                YesHandler: Constant_1.Handler.GoingOutIntentHandler,
                                NoHandler: Constant_1.Handler.GoodByeIntentHandler
                            });
                        }
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .withShouldEndSession(false)
                                .getResponse()];
                }
            });
        });
    }
};
var GoingOutIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GoingOutIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, weatherSpeech, toBringItemSpeech, user, _a, requestEnvelope, serviceClientFactory, consentToken, deviceId, deviceAddressServiceClient, address, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        speechText = '';
                        weatherSpeech = '';
                        toBringItemSpeech = '';
                        _a = Class_1.User.bind;
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        user = new (_a.apply(Class_1.User, [void 0, _d.sent()]))();
                        // Get to bring item
                        toBringItemSpeech += GetToBringItemSpeech(user);
                        speechText += SpeechHelper.AddBreak(toBringItemSpeech, 1);
                        // Get Weather
                        weatherSpeech += "About the weather. ";
                        requestEnvelope = handlerInput.requestEnvelope, serviceClientFactory = handlerInput.serviceClientFactory;
                        consentToken = requestEnvelope.context.System.user.permissions && requestEnvelope.context.System.user.permissions.consentToken;
                        if (!!consentToken) return [3 /*break*/, 2];
                        weatherSpeech = "I do not have the permission to check your current location for the weather.";
                        return [3 /*break*/, 9];
                    case 2:
                        _d.trys.push([2, 8, , 9]);
                        deviceId = requestEnvelope.context.System.device.deviceId;
                        if (!(serviceClientFactory != null)) return [3 /*break*/, 6];
                        deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
                        return [4 /*yield*/, deviceAddressServiceClient.getFullAddress(deviceId)];
                    case 3:
                        address = _d.sent();
                        if (!(address.postalCode != undefined)) return [3 /*break*/, 5];
                        _b = weatherSpeech;
                        return [4 /*yield*/, GetWeather(address.postalCode)];
                    case 4:
                        weatherSpeech = _b + _d.sent();
                        _d.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        console.log("service clinent is null");
                        _d.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        _c = _d.sent();
                        weatherSpeech += "There is an error, we cannot retrieve the current weather.";
                        return [3 /*break*/, 9];
                    case 9:
                        speechText += SpeechHelper.AddBreak(weatherSpeech, 1);
                        speechText += "Would you like to hear the news?";
                        handlerInput.attributesManager.setSessionAttributes({
                            IsFirstSession: false,
                            YesHandler: Constant_1.Handler.GetNewsIntentHandler,
                            NoHandler: Constant_1.Handler.GoodByeIntentHandler,
                            GoingOut: "Yes"
                        });
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .withShouldEndSession(false)
                                .getResponse()];
                }
            });
        });
    }
};
var GetNewsIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetNewsIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var newsSpeech, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("In get news");
                        newsSpeech = "";
                        newsSpeech += "Today news. ";
                        _a = newsSpeech;
                        return [4 /*yield*/, GetNews(true)];
                    case 1:
                        newsSpeech = _a + _b.sent();
                        newsSpeech += "Have fun";
                        console.log(newsSpeech);
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(newsSpeech)
                                .getResponse()];
                }
            });
        });
    }
};
var GetWeatherIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetWeatherIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var weatherSpeech, requestEnvelope, serviceClientFactory, consentToken, deviceId, deviceAddressServiceClient, address, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        weatherSpeech = "";
                        weatherSpeech += "About the weather. ";
                        requestEnvelope = handlerInput.requestEnvelope, serviceClientFactory = handlerInput.serviceClientFactory;
                        consentToken = requestEnvelope.context.System.user.permissions && requestEnvelope.context.System.user.permissions.consentToken;
                        if (!!consentToken) return [3 /*break*/, 1];
                        weatherSpeech = "I do not have the permission to check your current location for the weather.";
                        return [3 /*break*/, 8];
                    case 1:
                        _c.trys.push([1, 7, , 8]);
                        deviceId = requestEnvelope.context.System.device.deviceId;
                        if (!(serviceClientFactory != null)) return [3 /*break*/, 5];
                        deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
                        return [4 /*yield*/, deviceAddressServiceClient.getFullAddress(deviceId)];
                    case 2:
                        address = _c.sent();
                        if (!(address.postalCode != undefined)) return [3 /*break*/, 4];
                        _a = weatherSpeech;
                        return [4 /*yield*/, GetWeather(address.postalCode)];
                    case 3:
                        weatherSpeech = _a + _c.sent();
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.log("service clinent is null");
                        _c.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        _b = _c.sent();
                        weatherSpeech += "There is an error, we cannot retrieve the current weather.";
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, handlerInput.responseBuilder
                            .speak(weatherSpeech)
                            .withShouldEndSession(false)
                            .getResponse()];
                }
            });
        });
    }
};
var AddItemToListIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddItemToListIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, user, _a, requestEnvelope, intentRequest, list, item, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        speechText = '';
                        _a = Class_1.User.bind;
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        user = new (_a.apply(Class_1.User, [void 0, _b.sent()]))();
                        requestEnvelope = handlerInput.requestEnvelope;
                        intentRequest = requestEnvelope.request;
                        if (intentRequest.intent.slots[Constant_1.ItemType].value == null) {
                            return [2 /*return*/, handlerInput.responseBuilder
                                    .addDelegateDirective()
                                    .getResponse()];
                        }
                        list = user.GetList(Constant_1.Always);
                        item = intentRequest.intent.slots[Constant_1.ItemType].value;
                        result = list.AddItem(item);
                        if (result == Constant_1.CRUDResult.Exist) {
                            speechText += "You already have " + item + " in your to bring item.";
                        }
                        else {
                            speechText += item + " is added to your list.";
                            handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
                            handlerInput.attributesManager.savePersistentAttributes();
                        }
                        speechText += " What else can I help?";
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .withShouldEndSession(false)
                                .getResponse()];
                }
            });
        });
    }
};
var EmptyListIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'EmptyListIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, user, _a, requestEnvelope, intentRequest;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        speechText = "";
                        _a = Class_1.User.bind;
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        user = new (_a.apply(Class_1.User, [void 0, _b.sent()]))();
                        requestEnvelope = handlerInput.requestEnvelope;
                        intentRequest = requestEnvelope.request;
                        if (user.EmptyList(Constant_1.Always)) {
                            speechText += "I emptied your list. Do you need anything else?";
                            handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
                            handlerInput.attributesManager.savePersistentAttributes();
                        }
                        else {
                            speechText += "List does not exist";
                        }
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .withShouldEndSession(false)
                                .getResponse()];
                }
            });
        });
    }
};
var RemoveItemFromListIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveItemFromListIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, user, _a, requestEnvelope, intentRequest, list, item, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        speechText = "";
                        _a = Class_1.User.bind;
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        user = new (_a.apply(Class_1.User, [void 0, _b.sent()]))();
                        requestEnvelope = handlerInput.requestEnvelope;
                        intentRequest = requestEnvelope.request;
                        if (intentRequest.intent.slots[Constant_1.ItemType].value == null) {
                            return [2 /*return*/, handlerInput.responseBuilder
                                    .addDelegateDirective()
                                    .getResponse()];
                        }
                        list = user.GetList(Constant_1.Always);
                        item = intentRequest.intent.slots[Constant_1.ItemType].value;
                        result = list.RemoveItem(item);
                        if (result == Constant_1.CRUDResult.NotExist) {
                            speechText += "You do not have " + item + " in your to bring item.";
                        }
                        else {
                            speechText += item + " is removed from your list.";
                            handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
                            handlerInput.attributesManager.savePersistentAttributes();
                        }
                        speechText += " What else can I help?";
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .withShouldEndSession(false)
                                .getResponse()];
                }
            });
        });
    }
};
var GetItemFromListIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetItemFromListIntent';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, user, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        speechText = "";
                        _a = Class_1.User.bind;
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        user = new (_a.apply(Class_1.User, [void 0, _b.sent()]))();
                        speechText += GetItemFromListSpeech(user);
                        speechText += " What else can I help?";
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .withShouldEndSession(false)
                                .getResponse()];
                }
            });
        });
    }
};
var HelpIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle: function (handlerInput) {
        var speechText = "Before you leave the house, you can say I am off or I am leaving. " +
            "I will tell you 2 recent news, the current weather, and a reminder of what you should bring. " +
            "If you want to add an item to your reminder list, say add item. " +
            "Say remove item if you want to remove an item.";
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withShouldEndSession(false)
            .getResponse();
    }
};
var CancelAndStopIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle: function (handlerInput) {
        var speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Goodbye', speechText)
            .getResponse();
    }
};
var YesIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent');
    },
    handle: function (handlerInput) {
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        switch (sessionAttributes.YesHandler) {
            case Constant_1.Handler.GoingOutIntentHandler:
                console.log("giubg out");
                return GoingOutIntentHandler.handle(handlerInput);
            case Constant_1.Handler.GetNewsIntentHandler:
                console.log("get news");
                return GetNewsIntentHandler.handle(handlerInput);
            default:
                var speechText = "Sorry! We encounter a problem.";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse();
        }
    }
};
var NoIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
    },
    handle: function (handlerInput) {
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        switch (sessionAttributes.NoHandler) {
            case Constant_1.Handler.GoodByeIntentHandler:
                return GoodByeIntentHandler.handle(handlerInput);
            default:
                var speechText = "Sorry! We encounter a problem.";
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .getResponse();
        }
    }
};
var SessionEndedRequestHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle: function (handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};
// Internal Handler
var GoodByeIntentHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle: function (handlerInput) {
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        console.log(sessionAttributes);
        var speechText = "";
        if (sessionAttributes.GoingOut === "Yes") {
            speechText = "Have fun";
        }
        else {
            speechText = 'GoodBye!';
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
//////////////////////////////////////////////////////////////////////////
// NEWS Helper
//////////////////////////////////////////////////////////////////////////
function GetNews(isGetNews) {
    return new Promise(function (resolve, reject) {
        console.log("In GetNews");
        var speech = "";
        if (!isGetNews) {
            resolve(speech);
        }
        newsapi.v2.topHeadlines({
            language: 'en',
            country: 'us',
            pageSize: 10
        }).then(function (data) {
            console.log(data);
            if (data.status !== "ok") {
                resolve(speech);
            }
            speech = GetNewsSpeech(data);
            resolve(speech);
        }).catch(function (error) {
            console.log(error);
            reject();
        });
        console.log("End GetNews");
    });
}
//////////////////////////////////////////////////////////////////////////
// Weather Helper
//////////////////////////////////////////////////////////////////////////
function GetWeather(postalCode) {
    return new Promise(function (resolve, reject) {
        var speech = '';
        request({
            "method": "GET",
            "uri": "https://api.openweathermap.org/data/2.5/weather?zip=" + postalCode.substring(0, 5) + ",us&appid=01d76e09769a4a3911a32ff79aae2e66",
            "json": true,
        })
            .then(function (data) {
            speech += GetWeatherConditionSpeech(data.weather[0].id);
            resolve(speech);
        })
            .catch(function (error) {
            reject();
        });
    });
}
function GetWeatherConditionSpeech(code) {
    var speech = "";
    switch (code) {
        case 200:
        case 201:
        case 202:
        case 230:
        case 231:
        case 232:
            speech += "Thunderstorm with rain. Be safe out there, do play with long rod, and remember to grab a rain jacket not an umbrella. ";
            break;
        case 210:
        case 211:
        case 212:
        case 221:
            speech += "Thunderstorm with rain. Be safe out there and please do NOT play with long rod. ";
            break;
        case 300:
        case 301:
        case 302:
            speech += "It's just drizzling, you will be okay without rain jacket but it's up to you. ";
            break;
        case 310:
        case 311:
        case 312:
        case 313:
        case 314:
        case 321:
            speech += "Heavily drizzling, you definitely need a rain jacket or an umbrella. ";
            break;
        case 500:
        case 501:
            speech += "It's raining a little, grab a rain jacket or an umbrella on the way out, or you will be kinda wet. ";
            break;
        case 502:
        case 503:
        case 504:
            speech += "It's heavily rainning right now, you will regret not bring a rain jacket or an umbrella, and wearing rain boots. ";
            break;
        case 511:
            speech += "It's rainning and cold, wear something warm along with your rain protection gear. ";
            break;
        case 520:
        case 521:
        case 522:
            speech += "It's SHOWERING. Here is the list, rain jacket, maybe rain pants, warn clothes, and rain boots. ";
            break;
        case 531:
            speech += "It's a level above shower rain. You know what to do. ";
            break;
        case 600:
            speech += "Light snow, don't get too excited yet. ";
            break;
        case 601:
            speech += "It's snow, go out and enjoy! ";
            break;
        case 602:
            speech += "Heavy snow, make sure to bring good warm clothes so that you can enjoy the snow. ";
            break;
        case 611:
        case 612:
            speech += "It's just sleet, go back in, just kidding, wear that nice rain boots before you go ";
            break;
        case 615:
        case 616:
            speech += "It's rainning and snowing, wear warm and water prepellant clothes. ";
            break;
        case 620:
        case 621:
        case 622:
            speech += "Well, it's really snowing, go out with cautious and wear multiple layer of warm clothes. ";
            break;
        case 701:
            speech += "Mist is the current weather, becareful where you go. ";
            break;
        case 711:
            speech += "It's smokey outside, wear a mask if you have. ";
            break;
        case 721:
            speech += "It's hazy right now. ";
            break;
        case 721:
            speech += "Mist is the current weather, becareful where you go. ";
            break;
        case 731:
            speech += "It's kinda sandy outside, wear glasses and mask. ";
            break;
        case 741:
            speech += "It's foggy right now. ";
            break;
        case 751:
            speech += "It's kinda sandy outside, wear glasses and mask. ";
            break;
        case 761:
            speech += "It's kinda dusty outside, wear glasses and mask. ";
            break;
        case 762:
            speech += "There are some volcanic ash in the air, please wear a mask. ";
            break;
        case 771:
            speech += "There is a squall, becareful. ";
            break;
        case 781:
            speech += "It's a tornado outside, just stay inside unless you have evacuation call. ";
            break;
        case 800:
            speech += "Clear sky for you, bring your sun glasses is a good idea, you can thanks me later. ";
            break;
        case 801:
        case 802:
        case 803:
        case 804:
            speech += "It's just cloudy, whatever, you do you. ";
            break;
    }
    return speech;
}
//////////////////////////////////////////////////////////////////////////
// News Helper
//////////////////////////////////////////////////////////////////////////
function GetNewsSpeech(newsData) {
    var speech = "";
    var count = 0;
    for (var _i = 0, _a = newsData.articles; _i < _a.length; _i++) {
        var news = _a[_i];
        if (count == 3)
            break;
        if (news.description == null || news.description === "")
            continue;
        speech += "From " + news.source.name + ": " + news.description + ". ";
        count++;
    }
    return speech;
}
//////////////////////////////////////////////////////////////////////////
// Bring Item Helper
//////////////////////////////////////////////////////////////////////////
function GetToBringItemSpeech(data) {
    console.log("In GetToBringItem");
    var numberOfList = data.GetNumberOfList();
    var alwaysList = data.GetList(Constant_1.Always);
    if (numberOfList === 1) {
        console.log("Just always");
        if (alwaysList.NumberOfItem() === 0) {
            console.log("Empty");
            return "You have not told me what item you would like to bring everytime you go out. " +
                "You can add item that you want to bring by saying add to bring item. ";
        }
        else {
            console.log("Not Empty");
            var speech = "Don't forget to bring your ";
            var itemList = alwaysList.GetList();
            for (var _i = 0, itemList_1 = itemList; _i < itemList_1.length; _i++) {
                var item = itemList_1[_i];
                speech += item + ", ";
            }
            // Remove the last ", " and add a period
            speech = speech.substr(0, speech.length - 2);
            speech += ". ";
            return speech;
        }
    }
}
function GetItemFromListSpeech(data) {
    console.log("In GetToBringItem");
    var numberOfList = data.GetNumberOfList();
    var alwaysList = data.GetList(Constant_1.Always);
    if (numberOfList === 1) {
        console.log("Just always");
        if (alwaysList.NumberOfItem() === 0) {
            console.log("Empty");
            return "You have not told me what item you would like to bring everytime you go out. " +
                "You can add item that you want to bring by saying add to bring item. ";
        }
        else {
            console.log("Not Empty");
            var speech = 'You have ';
            var itemList = alwaysList.GetList();
            for (var _i = 0, itemList_2 = itemList; _i < itemList_2.length; _i++) {
                var item = itemList_2[_i];
                speech += item + ", ";
            }
            // Remove the last ", " and add a period
            speech = speech.substr(0, speech.length - 2);
            speech += " in your list. ";
            return speech;
        }
    }
}
// Lambda init
var persistenceAdapterConfig = {
    tableName: "AdventureAssistant",
    partitionKeyName: "userId",
    createTable: true,
};
var persistenceAdapter = new Alexa.DynamoDbPersistenceAdapter(persistenceAdapterConfig);
exports.handler = Alexa.SkillBuilders.standard()
    .addRequestHandlers(LaunchRequestHandler, GoingOutIntentHandler, GetNewsIntentHandler, AddItemToListIntentHandler, RemoveItemFromListIntentHandler, GetItemFromListIntentHandler, EmptyListIntentHandler, HelpIntentHandler, CancelAndStopIntentHandler, YesIntentHandler, NoIntentHandler, SessionEndedRequestHandler)
    .withTableName("AdventureAssistant")
    .withAutoCreateTable(true)
    .lambda();
