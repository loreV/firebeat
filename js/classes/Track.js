/**
 * Created by lore on 23.05.15.
 */
function Track(defaultAudio, name) {
    this.name = name;
    this.path = "";
    this.type = "audio"; // Should be either audio or recording
    this.balance = 0.5;
    this.volume = 0.5;
    this.audioObj = defaultAudio;
}

Track.prototype.setName = function(name){
    this.name = name;
};

Track.prototype.getName = function(){
    return this.name;
};

Track.prototype.setType = function(type){
    if(type != "audio" && type != "recording"){
        throw new Error("Track should be either 'audio' or 'recording'");
    } else {
        this.type = type;
    }
};

Track.prototype.getType = function(){
    return this.type;
};

Track.prototype.getAudioObj = function () {
    return this.audioObj;
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


/***
 * Set the balance and assigns it to the track
 * @param val
 */
Track.prototype.setBalance = function (val) {
    this.balance = val;
    this.audioObj.pos3d(this.balance, 0, 0);
};


