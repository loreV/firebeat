/**
 * Created by lore on 23.05.15.
 */
function Track(defaultAudio, name, category) {
    this.name = name;
    this.path = "";
    this.category = category;
    this.type = "audio"; // Should be either audio or recording
    this.balance = 0;
    this.volume = 0.5;
    this.audioObj = defaultAudio;
}



Track.prototype.setType = function(type){
    if(type != "audio" && type != "recording"){
        throw new Error("Track should be either 'audio' or 'recording'");
    } else {
        this.type = type;
    }
};

Track.prototype.setAudioObj = function (path, format) {
    this.audioObj = new Howl({
        src: [path],
        ext: [format]
    });
};


Track.prototype.setAudio = function (category, trackName, path) {
    //this.audioObj.unload();
    this.audioObj = new Howl({
        src: [path],
        ext: ['ogg']
    });
    this.name = trackName;
    this.category = category;
    // the sound is not reloaded. This forces to reload it.
    //this.audioObj.stop();
};
/***
 * Set the balance and assigns it to the track
 * @param val
 */
Track.prototype.setBalance = function (val) {
    this.balance = parseFloat(val);
    var balance = this.balance;
    if (this.balance === 0) {
        // Since there seems to be a bug in Howler.js
        // then
        var ext = (this.type === "recording") ? 'wav' : 'ogg';
        this.setAudioObj(this.audioObj._src, ext);
    } else {
        this.audioObj.pos(balance, 0, 0);
    }
};


/** BORING GETTERS AND SETTERS **/

Track.prototype.setName = function (name) {
    this.name = name;
};

Track.prototype.getName = function () {
    return this.name;
};

Track.prototype.setPath = function (path) {
    this.path = path;
};

Track.prototype.getPath = function () {
    console.log(this.path);
    return this.path;
};

Track.prototype.getCategory = function () {
    return this.category;
};

Track.prototype.getAudioObj = function () {
    return this.audioObj;
};

Track.prototype.getType = function () {
    return this.type;
};

Track.prototype.getBalance = function () {
    return this.balance;
};

Track.prototype.getVolume = function () {
    return this.volume;
};

Track.prototype.setVolume = function (val) {
    this.audioObj.volume(val);
    this.volume = val;
};
