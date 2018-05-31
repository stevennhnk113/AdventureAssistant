import * as Alexa from 'ask-sdk';
import { DynamoDB, DeviceFarm } from 'aws-sdk';
import { services, IntentRequest } from "ask-sdk-model";
import { resolve } from 'dns';
import { rejects } from 'assert';
import { stringify } from 'querystring';
import { INSPECT_MAX_BYTES } from 'buffer';

import { User, ItemList } from "./class";
import { Always, ItemType, CRUDResult } from "./constant";

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
			speechText += 'Welcome to Adventure Assistant!';

			let newUser = new User();
			newUser.InitializeUser();
			let initialUserAttributes = newUser.GetJson();

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
	async handle(handlerInput: Alexa.HandlerInput) {
		let speechText = '';
		let weatherSpeech = '';
		let newsSpeech = '';
		let toBringItemSpeech = '';
		let user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);

		// Get news
		newsSpeech += "Today news. ";
		newsSpeech += await GetNews(true);
		speechText += SpeechHelper.AddBreak(newsSpeech, 1);

		// Get Weather
		weatherSpeech += "About the weather. ";
		const { requestEnvelope, serviceClientFactory } = handlerInput;
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
		speechText += SpeechHelper.AddBreak(weatherSpeech, 1);

		// Get to bring item
		toBringItemSpeech += "Also. Don't for get to bring your ";
		toBringItemSpeech += GetToBringItemSpeech(user);
		speechText += SpeechHelper.AddBreak(toBringItemSpeech, 1);

		speechText += "Have fun";

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Have fun', speechText)
			.getResponse();
	}
};

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
			speechText += "You already have " + item + " in your to bring item";

			handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
			handlerInput.attributesManager.savePersistentAttributes();
		}
		else
		{
			speechText += item + " is added to your list."
		}

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Have fun', speechText)
			.getResponse();
	}
};

const RemoveItemFromListIntentHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'RemoveItemFromListIntent';
	},
	async handle(handlerInput: Alexa.HandlerInput) {
		let speechText = '<speak>';

		const user = new User(await handlerInput.attributesManager.getPersistentAttributes() as User);
		const { requestEnvelope } = handlerInput;
		const intentRequest = requestEnvelope.request as IntentRequest;
		
		if(intentRequest.intent.slots[ItemType].value == null)
		{
			speechText += "<speak>";
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
			speechText += item + " is removed to your list."

			handlerInput.attributesManager.setPersistentAttributes(user.GetJson());
			handlerInput.attributesManager.savePersistentAttributes();
		}

		speechText += "<speak>";

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
		const speechText = 'You can say I am off!';

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('You can say I am off!', speechText)
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

const SessionEndedRequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		//any cleanup logic goes here
		return handlerInput.responseBuilder.getResponse();
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
			console.log("No GetNews");
			resolve(speech);
		}

		newsapi.v2.topHeadlines({
			language: 'en',
			country: 'us', 
			pageSize: 2
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
// SPEECH Helper
//////////////////////////////////////////////////////////////////////////
function GetNewsSpeech(newsData: any) {
	var speech = ""
	for (let news of newsData.articles) {
		speech += "From " + news.source.name + ": " + news.description + " ";
	}

	return speech;
}

//////////////////////////////////////////////////////////////////////////
// Bring Item Helper
//////////////////////////////////////////////////////////////////////////

function GetToBringItemSpeech(data: User) {
	console.log("In GetToBringItem");

	var numberOfList = data.GetNumberOfList();
	var alwaysList = GetList(data, "always");

	if (numberOfList === 1) {
		console.log("Just always");
		if (alwaysList.NumberOfItem() === 0) {
			console.log("Empty");
			return "You have not told me what item you would like to bring everytime you go out. " +
				"You can add item that you want to bring by saying add to bring item. ";
		} else {
			console.log("Not Empty");
			let speech = '';
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

function GetList(data: User, listName: string) : ItemList {
	return data.ToBringItemLists.get(listName);
}

// These are simple operation but import for maintainent
// IF there is a change in database document field name, we only need to change at 1 location
// function DoesListExist(data: Alexa.HandlerInput, listName: [any]) {
// 	console.log("In DoesListExist");
// 	console.log("List name: " + listName);
// 	console.log("Attributes: ");
// 	console.log(data.attributes);
// 	return (listName in data.attributes.toBringList);
// }

// function NumberOfList(data: Alexa.HandlerInput) : number {
// 	console.log("In NumberOfList");
// 	console.log("Num of list: " + Object.keys(data.attributesManager. .toBringList).length);
// 	return Object.keys(data.attributes.toBringList).length;
// }

// function RemoveList(data: Alexa.HandlerInput, listName) {
// 	console.log("In RemoveList");
// 	console.log(data.attributes);

// 	if (DoesListExist(data, listName)) {
// 		delete data.attributes.toBringList[listName];
// 		return true;
// 	} else {
// 		console.log("List not exist");
// 		return false;
// 	}
// }

// function EmptyList(data: Alexa.HandlerInput, listName) {
// 	console.log("In EmptyList");
// 	console.log(data.attributes);

// 	if (DoesListExist(data, listName)) {
// 		data.attributes.toBringList[listName] = [];
// 		return true;
// 	} else {
// 		console.log("List not exist");
// 		return false;
// 	}
// }

// function AddItemToList(data: Alexa.HandlerInput, listName, itemName) {
// 	console.log("In AddItemToList");
// 	console.log(data.attributes);

// 	if (!DoesListExist(data, listName)) {
// 		console.log("List not exist");
// 		return -1;
// 	}

// 	console.log("List exist");
// 	if (data.attributes.toBringList[listName].includes(itemName)) {
// 		console.log("Item exist");
// 		return 0;
// 	} else {
// 		data.attributes.toBringList[listName].push(itemName);
// 		console.log("Item added");
// 		return 1;
// 	}
// }

// function RemoveItemFromList(data: Alexa.HandlerInput, listName, itemName) {
// 	console.log("In AddItemToList");
// 	console.log(data.attributes);

// 	if (!DoesListExist(data, listName)) {
// 		console.log("List not exist");
// 		return -1;
// 	}

// 	if (data.attributes.toBringList[listName].includes(itemName)) {
// 		return 0;
// 	} else {
// 		const index = data.attributes.toBringList[listName].indexOf(itemName);
// 		data.attributes.toBringList[listName].slice(index, 1);
// 		return 1;
// 	}
// }

// function IsSlotValueFilled(data: Alexa.HandlerInput, slotName) {
// 	console.log("In IsSlotValueFilled");

// 	console.log(data.event.request.intent.slots);
// 	console.log(slotName);

// 	return data.event.request.intent.slots[slotName].value;

// 	// For testing purpose
// 	// if (data.event.request.intent.slots[slotName].value) {
// 	// 	console.log("Slot is filled");
// 	// 	return true;
// 	// } else {
// 	// 	console.log("Slot is not filled");
// 	// 	return false;
// 	// }

// }

// function GetSlotValue(data: Alexa.HandlerInput, slotName) {
// 	console.log("In GetSlotValue");
// 	if (IsSlotValueFilled(data, slotName)) {
// 		return data.event.request.intent.slots[slotName].value;
// 	} else {
// 		return null;
// 	}
// }

// function SetSlotValue(data: Alexa.HandlerInput, slotName, value) {
// 	console.log("In SetSlotValue");
// 	data.event.request.intent.slots[slotName].value = value;
// }

// Class



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
		AddItemToListIntentHandler,
		RemoveItemFromListIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler)
	.withTableName("AdventureAssistant")
	.withAutoCreateTable(true)
	.lambda(); 