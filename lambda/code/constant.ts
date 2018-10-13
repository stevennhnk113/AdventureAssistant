export const ToBringItemLists = "ToBringItemLists";
export const Always = "always";
export const ItemType = "ItemType";

export enum CRUDResult
{
	Success = "Success",
	Failed = "Failed",
	Exist = "Exist",
	NotExist = "Not Exist"
}

export enum Handler
{
	LaunchRequestHandler = "LaunchRequestHandler",
	GoingOutIntentHandler = "GoingOutIntentHandler",
	GetNewsIntentHandler = "GetNewsIntentHandler",
	GetWeatherIntentHandler = "GetWeatherIntentHandler",
	AddItemToListIntentHandler = "AddItemToListIntentHandler",
	RemoveItemFromListIntentHandler = "RemoveItemFromListIntentHandler",
	GetItemFromListIntentHandler = "GetItemFromListIntentHandler",
	GoodByeIntentHandler = "GoodByeIntentHandler"
}