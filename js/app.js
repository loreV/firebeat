/*!
 *  Firebeat v1.0
 *  www.themovingweb.com/firebeat/
 *
 *   2015, Lorenzo Verri
 *
 *  MIT License
 */
var F;

F = {
    utils:{
        io : null

    },
    // Everything concerning the ui
    ui: {

        pages: ['menu', 'editor'],
        currentScreen: "menu",
        /***
         * Changes the screen on the ui
         * @param the new page that should become visible
         * @param direction of the new animation in
         */
        changeScreen: function (page, direction) {
            var current = F.ui.currentScreen;
            if (F.ui.pages.indexOf(page) != -1) {

                if (direction === "deeper") {
                    $('#' + current).removeClass("visiblePage");
                    $('#' + current).addClass("to-left");
                    $('#' + current).removeClass("from-left");

                    $('#' + page).addClass("visiblePage");
                    $('#' + page).removeClass("to-right");
                    $('#' + page).addClass("from-right");
                    // at start all the pages that are on the side and do not
                    // get displyed.
                    $('#' + page).removeClass("right");
                } else {
                    //$('#' + current).removeClass("from-right");

                    $('#' + current).removeClass("visiblePage");
                    $('#' + current).removeClass("from-right")
                    $('#' + current).addClass("to-right");

                    $('#' + page).removeClass("to-left");
                    $('#' + page).addClass("visiblePage");
                    $('#' + page).addClass("from-left");

                }
                F.ui.currentScreen = page;
            } else {
                throw new Error("Screen does not exist");
            }
        },
        changeOrientation: function(){
            try{
                if (window.screen.mozLockOrientation('landscape')) {
                    // orientation was locked
                    screen.lockOrientation('portrait');
                } else {
                    screen.lockOrientation('landscape');
                }
            } catch (e){
                console.warn("No firefox OS")
            }
        },
        editor: {
            /***
             * Initialize the user interface
             */
            init: function () {

                var radios = document.forms["audioTrack"].elements["type"];
                for (var i = 0; i < radios.length; i++) {
                    radios[i].addEventListener('click', function (e) {
                        F.ui.editor.trackSettings.toggleSelector("type");
                        F.ui.editor.trackSettings.toggleAudioType(e.target.value);
                    })
                }
                $('form button').click(function (e) {
                    e.preventDefault();
                });

                $('form[name="audioTrack"] button[name=record-choice]').mousedown(function (e) {
                    F.ui.editor.trackSettings.recordAudio.start();
                    F.editor.trackSettings.recordAudio(F.editor.trackSettings.currentSettingsIndex);
                });
                var controlVolume = document.forms["audioTrack"].elements["vol"];
                controlVolume.addEventListener("change", function (e) {
                    F.ui.editor.trackSettings.toggleSelector('volume');
                });
                var balanceVolume = document.forms["audioTrack"].elements["bal"];
                balanceVolume.addEventListener("change", function () {
                    F.ui.editor.trackSettings.toggleSelector('balance');
                });

            },

            exit: function () {
                var radios = document.forms["audioTrack"].elements["type"];
                for (var i = 0; i < radios.length; i++) {
                    radios[i].removeEventListener('click', function (e) {
                        F.ui.editor.trackSettings.toggleAudioType(e.target.value);
                    })
                }
            },
            /**
             * Adds a new track
             * @param trackNr
             */
            addTrack: function(trackNr){
                $('#mu-list').append('<section class="mu-controller mu-controller-red" id="mu-'+trackNr+'"><span class="mu-title">Track '+trackNr+'</span><div class="option" id="mu-op-'+trackNr+'"><img src="css/player/icons/left_controls.png" class="mu-settings" /></div></section>');
                $('.mu-controller').css('height', F.editor.row_size);
                $('#mu-' + trackNr).click(function (e) {
                    if (F.editor.controls.tracks.length < 9) {
                        // Hide the track if the tab was already open
                        if (F.editor.trackSettings.currentSettingsIndex == trackNr) {
                            F.ui.editor.trackSettings.hide(trackNr);
                            F.editor.trackSettings.currentSettingsIndex = null;
                        } else {
                            F.editor.trackSettings.load(e);
                            F.ui.editor.trackSettings.show(e);
                            F.editor.trackSettings.currentSettingsIndex = trackNr;
                        }

                    } else {
                        alert("Too many tracks.");
                    }
                });
            },
            /**
             * Remove an existing track
             * @param trackNr
             */
            removeTrack: function(trackNr){
                //TODO
            },
            /**
             * Add a new tile only if the tile was not added yet. Else it removes it.
             * @param {Event} e
             * @param {boolean} isToAdd
             */
            addTile : function(eX, eY, isToAdd){
                if(isToAdd){
                    F.editor.co.fillStyle = '#FF3300';
                } else {
                    var color1 = "#fff3e0";
                    var color2= "#f9fbe7";
                    var colorToUse = "";
                    if((eY % 2) == 0){
                        if(eX % 2 == 0){
                            colorToUse = color2;
                        } else {
                            colorToUse = color1;
                        }
                    } else {
                        if(eX % 2 == 0){
                            colorToUse = color1;
                        } else {
                            colorToUse = color2;
                        }
                    }
                    F.editor.co.fillStyle = colorToUse;
                }
                F.editor.co.fillRect((eX * F.editor.col_size), (eY* F.editor.row_size) , F.editor.col_size , F.editor.row_size);
            },

            trackSettings: {
                load: function (volume, balance, name, type) {
                    $('form[name=audioTrack] input[name=vol]').val(volume);
                    $('form[name=audioTrack] input[name=bal]').val(balance);
                    $('form[name=audioTrack] select[name=track-selection]').val(name);
                    this.toggleAudioType(type);
                },
                /***
                 * Attempts to toggle a change in one of the following elements
                 * @param {string} type
                 */
                toggleSelector: function (type) {
                    var trackId = $('.blueBackground').attr('id').split('-')[1];
                    console.log(trackId);
                    switch (type) {
                        case 'volume':
                            var volume = document.forms["audioTrack"].elements["vol"].value;
                            F.editor.trackSettings.setVolume(trackId, volume);
                            break;
                        case 'balance':
                            var volume = document.forms["audioTrack"].elements["bal"].value;
                            F.editor.trackSettings.setBalance(trackId, volume);
                            break;
                        case 'type':
                            var type = document.forms["audioTrack"].elements["type"].value;
                            F.editor.trackSettings.selectAudioType(trackId, type);
                            break;
                    }

                },
                /***
                 *
                 * @param {string} Audio type should be "Audio" or "Recording"
                 */
                toggleAudioType: function (type) {
                    var el = "form[name=audioTrack] ";
                    if (type === "audio") {
                        $(el + 'input[value=audio]').prop("checked", true);
                        $(el + 'select[name=track-selection]').removeAttr('disabled', 'disabled');
                        $(el + 'button[name=record-choice]').attr('disabled', 'disabled');
                        $(el + 'button[name=play-choice]').attr('disabled', 'disabled');
                        return;
                    }

                    $(el + 'input[value=recording]').prop("checked", true);
                    $(el + 'select[name=track-selection]').attr('disabled', 'disabled');
                    $(el + 'button[name=record-choice]').removeAttr('disabled');
                    $(el + 'button[name=play-choice]').removeAttr('disabled');

                },
                /**
                 * Show the track panel and applies UI changes
                 * @param {event} object sent by the press of the button
                 */
                show: function (event) {
                    $('.mu-controller').removeClass('blueBackground');
                    $(event.currentTarget).addClass('blueBackground');
                    event = event.currentTarget.id.split('-')[1];
                    // move from the left the control panel
                    // enough pixels to still have everything showing
                    $('#mu-settings-panel').removeClass('hiddenElement');
                    $('#mu-settings-panel').css('left', $('#side-controls').css('width'));
                    // hide non usable controls (play and so)
                    $('#right-side-controls').addClass('hiddenElement');

                },
                hide: function (index) {
                    $('#mu-' + index).removeClass('blueBackground');
                    $('#mu-settings-panel').addClass('hiddenElement');
                    $('#right-side-controls').removeClass('hiddenElement');
                },

                recordAudio: {
                    start: function () {

                    },
                    end: function () {

                    }
                }
            },
            /**
             * Playback cursor
             */
            cursor: {
                drawNext : function(cursor, gridMatrix){
                    var columnIndexToRepaint = (cursor > 0) ? (cursor-1) : gridMatrix.length-1;
                    this.erase(columnIndexToRepaint, gridMatrix);
                    F.editor.co.globalAlpha = 0.2;
                    F.editor.co.fillStyle = "#12d0ff";
                    F.editor.co.fillRect((cursor * F.editor.col_size), 0 , F.editor.col_size , F.editor.c.height);
                    F.editor.co.globalAlpha = 1;
                },
                /***
                 * Should repaint only the last two rows
                 * @param {int} columnIndexToRepaint
                 * @param {Array} gridMatrix
                 */
                erase: function(columnIndexToRepaint, gridMatrix){
                    // the column to repaint is the previous one
                    var color1= "#f9fbe7";
                    var color2 = "#fff3e0";
                    var colorToFill = "";
                    for(var i = 0; i < gridMatrix[columnIndexToRepaint].length; i++)
                    {
                        if(gridMatrix[columnIndexToRepaint][i] != undefined){
                            colorToFill = "#FF0000";
                        } else {
                            if (columnIndexToRepaint % 2 === 0) {
                                if (i % 2 === 0) {
                                    colorToFill = color1;
                                } else {
                                    colorToFill = color2;
                                }
                            } else {
                                if (i % 2 === 0) {
                                    colorToFill = color2;
                                } else {
                                    colorToFill = color1;
                                }
                            }
                        }
                        F.editor.co.fillStyle = colorToFill;
                        F.editor.co.fillRect((columnIndexToRepaint * F.editor.col_size), (i* F.editor.row_size) , F.editor.col_size , F.editor.row_size);
                    }
                }
            },

            togglePlay : function(){
                var button = $('#control-play');
                var p = "url('css/player/icons/"; var pe = "')";
                button.css('background-image', (F.editor.controls.stop) ? p+"play_btn.png"+pe : p+"pause_btn.png"+pe );
            },
            refreshUI: function(){
                $('.mu-controller').css("height", F.editor.row_size);
                //todo way more should actually go in this method!
                var play_btn = document.getElementById("control-play");
                play_btn.style.width = F.editor.col_size/1.1 +"px";
                play_btn.style.height = F.editor.col_size/1.1 +"px";

                var menu_btn = document.getElementById('control-menu');
                menu_btn.style.width = F.editor.col_size/2 + "px";
                menu_btn.style.height = F.editor.col_size/2 + "px";

                var controllerBox = document.getElementById('right-side-controls');
                controllerBox.style.width = (play_btn.width*3) + " px";
                controllerBox.style.height = (controllerBox.style.width / 3);
            }
        },
        menu : {
            init: function(){
                $('#mainContainer').css('width', window.innerWidth);
                $('#mainContainer').css('height', window.innerHeight);
                $('.new-btn').click(function () {
                    F.ui.changeScreen("editor", "deeper");
                    F.editor.init();
                });
                $('.exit-screen').click(function () {
                    F.editor.exit();
                });
            }
        }
    },

    editor: {

        sdcard: null,

        look:{
            x : 0,
            y : 0
        },
        row_size:0,
        col_size:0,
        row_number: 0,
        col_number: 0,

        c: {},
        co: {},
        sideControls:{},





        init: function () {


            this.look.x = window.innerWidth;
            this.look.y = window.innerHeight;

            var container = document.getElementById("app-container");
            container.width= this.look.x;
            container.height = this.look.y;

            this.sideControls = document.getElementById('side-controls');

            this.c = document.getElementById("editor-main");
            this.c.width = window.innerWidth - parseInt($('#side-controls').css('width').split('px')[0]);
            this.c.height = window.innerHeight;
            this.co = F.editor.c.getContext("2d");
            this.newGrid();

            var muLast = document.getElementById('mu-last');
            muLast.addEventListener('click', function(){ F.editor.addTrack(); });
            this.c.addEventListener('click', function(e){F.editor.select(e); });
            //$('#editor-main').click(function(e){F.editor.select(e); });
            document.getElementById('control-play').addEventListener('click', function(){F.editor.controls.play();});

            F.ui.editor.refreshUI();
            F.ui.editor.init();
            this.controls.init();

            //TODO-> refactor this shit!
            //var script = document.createElement('script');
            //script.type = 'text/javascript';
            //script.src = 'js/libs/libmp3lame.min.js';
            //$('head').append(script);


            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'js/classes/Recorder.js';
            $('head').append(script);
            // -------------------------
        },

        /**
         * Creates a new grid. This method should be called only on creation.
         */
        newGrid: function () {
            this.grid = [];

            var x = this.c.width;
            var y = this.look.y;

            var row_min_height = 60;
            var min_row_number = 4;
            // assume the height is at least 320px;

            // first count how many rows can fit in the screen
            var sizeOfScreen = y - (row_min_height*min_row_number) ;
            var actualNrRows = min_row_number;
                while(sizeOfScreen >= row_min_height){
                sizeOfScreen -= row_min_height;
                actualNrRows ++;
            }


            this.row_size = parseInt(y /actualNrRows);

            // then count how many columns we are going to have;
            var min_num_columns = 10;
            console.log(x, min_num_columns);
            this.col_size = parseInt(x / min_num_columns);

            // rows should be high enough to fill up the space
            //if(window.innerHeight > 320) nrRows = window.innerHeight  ;

            this.row_number = actualNrRows;
            this.col_number = min_num_columns;

            var color1 = "#fff3e0";
            var color2= "#f9fbe7";

            var diffBackground = true;
            var diffBackground2 = true;
            for (var i = 0; i < actualNrRows; i++) {
                F.editor.co.fillStyle = diffBackground ? color1 : color2;
                F.editor.co.fillRect(0, (i * this.row_size), x , this.row_size);

                for(var z = 0 ; z < min_num_columns; z++){
                    this.co.fillStyle = diffBackground2 ? color2 : color1 ;
                    this.co.fillRect((z * this.col_size), (i*this.row_size) , this.col_size , this.row_size);
                    diffBackground2 = !diffBackground2;
                }
                // controls
                diffBackground = !diffBackground;
                diffBackground2 = !diffBackground2;
            }
        },
        /***
         *  Open an existing beat
         */
        openBeat:function(){

        },
        /**
         * Checks a position in the gri to add a tile to it.
         * @param {Event} e
         */
        select: function(e){
            // Verify whether grid already has assigned a tile
            // determine X and Y
            var offsetX = parseInt($('#side-controls').css('width').split('px')[0]);
            var x = e.clientX - offsetX;
            var y = e.clientY;
            //console.log(x, y);
            var eX = parseInt(x / F.editor.col_size);
            var eY = parseInt(y / F.editor.row_size);

            console.log(eX, eY);
            if(this.controls.tracks.length > eY){
                var isToADD = (this.controls.grid[eX][eY]==undefined) ? true : false;
                F.ui.editor.addTile(eX,eY, isToADD);
                // Add
                this.controls.grid[eX][eY] = (isToADD) ? 1 : undefined;
                console.log(this.controls.grid);
            }
        },
        addTrack: function(){
            // if tracks are less than 10 -- for memory reasons
            if(this.controls.tracks.length < 10){
                F.ui.editor.addTrack( this.controls.tracks.length );
                this.controls.tracks.push(
                    new Track(
                        new Howl({
                            urls: ['data/effects/bass.wav'],
                            buffer: true
                        })
                        , "Bass Hit")
                );
            }
        },
        removeTrack: function(index){

        },
        /**
         * Contains
         */
        controls : {
            stop : true,
            cursor : 0,
            grid: [],
            tracks : [],
            interval: 500,
            /**
             * Initiates
             */
            init: function(){
                for(var i = 0;  i < F.editor.col_number ; i++)
                {
                    this.grid[i] = new Array(F.editor.row_number);
                }
            },
            /**
             * Do a check before loading
             */
            play: function () {
                if (this.tracks.length == 0) {
                    alert('No tracks added');
                } else {
                    if(this.stop){
                        this.stop = false;
                        this.load();
                    } else {
                        this.stop = true;
                        // TODO -> stopsTheSound
                    }
                    F.ui.editor.togglePlay();
                }
            },
            /**
             * Loads all the remaining unbuffered songs.
             */
            load: function(){
                if(this.cursor < this.tracks.length){
                    // load next sound
                    //var obj = this.tracks[this.cursor].getAudioObj();
                    this.cursor++;
                    F.editor.controls.load();
                } else {
                    // play
                    this.cursor = 0;
                    F.editor.controls.playSound();
                }
            },
            /**
             * Get the audio object in the two dimensional matrix and
             * plays it. Recurse as long as the sound plays.
             */
            playSound: function () {
                if (F.editor.controls.stop === false) {

                    // Draw the cursor;
                    F.ui.editor.cursor.drawNext(F.editor.controls.cursor, F.editor.controls.grid);

                    // Selects the right column to play for
                    for (var i = 0; i < F.editor.controls.grid[F.editor.controls.cursor].length; i++) {
                        if (F.editor.controls.grid[F.editor.controls.cursor][i] != undefined) {
                            F.editor.controls.tracks[i].getAudioObj().play();
                        }
                    }

                    // Starts back if the end is reached
                    if (F.editor.controls.cursor + 1 < F.editor.controls.grid.length) {
                        F.editor.controls.cursor++;
                    } else {
                        F.editor.controls.cursor = 0;
                    }
                    // Recurse
                    setTimeout(F.editor.controls.playSound, F.editor.controls.interval);
                } else {
                    var columnIndexToRepaint = (F.editor.controls.cursor > 0) ? (F.editor.controls.cursor-1) : F.editor.controls.grid.length-1;
                    F.ui.editor.cursor.erase(columnIndexToRepaint, F.editor.controls.grid);
                    F.editor.controls.cursor = 0;
                }
            }
        },
        /**
         * Settings
         */
        trackSettings : {
            currentSettingsIndex: null,
            recorder: null,
            recording: null,
            /**
             * Change Volume
             */
            setVolume: function (trackId, volume) {
                F.editor.controls.tracks[trackId].setVolume(volume);
            },
            setBalance: function (trackId, balance) {
                F.editor.controls.tracks[trackId].setBalance(balance);
            },
            selectAudioType: function (trackId, type) {
                F.editor.controls.tracks[trackId].setType(type);
            },
            recordAudio: function(trackId){
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (navigator.getUserMedia) {
                    navigator.getUserMedia({audio: true},
                        // Success!

                        function (e) {


                            F.editor.trackSettings.recorder = new Recorder(new AudioContext().createMediaStreamSource(e), {
                                workerPath: "js/classes/workers/recorderWorker.js",
                                numChannels: 1
                            });
                            F.editor.trackSettings.recorder.record();

                            setTimeout(function () {
                                console.log("done - recording");
                                F.editor.trackSettings.recorder.stop();
                                F.editor.trackSettings.recorder.exportWAV(function (e) {
                                    //Recorder.forceDownload(e, "b.wav");
                                    console.log("saving...");
                                    F.utils.io.saveRecording(e, function(path){
                                        F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].setPath(path);
                                        console.log("worked..."+F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].getPath());
                                    } );

                                });

                            }, 2000);
                        },
                        function (err) {
                            alert("The following error occured: " + err.name);
                        }
                    );
                } else {
                    console.log("getUserMedia not supported");
                }
            },
            /***
             * Loads the track settings
             * @param event
             */
            load: function (event) {
                var id = event.currentTarget.id.split('-')[1];
                var track = F.editor.controls.tracks[parseInt(id)];
                var volume = (track.getVolume() );
                var balance = (track.getBalance() );
                var name = track.getName();
                var type = track.getType();
                F.ui.editor.trackSettings.load(volume, balance, name, type);
            }

        },
        /***
         * Clean objects around and quit the editor
         */
        exit : function(){
            // clean
            F.ui.changeScreen("menu", "back");
            F.ui.changeOrientation();
        }

    },

    menu: {
        init: function (IO) {
            F.utils.io = IO;
            F.ui.menu.init();
            F.utils.io.initDatabase();
        }

    }
};


window.addEventListener('DOMContentLoaded', function () {

    // We'll ask the browser to use strict code to help us catch errors earlier.
    // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
    'use strict';
    var IO = new FIO();
    F.menu.init(IO);



    //alert("das");
    //F.ui.changeScreen("editor","left");


});