/**
 * Created by lore on 29.05.15.
 */
function FIO(){
    try{
        this.sdCard = navigator.getDeviceStorage("sdcard");
    } catch(e){
        console.warn("No firefox os");
    }
    this.db = null;
    this.baseFolder= "Firebeat/";
    this.autosaveFolder = this.baseFolder+"autosaves/";
    this.recordingsFolder=this.baseFolder+"recordings/";
};


FIO.prototype._saveToSD = function(blob, folder, filename, onSuccess){
    var req = this.sdCard.addNamed(blob, this.recordingsFolder+filename);


    req.onsuccess = function () {
        var name = this.result;
        console.log("The file " + name + " was saved");
        onSuccess( F.utils.io.recordingsFolder + filename);
    }
    req.onerror = function () {
        console.warn('Unable to write the file: ' + this.error);
    };
};

FIO.prototype.autosave = function(){

};

FIO.prototype.loadBeat = function(){

};

FIO.prototype.saveBeat = function(){

};
/***
 *
 * @param {blob} data to be saved
 * @param {function} onSuccess
 */
FIO.prototype.saveRecording = function(blob, onSuccess){
    // TODO - rename this file
    var filename = new Date().getMilliseconds().toString()+".wav";
    this._saveToSD(blob, this.recordingsFolder, filename, onSuccess);
};

FIO.prototype.openRecording = function(){

};

FIO.prototype.initDatabase = function(){
    var request = indexedDB.open('Firebeat', 1);
    request.onsuccess = function(e){
        FIO.db = e.target.result;
    };

    request.onerror = function (e) {
        console.error(e);
    };

    request.onupgradeneeded = function(e){
        FIO.db = e.target.result;
        if(FIO.db.objectStoreNames.contains("beats")){
            FIO.db.deleteObjectStore("beats");
        }
        var objectStore = FIO.db.createObjectStore("beats", {keyPath:'id', autoIncrement:true});
        console.log("Object store has been upgraded");
    };
};


FIO.prototype.loadFromDatabase = function(whatToRetrieve, callback) {
    var transaction = FIO.db.transaction(['beats']);
    var store = transaction.objectStore('beats');
    store.openCursor().onsuccess = function(e){
        var cursor = e.target.result;
        var list = [];
        if(cursor){
            var value = cursor.value;
            list.push(value);
        }
        /**
         * Passes the list to a callback
         */
        callback(list);
    }

};

FIO.prototype.saveToDatabase = function(value, whatToStore, callback){
    var transaction = FIO.db.transaction(['beats'], 'readwrite');
    var store = transaction.objectStore('beats');
    var request = store.add(value);
    request.onsuccess = function(e){

        callback();
    };
    request.onerror = function(e){
        console.error(e.value);
    };
};