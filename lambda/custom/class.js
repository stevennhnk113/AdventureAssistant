"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constant_1 = require("./Constant");
var User = /** @class */ (function () {
    function User(data) {
        var _this = this;
        if (data == null) {
            this.ToBringItemLists = null;
        }
        else {
            this.ToBringItemLists = new Map();
            Object.keys(data.ToBringItemLists).forEach(function (key) {
                _this.ToBringItemLists.set(key, new ItemList(data.ToBringItemLists[key]));
            });
        }
    }
    User.prototype.InitializeUser = function () {
        this.ToBringItemLists = new Map();
        this.AddList(Constant_1.Always);
    };
    User.prototype.AddList = function (listName) {
        this.ToBringItemLists.set(listName, new ItemList());
        this.ToBringItemLists.get(listName).Name = listName;
    };
    User.prototype.GetList = function (listName) {
        if (this.ToBringItemLists.has(listName)) {
            return this.ToBringItemLists.get(listName);
        }
        else {
            return null;
        }
    };
    User.prototype.GetNumberOfList = function () {
        if (this.ToBringItemLists == null)
            return -1;
        else
            return this.ToBringItemLists.size;
    };
    User.prototype.GetJson = function () {
        var temp = {
            ToBringItemLists: Object.create(null)
        };
        this.ToBringItemLists.forEach(function (value, key, map) {
            temp.ToBringItemLists[key] = value.GetJson();
        });
        return temp;
    };
    return User;
}());
exports.User = User;
var ItemList = /** @class */ (function () {
    function ItemList(data) {
        if (data == null) {
            this.Name = null;
            this.Items = new Set();
        }
        else {
            this.Name = data.Name;
            this.Items = new Set();
            for (var _i = 0, _a = data.Items; _i < _a.length; _i++) {
                var item = _a[_i];
                this.Items.add(item);
            }
        }
    }
    ItemList.prototype.AddItem = function (item) {
        if (this.Items.has(item)) {
            return Constant_1.CRUDResult.Exist;
        }
        else {
            this.Items.add(item);
            return Constant_1.CRUDResult.Success;
        }
    };
    ItemList.prototype.RemoveItem = function (item) {
        if (this.Items.has(item)) {
            this.Items.delete(item);
            return Constant_1.CRUDResult.Success;
        }
        else {
            return Constant_1.CRUDResult.NotExist;
        }
    };
    ItemList.prototype.NumberOfItem = function () {
        return this.Items.size;
    };
    ItemList.prototype.GetList = function () {
        return Array.from(this.Items);
    };
    ItemList.prototype.GetJson = function () {
        var tempArray = new Array();
        this.Items.forEach(function (value, value2, set) {
            tempArray.push(value);
        });
        return {
            Name: this.Name,
            Items: tempArray
        };
    };
    return ItemList;
}());
exports.ItemList = ItemList;
