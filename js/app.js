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
        prepareGrid: function(){


        },

        editor: {
            /**
             * Adds a new track
             * @param trackNr
             */
            addTrack: function(trackNr){
                $('#mu-list').append('<section class="mu-controller mu-controller-red" id="mu-'+trackNr+'"><span class="mu-title">Track '+trackNr+'</span><div class="option" id="mu-op-'+trackNr+'"><img src="css/player/icons/left_controls.png" class="mu-settings" /></div></section>');
                $('.mu-controller').css('height', F.editor.row_size);
                $('#mu-'+trackNr).click(function(e){F.ui.editor.showTrackSettingPanel(e);});


                // If the setting panel is already showing than focus on that.
                //if()
            },
            /**
             * Remove an existing track
             * @param trackNr
             */
            removeTrack: function(trackNr){

            },

            /**
             * Show the track panel and applies UI changes
             * TODO -> improve the DOM querying
             * @param event object sent by the press of the button
             */
            showTrackSettingPanel : function(event){

                $('.mu-controller').removeClass('blueBackground');
                $(event.currentTarget).addClass('blueBackground');
                event = event.currentTarget.id.split('-')[1];
                // move from the left the control panel
                // enough pixels to still have everything showing
                $('#mu-settings-panel').removeClass('hiddenElement');
                $('#mu-settings-panel').css('left', F.editor.col_size*2);
                // hide non usable controls (play and so)
                $('#right-side-controls').addClass('hiddenElement');
            },
            /**
             *
             */
            hideTrackSettingPanel : function(){
                $('.mu-controller').removeClass('mu-controller-red');
                $('#mu-settings-panel').removeClass('visibleElement');
                $('#right-side-controls').removeClass('hiddenElement');
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
            }


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

    editor: {

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
            $('#control-play').click(function(){ F.editor.controls.play(); });

            F.ui.refreshUI();
            this.controls.init();
            //this.addListener();
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
        // Creates a new beat
        newBeat:function(){

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

            if(this.controls.tracks.length > eY){
                var isToADD = (this.controls.grid[eX][eY]==undefined) ? true : false;
                F.ui.editor.addTile(eX,eY, isToADD);
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
                    )
                );
            }
        },
        removeTrack: function(index){

        },
        /**
         * Contains
         */
        controls : {
            stop : false,
            cursor : 0,
            grid: [],
            tracks : [],
            interval: 500,

            init: function(){
                for(var i = 0;  i < F.editor.col_number ; i++)
                {
                    this.grid[i] = new Array(F.editor.row_number);
                }
                console.log(this.grid);
            },

            play: function () {
                if (this.tracks.length == 0) {
                    alert('No tracks added');
                } else {
                    if(!this.stop){
                        this.load();
                    }
                }
            },
            load: function(){

                if(this.cursor < this.tracks.length){
                    // load next sound
                    //var obj = this.tracks[this.cursor].getAudioObj();
                    this.cursor++;
                    this.load();
                } else {
                    // play
                    this.cursor = 0;
                    this.playSound();
                }
            },
            playSound: function () {
                // Play right sound
                setTimeout(this.playSound, this.interval);
            }
        },
        /**
         * Settings
         */
        trackSettings : {


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
        init: function () {
            $('.new-btn').click(function () {
                F.ui.changeScreen("editor", "deeper");
                F.editor.init();
            });
            $('.exit-screen').click(function () {
                F.editor.exit();
            });
        }

    }
};


window.addEventListener('DOMContentLoaded', function () {

    // We'll ask the browser to use strict code to help us catch errors earlier.
    // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
    'use strict';

    F.menu.init();


    //alert("das");
    //F.ui.changeScreen("editor","left");


});
