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
        var speechText = 'Have fun';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Have fun', speechText)
            .getResponse();
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