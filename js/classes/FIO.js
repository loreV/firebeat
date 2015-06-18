/**
 * Created by lore on 29.05.15.
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
 * @param blob
 * @param folder
 * @param filename
 * @param onSuccess
 * @private
 */
FIO.prototype._saveToSD = function (blob, folder, filename, onSuccess) {
    var req = this.sdCard.addNamed(blob, this.recordingsFolder + filename);
    console.log(filename);
    req.onsuccess = function () {
        var name = this.result;
        console.log("The file " + name + " was saved");
        onSuccess(F.utils.io.recordingsFolder + filename);
    }
    req.onerror = function () {
        console.warn('Unable to write the file: ' + this.error);
    };
};

FIO.prototype.loadFromSD = function (path, onSuccess) {
    var req = this.sdCard.get(path);

    req.onsuccess = function () {
        var file = this.result;
        console.log("Get the file: " + file.name);
        onSuccess(file);
    }

    req.onerror = function () {
        console.warn("Unable to get the file: " + this.error);
    }
}

FIO.prototype.autosave = function () {

};

FIO.prototype.loadBeat = function (nameOfTheFile, onSuccess) {

    F.utils.io.loadFromSD((F.utils.io.baseFolder + name), function (e) {

        var reader = new FileReader();
        reader.addEventListener("loadend", function () {
            // reader.result contains the contents of blob as a typed array
        });
        var txt = reader.readAsText(blob);

        onSuccess(txt);


        // TODO parse text and shit

        // load in an prepare the screen

    });


};

FIO.prototype.saveBeat = function (name, contentOfFile, onSuccess) {
    var filename = name;
    var blob = new Blob([contentOfFile], {type: "application/json"})
    //TODO check if the file already exist
    this._saveToSD(blob, this.baseFolder, filename, onSuccess);
};
/***
 *
 * @param {blob} data to be saved
 * @param {function} onSuccess
 */
FIO.prototype.saveRecording = function (blob, onSuccess) {
    var filename = Date.now().toString() + ".wav";
    this._saveToSD(blob, this.recordingsFolder, filename, onSuccess);
};


FIO.prototype.openRecording = function () {

};

FIO.prototype.simpleSave = function(name, value){
    localStorage.setItem(name, value);
};

FIO.prototype.simpleLoad = function(name){
    return localStorage.getItem(name, value);
};


FIO.prototype.initDatabase = function () {
    var request = indexedDB.open('Firebeat', 1);
    request.onsuccess = function (e) {
        FIO.db = e.target.result;
    };

    request.onerror = function (e) {
        console.error(e);
    };

    request.onupgradeneeded = function (e) {
        FIO.db = e.target.result;
        if (FIO.db.objectStoreNames.contains("beats")) {
            FIO.db.deleteObjectStore("beats");
        }
        var objectStore = FIO.db.createObjectStore("beats", {keyPath: 'id', autoIncrement: true});
        console.log("Object store has been upgraded");
    };
};


FIO.prototype.loadFromDatabase = function (whatToRetrieve, callback) {
    var transaction = FIO.db.transaction(['beats']);
    var store = transaction.objectStore('beats');
    store.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        var list = [];
        if (cursor) {
            var value = cursor.value;
            list.push(value);
        }
        /**
         * Passes the list to a callback
         */
        callback(list);
    }

};


FIO.prototype.saveToDatabase = function (value, whatToStore, callback) {
    var transaction = FIO.db.transaction(['beats'], 'readwrite');
    var store = transaction.objectStore('beats');
    var request = store.add(value);
    request.onsuccess = function (e) {
        callback();
    };
    request.onerror = function (e) {
        console.error(e.value);
    };
};