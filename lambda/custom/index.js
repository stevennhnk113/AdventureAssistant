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
var NewsAPI = require('newsapi');
var newsapi = new NewsAPI('abf132c54ec14a7a8d3817cb48abee71');
var ToBringItemLists = "ToBringItemLists";
var Always = "Always";
var LaunchRequestHandler = {
    canHandle: function (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle: function (handlerInput) {
        return __awaiter(this, void 0, void 0, function () {
            var speechText, result, initialUserAttributes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        speechText = "";
                        return [4 /*yield*/, handlerInput.attributesManager.getPersistentAttributes()];
                    case 1:
                        result = _a.sent();
                        if (Object.keys(result).length === 0) {
                            speechText += 'Welcome to Adventure Assistant!';
                            initialUserAttributes = {
                                ToBringItemLists: {
                                    Always: []
                                }
                            };
                            handlerInput.attributesManager.setPersistentAttributes(initialUserAttributes);
                            handlerInput.attributesManager.savePersistentAttributes();
                        }
                        else {
                            speechText += "Welcome back, how can I help you today?";
                        }
                        return [2 /*return*/, handlerInput.responseBuilder
                                .speak(speechText)
                                .reprompt(speechText)
                                .withSimpleCard('Hello World', speechText)
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
            var speechText, requestEnvelope, serviceClientFactory, deviceId, deviceAddressServiceClient, address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        speechText = 'Have fun';
                        requestEnvelope = handlerInput.requestEnvelope, serviceClientFactory = handlerInput.serviceClientFactory;
                        deviceId = requestEnvelope.context.System.device.deviceId;
                        if (!(serviceClientFactory != null)) return [3 /*break*/, 2];
                        deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
                        return [4 /*yield*/, deviceAddressServiceClient.getFullAddress(deviceId)];
                    case 1:
                        address = _a.sent();
                        console.log(address);
                        _a.label = 2;
                    case 2: return [2 /*return*/, handlerInput.responseBuilder
                            .speak(speechText)
                            .withSimpleCard('Have fun', speechText)
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
        var speechText = 'You can say hello to me!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
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
            .withSimpleCard('Hello World', speechText)
            .getResponse();
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
//////////////////////////////////////////////////////////////////////////
// NEWS Helper
//////////////////////////////////////////////////////////////////////////
function GetNews(isGetNews) {
    return new Promise(function (resolve, reject) {
        console.log("In GetNews");
        var speech = "";
        if (!isGetNews) {
            console.log("No GetNews");
            resolve(speech);
        }
        newsapi.v2.topHeadlines({
            language: 'en',
            country: 'us'
        }).then(function (data) {
            console.log(data);
            if (data.status !== "ok") {
                resolve(speech);
            }
            speech = GetNewsSpeech(data);
        }).catch(function (error) {
            console.log(error);
            reject();
        });
        console.log("End GetNews");
    });
}
//////////////////////////////////////////////////////////////////////////
// SPEECH Helper
//////////////////////////////////////////////////////////////////////////
function GetNewsSpeech(newsData) {
    var speech = "";
    for (var _i = 0, _a = newsData.articles; _i < _a.length; _i++) {
        var news = _a[_i];
        speech += "From " + news.source.name + ": " + news.description + " ";
    }
    return speech;
}
function GetToBringItemSpeech(data) {
    console.log("In GetToBringItem");
    var numberOfList = NumberOfList(data);
    var alwaysList = GetList(data, "always");
    if (numberOfList === 1) {
        console.log("Just always");
        if (alwaysList.length === 0) {
            console.log("Empty");
            return "You have not told me what item you would like to bring everytime you go out. " +
                "You can add item that you want to bring by saying add to bring item. ";
        }
        else {
            var itemsList;
            for (i = 0; i < alwaysList.length; i++) {
                itemsList += cars[i] + ",";
            }
            console.log(itemsList);
            return itemsList;
        }
    }
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
// These are simple operation but import for maintainent
// IF there is a change in database document field name, we only need to change at 1 location
function DoesListExist(data, listName) {
    console.log("In DoesListExist");
    console.log("List name: " + listName);
    console.log("Attributes: ");
    console.log(data.attributes);
    return (listName in data.attributes.toBringList);
}
function NumberOfList(data) {
    console.log("In NumberOfList");
    console.log("Num of list: " + Object.keys(data.attributes.toBringList).length);
    return Object.keys(data.attributes.toBringList).length;
}
function RemoveList(data, listName) {
    console.log("In RemoveList");
    console.log(data.attributes);
    if (DoesListExist(data, listName)) {
        delete data.attributes.toBringList[listName];
        return true;
    }
    else {
        console.log("List not exist");
        return false;
    }
}
function EmptyList(data, listName) {
    console.log("In EmptyList");
    console.log(data.attributes);
    if (DoesListExist(data, listName)) {
        data.attributes.toBringList[listName] = [];
        return true;
    }
    else {
        console.log("List not exist");
        return false;
    }
}
function AddItemToList(data, listName, itemName) {
    console.log("In AddItemToList");
    console.log(data.attributes);
    if (!DoesListExist(data, listName)) {
        console.log("List not exist");
        return -1;
    }
    console.log("List exist");
    if (data.attributes.toBringList[listName].includes(itemName)) {
        console.log("Item exist");
        return 0;
    }
    else {
        data.attributes.toBringList[listName].push(itemName);
        console.log("Item added");
        return 1;
    }
}
function RemoveItemFromList(data, listName, itemName) {
    console.log("In AddItemToList");
    console.log(data.attributes);
    if (!DoesListExist(data, listName)) {
        console.log("List not exist");
        return -1;
    }
    if (data.attributes.toBringList[listName].includes(itemName)) {
        return 0;
    }
    else {
        var index = data.attributes.toBringList[listName].indexOf(itemName);
        data.attributes.toBringList[listName].slice(index, 1);
        return 1;
    }
}
function IsSlotValueFilled(data, slotName) {
    console.log("In IsSlotValueFilled");
    console.log(data.event.request.intent.slots);
    console.log(slotName);
    return data.event.request.intent.slots[slotName].value;
    // For testing purpose
    // if (data.event.request.intent.slots[slotName].value) {
    // 	console.log("Slot is filled");
    // 	return true;
    // } else {
    // 	console.log("Slot is not filled");
    // 	return false;
    // }
}
function GetSlotValue(data, slotName) {
    console.log("In GetSlotValue");
    if (IsSlotValueFilled(data, slotName)) {
        return data.event.request.intent.slots[slotName].value;
    }
    else {
        return null;
    }
}
function SetSlotValue(data, slotName, value) {
    console.log("In SetSlotValue");
    data.event.request.intent.slots[slotName].value = value;
}
// Class
// Lambda init
var persistenceAdapterConfig = {
    tableName: "AdventureAssistant",
    partitionKeyName: "userId",
    attributesName: undefined,
    createTable: true,
    dynamoDBClient: undefined,
    partitionKeyGenerator: undefined
};
var persistenceAdapter = new Alexa.DynamoDbPersistenceAdapter(persistenceAdapterConfig);
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler, GoingOutIntentHandler, HelpIntentHandler, CancelAndStopIntentHandler, SessionEndedRequestHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .lambda();
//# sourceMappingURL=index.js.map