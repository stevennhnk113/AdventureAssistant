"use strict";

var Alexa = require("alexa-sdk");
var request = require('request-promise');

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('abf132c54ec14a7a8d3817cb48abee71');

var handlers = {
	'LaunchRequest': function () {

		if (Object.keys(this.attributes).length === 0) {
			this.attributes.toBringList = {
				"always": []
			};

			this.response
				.speak('Hi there, I am here to prepare you before outdoor adventure. ' +
					'Right now, I can tell you the weather forcast of your location and remind your what to bring before you leave the house. ' +
					'and couple of headline from the news ' +
					'Just say I am leaving or I am off and I will assist you. Give it a try')
				.listen();
		} else {
			this.response.speak('What can I help you with?').listen();
		}

		this.emit(':responseReady');
	},

	'GoingOutIntent': function () {

		const apiAccessToken = this.event.context.System.apiAccessToken;
		const apiEndpoint = this.event.context.System.apiEndpoint;
		const deviceId = this.event.context.System.device.deviceId;

		var speakString = "";

		var country = "country=us";
		var apiKey = "apiKey=abf132c54ec14a7a8d3817cb48abee71";

		var toBringItemSpeech = GetToBringItemSpeech(this);

		const das = new Alexa.services.DeviceAddressService();
		das.getFullAddress(deviceId, apiEndpoint, apiAccessToken)
			.then((data) => request({
				"method": "GET",
				"uri": "https://api.openweathermap.org/data/2.5/weather?zip=" + data.postalCode.substring(0, 5) + ",us&appid=01d76e09769a4a3911a32ff79aae2e66",
				"json": true,
			}))
			.then((data) => {
				console.log(data);
				speakString += GetWeatherConditionSpeech(data.weather[0].id);
				speakString += "And " + toBringItemSpeech;
			})
			.then(() => GetNews(true))
			.then((data) => {
				console.log("Getting final string");
				speakString += GetNewsSpeech(data);

				this.response.speak(speakString);
				this.emit(':responseReady');
			})
			.catch((error) => {
				console.log(error);
				this.response.speak('error');
				this.emit(':responseReady');
			});
	},

	'OpenListIntent': function () {
		console.log("Intent started OpenAList");
		const slotType = "ListType";

		const itemListName = GetSlotValue(this, slotType);
		if (itemListName == null) {
			this.emit(":delegate");
			return;
		}

		const createNewListConfirmation = GetSlotValue(this, "CreateNewListConfirmation");

		const itemList = GetList(this, itemListName);

		if (itemList === null) {
			this.response.speak("You do not have a " + itemListName + " list. Do you want to open another one?");
			this.emit(":responseReady");
			return;
		}

		if (itemList.length === 0) {
			this.handler.state = "AddItemState";
			this.response.speak("You do not have any item in your " + itemListName + " list. Do you want to add items to this list?").listen("Do you want to add items to this list?");
		} else if (itemList.length === 1) {
			this.response.speak("You have a " + itemList.toString()).listen();
		} else {
			this.response.speak("You have " + itemList.toString()).listen();
		}

		this.emit(":responseReady");
	},

	'AddItemToAList': function () {
		console.log("Intent started AddItemToAList");
		const activityType = "ListType";
		const itemType = "ItemType";

		const listName = GetSlotValue(this, activityType);
		if (listName == null) {
			this.emit(":delegate");
			return;
		}

		const itemName = GetSlotValue(this, itemType);
		if (itemName == null) {
			this.emit(":delegate");
			return;
		}

		const result = AddItemToList(this, listName, itemName);

		if (result == 1) {
			this.response.speak("I just add " + itemName + " to " + listName + " list.");
		} else if (result == 0) {
			this.response.speak("The item is already there");
		} else {
			this.response.speak("You do not have a " + listName + " list");
		}

		this.emit(":responseReady");
	},

	'RemoveItemFromAList': function () {
		console.log("Intent started AddItemToAList");
		const activityType = "ListType";
		const itemType = "ItemType";

		if (!IsSlotValueFilled(this, activityType)) {
			this.emit(":delegate");
			return;
		}

		if (!IsSlotValueFilled(this, itemType)) {
			this.emit(":delegate");
			return;
		}

		const listName = GetSlotValue(this, activityType);
		const itemName = GetSlotValue(this, itemType);

		const result = AddItemToAList(this, listName, itemName);

		if (result == 1) {
			this.response.speak("I just remove " + item + " to " + listName + " list.");
		} else if (result == 0) {
			this.response.speak("You don't have that item in the list");
		} else {
			this.response.speak("You do not have a " + listName + " list");
		}

		this.emit(":responseReady");
	},

	'EmptyAList': function () {
		console.log("Intent started EmptyAList");
		const slotName = "ListType";

		if (!IsSlotValueFilled(this, slotName)) {
			this.emit(":delegate");
			return;
		}

		const itemListName = GetSlotValue(this, slotName);
		const result = EmptyList(this, itemListName);

		if (result) {
			this.response.speak("I just empty your " + itemListName + " list");
		} else {
			this.response.speak("You do not have a " + itemListName + " list");
		}

		this.emit(":responseReady");
	},

	'AMAZON.CancelIntent': CancelIntent,
	'AMAZON.HelpIntent': HelpIntent,
	'AMAZON.StopIntent': StopIntent,
	'SessionEndedRequest': SessionEndedRequest
};

// Item CRUD
var AddItemHandlers = Alexa.CreateStateHandler("AddItemState", {
	'AddItemToAList': function () {
		console.log("Intent started AddItemToAList AddItemHandlers");
		const activityType = "ListType";
		const itemType = "ItemType";

		const listName = GetSlotValue(this, activityType);
		if (listName == null) {
			this.emit(":delegate");
			return;
		}

		const itemName = GetSlotValue(this, itemType);
		if (itemName == null) {
			this.emit(":delegate");
			return;
		}

		const result = AddItemToList(this, listName, itemName);

		if (result == 1) {
			this.response.speak("I just add " + itemName + " to " + listName + " list.");
		} else if (result == 0) {
			this.response.speak("The item is already there");
		} else {
			this.response.speak("You do not have a " + listName + " list");
		}

		this.emit(":responseReady");
	},

	'AMAZON.YesIntent': function () {
		this.response.speak('What item do you want to add?').listen();
		this.emit(':responseReady');
	},

	'AMAZON.NoIntent': function () {
		this.response.speak('Let me know what else I can do.');
		this.emit(':responseReady');
	},

	'AMAZON.CancelIntent': CancelIntent,
	'AMAZON.HelpIntent': HelpIntent,
	'AMAZON.StopIntent': StopIntent,
	'SessionEndedRequest': SessionEndedRequest
});

function OpenAlwaysListIntent() {
	console.log("Intent started OpenAlwaysListIntent");
	const slotType = "ListType";

	const itemListName = "always";
	SetSlotValue(this, slotType, itemListName);

	const itemList = GetList(this, itemListName);

	if (itemList === null) {
		this.response.speak("You do not have a " + itemListName + " list. Do you want to open another one?");
		this.emit(":responseReady");
		return;
	}

	if (itemList.length === 0) {
		this.handler.state = "AddItemState";
		this.response.speak("You do not have any item in your " + itemListName + " list. Do you want to add items to this list?").listen("Do you want to add items to this list?");
	} else if (itemList.length === 1) {
		this.response.speak("You have a " + itemList.toString()).listen();
	} else {
		this.response.speak("You have " + itemList.toString()).listen();
	}

	this.emit(":responseReady");
}

function GetList(data, listName) {
	console.log("In GetList");
	console.log(data.attributes);

	if (DoesListExist(data, listName)) {
		console.log("List exist");
		return data.attributes.toBringList[listName];
	} else {
		console.log("List not exist");
		return null;
	}
}

function AddList(data, listName) {
	console.log("In AddList");
	console.log(data.attributes);

	if (DoesListExist(data, listName)) {
		console.log("List exist");
		return false;

	} else {
		console.log("List not exist");
		data.attributes.toBringList[listName] = [];
		return true;
	}
}

//////////////////////////////////////////////////////////////////////////
// Direction handler
//////////////////////////////////////////////////////////////////////////
function CancelIntent() {
	this.handler.state = "";
	this.response.speak('Bye');
	this.emit(':responseReady');
}

function HelpIntent() {
	this.response.speak('Help');
	this.emit(':responseReady');
}

function StopIntent() {
	this.handler.state = "";
	this.response.speak('Stop');
	this.emit(':responseReady');
}

function SessionEndedRequest() {
	this.handler.state = "";
	console.log('session ended!');
	this.emit(':saveState', true);
}

//////////////////////////////////////////////////////////////////////////
// NEWS Helper
//////////////////////////////////////////////////////////////////////////

function GetNews(isGetNews) {
	return new Promise((resolve, reject) => {
		console.log("In GetNews");
		var speech = "";
		if (!isGetNews) {
			console.log("No GetNews");
			resolve(speech);
		}

		newsapi.v2.topHeadlines({
			sources: 'bbc-news,cnn', 
			language: 'en',
			pageSize: 3
		}).then(data => {
			console.log(data);
			if (data.status !== "ok") {
				resolve(speech);
			}

			speech = GetNewsSpeech(data);

			resolve(speech);
		}).catch((error) => {
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
	console.log("In GetNewsSpeech")
	var speech = ""
	for (let news of newsData.articles) {
		speech += "From " + news.source.name + ": " + news.description + " ";
	}

	console.log(speech);
	return speech;
}

function GetToBringItemSpeech(data) {
	console.log("In GetToBringItem");

	var alwaysList = GetList(data, "always");

	if (alwaysList.length === 0) {
		console.log("Empty");
		return "You have not told me what item you would like to bring everytime you go out. " +
			"You can add item that you want to bring by saying add to bring item. ";
	} else {
		var itemsList;
		for (i = 0; i < alwaysList.length; i++) {
			itemsList += cars[i] + ",";
		}

		console.log(itemsList);

		return itemsList;
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

function RemoveList(data, listName) {
	console.log("In RemoveList");
	console.log(data.attributes);

	if (DoesListExist(data, listName)) {
		delete data.attributes.toBringList[listName];
		return true;
	} else {
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
	} else {
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
	} else {
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
	} else {
		const index = data.attributes.toBringList[listName].indexOf(itemName);
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
	} else {
		return null;
	}
}

function SetSlotValue(data, slotName, value) {
	console.log("In SetSlotValue");
	data.event.request.intent.slots[slotName].value = value;
}

exports.handler = function (event, context, callback) {
	var alexa = Alexa.handler(event, context);
	alexa.dynamoDBTableName = 'AdventureAssistant';
	alexa.registerHandlers(handlers, AddItemHandlers);
	alexa.execute();
};
