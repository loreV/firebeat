/**
 * Created by lore on 29.05.15.
 * FIO is a simple helper class for the application firebeat.
 * It requires the use of aSyncStorage.
 */

function FIO() {
    try {
        this.sdCard = navigator.getDeviceStorage("sdcard");
    } catch (e) {
        console.warn("No firefox os");
    }
    this.db = null;
    this.baseFolder = "Firebeat/";
    this.saveFolder = "save/";
    this.autosaveFolder = this.baseFolder + "autosaves/";
    this.recordingsFolder = this.baseFolder + "recordings/";
};
/**
 *
 * @param blob to be saved
 * @param folder url to folder
 * @param filename
 * @param onSuccess
 * @private
 */
FIO.prototype._saveToDB = function (blob, filename, onSuccess) {
    asyncStorage.setItem(filename, blob, onSuccess);
};
/***
 * Retrieves an element from the INDEXEDDB and calls the onSuccess function
 * @param name
 * @type String
 * @param onSuccess
 * @type Function
 * @private
 */
FIO.prototype._loadFromDB = function (name, onSuccess) {
    asyncStorage.getItem(name, onSuccess);
};
/***
 * Loads a beat and calls onsuccess callback when that is completed
 * @param nameOfTheFile
 * @type String
 * @param onSuccess
 * @type Function
 */
FIO.prototype.loadBeat = function (nameOfTheFile, onSuccess) {
    this._loadFromDB(nameOfTheFile, onSuccess);

};
/***
 * Saves a beat as JSON file, and it call the onsuccess callback when that is done
 * @param name
 * @param contentOfFile
 * @param onSuccess
 */
FIO.prototype.saveBeat = function (name, contentOfFile, onSuccess) {
    var filename = name + ".json";
    var blob = new Blob([contentOfFile], {type: "application/json"});
    //TODO check if the file already exist
    console.log(filename);
    this._saveToDB(blob, filename, onSuccess);
};
/***
 * Assigns a timestamp name to a recording and saves it
 * @param {blob} data to be saved
 * @param {function} onSuccess
 */
FIO.prototype.saveRecording = function (name, blob, onSuccess) {
    var filename = name;
    this._saveToDB(blob, filename, onSuccess);
};
/**
 * Destroy a recording
 * @param name
 * @param callback
 */
FIO.prototype.deleteFromDb = function (name, callback) {
    asyncStorage.removeItem(name, callback);
}


FIO.prototype.openRecording = function () {

};

FIO.prototype.simpleSave = function(name, value){
    localStorage.setItem(name, value);
};

FIO.prototype.simpleLoad = function(name){
    return localStorage.getItem(name);
};


//FIO.prototype.initDatabase = function () {
//    var request = indexedDB.open('Firebeat', 1);
//    request.onsuccess = function (e) {
//        FIO.db = e.target.result;
//    };
//
//    request.onerror = function (e) {
//        console.error(e);
//    };
//
//    request.onupgradeneeded = function (e) {
//        FIO.db = e.target.result;
//        if (FIO.db.objectStoreNames.contains("beats")) {
//            FIO.db.deleteObjectStore("beats");
//        }
//        var objectStore = FIO.db.createObjectStore("beats", {keyPath: 'id', autoIncrement: true});
//        console.log("Object store has been upgraded");
//    };
//};
//
//
//FIO.prototype.loadFromDatabase = function (whatToRetrieve, callback) {
//    var transaction = FIO.db.transaction(['beats']);
//    var store = transaction.objectStore('beats');
//    store.openCursor().onsuccess = function (e) {
//        var cursor = e.target.result;
//        var list = [];
//        if (cursor) {
//            var value = cursor.value;
//            list.push(value);
//        }
//        /**
//         * Passes the list to a callback
//         */
//        callback(list);
//    }
//
//};
//
//
//FIO.prototype.saveToDatabase = function (value, whatToStore, callback) {
//    var transaction = FIO.db.transaction(['beats'], 'readwrite');
//    var store = transaction.objectStore('beats');
//    var request = store.add(value);
//    request.onsuccess = function (e) {
//        callback();
//    };
//    request.onerror = function (e) {
//        console.error(e.value);
//    };
//};

//***
// * Attempts to remove the file at the given location.
// * @param url
// * @param callback
// * @private
// */
//FIO.prototype._removeExistentFile = function (url, callback) {
//    var req = this.sdCard.delete(url);
//
//    req.onsuccess = function () {
//        // file is overwritten
//        callback();
//    }
//
//    req.onerror = function () {
//        console.warn("Something weird happen trying to remove an existing file.");
//    }
//
//}
//
///**
// * Check for a file existence and if not found or upon confirmation it runs the callback.
// * @param url
// * @param condition
// * @param callback
// * @private
// */
//FIO.prototype._checkFileExistence = function (url, condition, callback, blob, onSuccess) {
//    var req = this.sdCard.get(url);
//    //var callback = callback;
//    //var f = this;
//    callback(blob, url, onSuccess);
//    ////var reqRm = function(){ f._removeExistentFile(url, callback, blob, onSuccess)};
//    //req.onsuccess = function(){
//    //    console.log("hrll");
//    //    if(condition()){
//    //        // remove file
//    //        reqRm();
//    //    } else {
//    //    //    operation is aborted
//    //        console.log("Operation Aborted");
//    //    }
//    //}
//    //req.onerror = function (){
//    //    callback(blob, url, onSuccess);
//    //}
//    //console.log("Reached!");
//};


//FIO.prototype._loadFromDB = function (path, onSuccess) {
//    var req = this.sdCard.get(path);
//
//    req.onsuccess = function () {
//        var file = this.result;
//        console.log("Get the file: " + file.name);
//        onSuccess(file);
//    }
//
//    req.onerror = function () {
//        console.warn("Unable to get the file: " + this.error);
//    }
//}
//
//FIO.prototype.autosave = function () {
//
//};

//FIO.prototype._saveToDB = function (blob, folder, filename, onSuccess) {
//
//    var env = this;
//    //TODO check the right folder!!
//    var req = this.sdCard.addNamed(blob, (folder + filename));
//    req.onsuccess = function () {
//        var name = this.result;
//        console.log("The file " + name + " was saved");
//        onSuccess(name);
//    };
//    req.onerror = function () {
//        if(this.error.name = "NoModificationAllowedError"){
//            var conf = confirm("The file already exist.\nDo you want to overwrite it?");
//            if(conf){
//                env._removeExistentFile(filename,function(){alert("done");})
//            }
//        }
//        console.log(filename);
//        console.warn('Unable to write the file: ' + this.error);
//    };
//
//
//};
//F.utils.io._loadFromDB((F.utils.io.baseFolder + name), function (e) {
//
//    var reader = new FileReader();
//    reader.addEventListener("loadend", function () {
//        // reader.result contains the contents of blob as a typed array
//    });
//    var txt = reader.readAsText(blob);
//    onSuccess(txt);
//
//
//    // TODO parse text and shit
//
//    // load in an prepare the screen
//
//});