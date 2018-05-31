import { Always, CRUDResult } from "./constant";

export class User {
	ToBringItemLists: Map<string, ItemList>;

	constructor()
	constructor(data: any)
	constructor(data?: any) {
		if(data == null) {
			this.ToBringItemLists = null;
		} else {
			this.ToBringItemLists = new Map<string, ItemList>();

			Object.keys(data.ToBringItemLists).forEach((key) => {
				this.ToBringItemLists.set(key, new ItemList(data.ToBringItemLists[key]));
			})
		}
	}

	InitializeUser() {
		this.ToBringItemLists = new Map<string, ItemList>();
		this.AddList(Always);
	}

	AddList(listName: string) : void {
		this.ToBringItemLists.set(listName, new ItemList());
		this.ToBringItemLists.get(listName).Name = listName;
	}

	GetList(listName: string) : ItemList {
		if(this.ToBringItemLists.has(listName))
		{
			return this.ToBringItemLists.get(listName);
		}
		else
		{
			return null;
		}
	}

	GetNumberOfList() : number {
		if(this.ToBringItemLists == null) return -1;
		else return this.ToBringItemLists.size;
	}

	GetJson() : any {
		var temp = {
			ToBringItemLists: Object.create(null)
		}

		this.ToBringItemLists.forEach((value, key, map) => {
			temp.ToBringItemLists[key] = value.GetJson();
		})

		return temp;
	}
}

export class ItemList {
	constructor()
	constructor(data: ItemList)
	constructor(data?: any) {
		if(data == null) {
			this.Name = null;
			this.Items = new Set<string>();
		} else {
			this.Name = data.Name;
			this.Items = new Set<string>();

			for(let item of data.Items) {
				this.Items.add(item);
			}
		}
	}
	Name: string;
	private Items: Set<string>;

	AddItem(item: string) : CRUDResult
	{
		if(this.Items.has(item))
		{
			return CRUDResult.Exist;
		}
		else
		{
			this.Items.add(item);
			return CRUDResult.Success;
		}
	}

	RemoveItem(item: string) : CRUDResult
	{
		if(this.Items.has(item))
		{
			this.Items.delete(item);
			return CRUDResult.Success;
		}
		else
		{
			return CRUDResult.NotExist;
		}
	}

	NumberOfItem() : number 
	{
		return this.Items.size;
	}

	GetList() : Array<string>
	{
		return Array.from(this.Items);
	}

	GetJson() : any {

		let tempArray = new Array<string>();

		this.Items.forEach((value, value2, set) => {
			tempArray.push(value);
		})

		return {
			Name: this.Name,
			Items: tempArray
		}
	}
}