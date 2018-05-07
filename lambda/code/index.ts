import * as Alexa from 'ask-sdk';
import { DynamoDB } from 'aws-sdk';

const ToBringItemLists = "ToBringItemLists";
const Always = "Always";

const LaunchRequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		var speechText = "";
		
		var result = await handlerInput.attributesManager.getPersistentAttributes();
		
		if(Object.keys(result).length === 0){
			speechText += 'Welcome to Adventure Assistant!';

			var initialUserAttributes = {
				ToBringItemLists: {
					Always: []
				}
			}

			handlerInput.attributesManager.setPersistentAttributes(initialUserAttributes);
			handlerInput.attributesManager.savePersistentAttributes();
		} else {
			speechText += "Welcome back, how can I help you today?"
		}

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('Hello World', speechText)
			.getResponse();
	}
};

const GoingOutIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'GoingOutIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = 'Have fun';

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Have fun', speechText)
			.getResponse();
	}
};

const HelpIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = 'You can say hello to me!';

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('Hello World', speechText)
			.getResponse();
	}
};

const CancelAndStopIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
				|| handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = 'Goodbye!';

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Hello World', speechText)
			.getResponse();
	}
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput: Alexa.HandlerInput) {
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
	.addRequestHandlers(LaunchRequestHandler,
		GoingOutIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler)
	.withPersistenceAdapter(persistenceAdapter)
	.lambda();