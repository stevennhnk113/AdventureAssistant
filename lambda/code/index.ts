import * as Alexa from 'ask-sdk';
import { DynamoDB, DeviceFarm } from 'aws-sdk';
import { services, IntentRequest } from "ask-sdk-model";
import { resolve } from 'dns';
import { rejects } from 'assert';
import { stringify } from 'querystring';
import { INSPECT_MAX_BYTES } from 'buffer';

import { User, ItemList } from "./Class";
import { Always, ItemType, CRUDResult, Handler } from "./Constant";

// Helper
import * as SpeechHelper from "./SpeechHelper";

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('abf132c54ec14a7a8d3817cb48abee71');

var request = require('request-promise');

const LaunchRequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		var speechText = "";
		
		var result = await handlerInput.attributesManager.getPersistentAttributes();
		
		if(Object.keys(result).length === 0){
			speechText += 	"Welcome to Adventure Assistant! " +
							"Say I am leaving before you going out and I will " +
							"tell you about the news, the weather, and remind you what to bring before you leave the house! " + 
							"Now try saying I am leaving";

			let newUser = new User();
			newUser.InitializeUser();
			let initialUserAttributes = newUser.GetJson();

			handlerInput.attributesManager.setPersistentAttributes(initialUserAttributes);
			handlerInput.attributesManager.savePersistentAttributes();

			handlerInput.attributesManager.setSessionAttributes(
				{
					IsFirstSession: true,
					YesHandler: Handler.GoingOutIntentHandler,
					NoHandler: Handler.GoodByeIntentHandler
				}
			);

		} else {
			speechText += "Hi there, are you leaving for an adventure?";

			handlerInput.attributesManager.setSessionAttributes(
				{
					IsFirstSession: false,
					YesHandler: Handler.GoingOutIntentHandler,
					NoHandler: Handler.GoodByeIntentHandler
				}
			);
		}

		return handlerInput.responseBuilder
			.speak(speechText)
			.withShouldEndSession(false)
			.getResponse();
	}
};

const GoingOutIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'GoingOutIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		let speechText = '';
		let weatherSpeech = '';
		let toBringItemSpeech = '';
		let user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);

		// Get to bring item
		toBringItemSpeech += GetToBringItemSpeech(user);
		speechText += SpeechHelper.AddBreak(toBringItemSpeech, 1);

		// Get Weather
		weatherSpeech += "About the weather. ";
		const { requestEnvelope, serviceClientFactory } = handlerInput;

		const consentToken = requestEnvelope.context.System.user.permissions && requestEnvelope.context.System.user.permissions.consentToken;
		if (!consentToken)
		{
			weatherSpeech = "I do not have the permission to check your current location for the weather.";
		}
		else
		{
			try
			{
				const { deviceId } = requestEnvelope.context.System.device;
				if(serviceClientFactory != null){
					const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
					const address = await deviceAddressServiceClient.getFullAddress(deviceId);
					
					if(address.postalCode != undefined) {
						weatherSpeech += await GetWeather(address.postalCode);
					}
				} else {
					console.log("service clinent is null");
				}
			}
			catch
			{
				weatherSpeech += "There is an error, we cannot retrieve the current weather.";
			}
		}
		
		speechText += SpeechHelper.AddBreak(weatherSpeech, 1);

		speechText += "Would you like to hear the news?";
		handlerInput.attributesManager.setSessionAttributes(
			{
				IsFirstSession: false,
				YesHandler: Handler.GetNewsIntentHandler,
				NoHandler: Handler.GoodByeIntentHandler,
				GoingOut: "Yes"
			}
		);

		return handlerInput.responseBuilder
			.speak(speechText)
			.getResponse();
	}
};

const GetNewsIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'GetNewsIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		let newsSpeech = "";
		newsSpeech += "Today news. ";
		newsSpeech += await GetNews(true);
		newsSpeech += "Have fun";

		return handlerInput.responseBuilder
			.speak(newsSpeech)
			.getResponse();
	}
}

const GetWeatherIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'GetWeatherIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		// Get Weather
		let weatherSpeech = "";
		weatherSpeech += "About the weather. ";
		const { requestEnvelope, serviceClientFactory } = handlerInput;

		const consentToken = requestEnvelope.context.System.user.permissions && requestEnvelope.context.System.user.permissions.consentToken;
		if (!consentToken)
		{
			weatherSpeech = "I do not have the permission to check your current location for the weather.";
		}
		else
		{
			try
			{
				const { deviceId } = requestEnvelope.context.System.device;
				if(serviceClientFactory != null){
					const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
					const address = await deviceAddressServiceClient.getFullAddress(deviceId);
					
					if(address.postalCode != undefined) {
						weatherSpeech += await GetWeather(address.postalCode);
					}
				} else {
					console.log("service clinent is null");
				}
			}
			catch
			{
				weatherSpeech += "There is an error, we cannot retrieve the current weather.";
			}
		}

		return handlerInput.responseBuilder
			.speak(weatherSpeech)
			.withShouldEndSession(false)
			.getResponse();
	}
}

const AddItemToListIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AddItemToListIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) { 

		let speechText = '';

		const user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);
		const { requestEnvelope } = handlerInput;
		const intentRequest = requestEnvelope.request as IntentRequest;
		
		if(intentRequest.intent.slots[ItemType].value == null)
		{
			return handlerInput.responseBuilder
			.addDelegateDirective()
			.getResponse();
		}

		let list = user.GetList(Always);
		const item = intentRequest.intent.slots[ItemType].value;

		const result = list.AddItem(item);

		if(result == CRUDResult.Exist)
		{
			speechText += "You already have " + item + " in your to bring item.";
		}
		else
		{
			speechText += item + " is added to your list."

			handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
			handlerInput.attributesManager.savePersistentAttributes();
		}

		speechText += " What else can I help?";

		return handlerInput.responseBuilder
			.speak(speechText)
			.withShouldEndSession(false)
			.getResponse();
	}
};

const EmptyListIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'EmptyListIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		let speechText = "";

		const user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);
		const { requestEnvelope } = handlerInput;
		const intentRequest = requestEnvelope.request as IntentRequest;
		
		if(user.EmptyList(Always))
		{
			speechText += "I emptied your list. Do you need anything else?";

			handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
			handlerInput.attributesManager.savePersistentAttributes();
		}
		else
		{
			speechText += "List does not exist";
		}

		return handlerInput.responseBuilder
			.speak(speechText)
			.withShouldEndSession(false)
			.getResponse();
	}
};

const RemoveItemFromListIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'RemoveItemFromListIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		let speechText = "";

		const user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);
		const { requestEnvelope } = handlerInput;
		const intentRequest = requestEnvelope.request as IntentRequest;
		
		if(intentRequest.intent.slots[ItemType].value == null)
		{
			return handlerInput.responseBuilder
			.addDelegateDirective()
			.getResponse();
		}

		let list = user.GetList(Always);
		const item = intentRequest.intent.slots[ItemType].value;

		const result = list.RemoveItem(item);

		if(result == CRUDResult.NotExist)
		{
			speechText += "You do not have " + item + " in your to bring item.";
		}
		else
		{
			speechText += item + " is removed from your list."

			handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
			handlerInput.attributesManager.savePersistentAttributes();
		}

		speechText += " What else can I help?";

		return handlerInput.responseBuilder
			.speak(speechText)
			.withShouldEndSession(false)
			.getResponse();
	}
};

const GetItemFromListIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'GetItemFromListIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		let speechText = "";

		const user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);

		speechText += GetItemFromListSpeech(user);

		speechText += " What else can I help?";

		return handlerInput.responseBuilder
			.speak(speechText)
			.withShouldEndSession(false)
			.getResponse();
	}
};

const HelpIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = 	"Before you leave the house, you can say I am off or I am leaving. " +
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
			.withSimpleCard('Goodbye', speechText)
			.getResponse();
	}
};

const YesIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent');
	},
	handle(handlerInput: Alexa.HandlerInput) {
		let sessionAttributes =  handlerInput.attributesManager.getSessionAttributes();

		switch(sessionAttributes.YesHandler)
		{
			case Handler.GoingOutIntentHandler:
				return GoingOutIntentHandler.handle(handlerInput);
			default:
				var speechText = "Sorry! We encounter a problem."

				return handlerInput.responseBuilder
				.speak(speechText)
				.getResponse();
		}
	}
};

const NoIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
	},
	handle(handlerInput: Alexa.HandlerInput) {
		let sessionAttributes =  handlerInput.attributesManager.getSessionAttributes();

		switch(sessionAttributes.NoHandler)
		{
			case Handler.GoodByeIntentHandler:
				return GoodByeIntentHandler.handle(handlerInput);
			default:
				var speechText = "Sorry! We encounter a problem.";

				return handlerInput.responseBuilder
				.speak(speechText)
				.getResponse();
		}
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

// Internal Handler
const GoodByeIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		let sessionAttributes =  handlerInput.attributesManager.getSessionAttributes();
		
		console.log(sessionAttributes);

		let speechText = "";
		if(sessionAttributes.GoingOut === "Yes"){
			speechText = "Have fun";
		}
		else
		{
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

function GetNews(isGetNews: boolean) : Promise<string> {
	return new Promise((resolve, reject) => {
		console.log("In GetNews");

		var speech = "";
		if (!isGetNews) {
			resolve(speech);
		}

		newsapi.v2.topHeadlines({
			language: 'en',
			country: 'us', 
			pageSize: 10
		}).then((data:any)  => {
			console.log(data);
			if (data.status !== "ok") {
				resolve(speech);
			}

			speech = GetNewsSpeech(data);
			resolve(speech);
		}).catch((error: any) => {
			console.log(error);
			reject();
		});

		console.log("End GetNews");
	});
}

//////////////////////////////////////////////////////////////////////////
// Weather Helper
//////////////////////////////////////////////////////////////////////////

function GetWeather(postalCode: string) : Promise<string>{
	return new Promise((resolve, reject) => {
		var speech = '';

		request({
			"method": "GET",
			"uri": "https://api.openweathermap.org/data/2.5/weather?zip=" + postalCode.substring(0, 5) + ",us&appid=01d76e09769a4a3911a32ff79aae2e66",
			"json": true,
		})
		.then((data:any) =>{
			speech += GetWeatherConditionSpeech(data.weather[0].id);
			resolve(speech);
		})
		.catch((error: any) => {
			reject();
		})
	})
}

function GetWeatherConditionSpeech(code: number) {
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
function GetNewsSpeech(newsData: any) {
	var speech = "";
	var count = 0;
	for (let news of newsData.articles) {
		if(count == 3) break;
		if(news.description == null || news.description === "") continue;
		
		speech += "From " + news.source.name + ": " + news.description + ". ";
		count++;
	}

	return speech;
}

//////////////////////////////////////////////////////////////////////////
// Bring Item Helper
//////////////////////////////////////////////////////////////////////////

function GetToBringItemSpeech(data: User) {
	console.log("In GetToBringItem");

	var numberOfList = data.GetNumberOfList();
	var alwaysList = data.GetList(Always);

	if (numberOfList === 1) {
		console.log("Just always");
		if (alwaysList.NumberOfItem() === 0) {
			console.log("Empty");
			return "You have not told me what item you would like to bring everytime you go out. " +
				"You can add item that you want to bring by saying add to bring item. ";
		} else {
			console.log("Not Empty");
			let speech = "Don't forget to bring your ";
			let itemList = alwaysList.GetList();

			for(let item of itemList)
			{
				speech += item + ", ";
			}

			// Remove the last ", " and add a period
			speech = speech.substr(0, speech.length - 2);
			speech += ". ";

			return speech;
		}
	}
}

function GetItemFromListSpeech(data: User) {
	console.log("In GetToBringItem");

	var numberOfList = data.GetNumberOfList();
	var alwaysList = data.GetList(Always);

	if (numberOfList === 1) {
		console.log("Just always");
		if (alwaysList.NumberOfItem() === 0) {
			console.log("Empty");
			return "You have not told me what item you would like to bring everytime you go out. " +
				"You can add item that you want to bring by saying add to bring item. ";
		} else {
			console.log("Not Empty");
			let speech = 'You have ';
			let itemList = alwaysList.GetList();

			for(let item of itemList)
			{
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
	//attributesName: undefined,
	//dynamoDBClient: undefined,
	//partitionKeyGenerator: undefined
};

var persistenceAdapter = new Alexa.DynamoDbPersistenceAdapter(persistenceAdapterConfig);

exports.handler = Alexa.SkillBuilders.standard()
	.addRequestHandlers(LaunchRequestHandler,
		GoingOutIntentHandler,
		GetNewsIntentHandler,
		AddItemToListIntentHandler,
		RemoveItemFromListIntentHandler,
		GetItemFromListIntentHandler,
		EmptyListIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		YesIntentHandler,
		NoIntentHandler,
		SessionEndedRequestHandler)
	.withTableName("AdventureAssistant")
	.withAutoCreateTable(true)
	.lambda(); 