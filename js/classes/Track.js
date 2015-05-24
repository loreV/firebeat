/**
 * Created by lore on 23.05.15.
 */
function Track(defaultAudio){
    this.name = "";
    this.path = "";
    this.type = "audio"; // Should be either audio or recording
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


