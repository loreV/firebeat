/*!
 *  Firebeat v1.0
 *  www.themovingweb.com/firebeat/
 *
 *  2015, Lorenzo Verri
 *
 *  MIT License
 */
var F;

F = {
    utils:{
        version: "1.0.2",
        io: null,

        convertMstoBpm: function (ms) {
            var minute = 60000;
            var bpm = parseInt(minute / ms);
            return bpm;
        },

        notify: function (sMessage) {
            var notification;
            if ("Notification" in window) {
                notification = new Notification("Firebeat", {body: sMessage, icon: "img/icons/icon48x48.png"});
            } else {
                // Firefox OS 1.0
                notification = navigator.mozNotification.createNotification(
                    "Firebeat",
                    sMessage
                );
                notification.show();
            }
            setTimeout(notification.close.bind(notification), 4000);
        },
        conf: {
            /** system language **/
            lang: "",
            /** is it First use **/
            useF: true,
            loadConf: function () {
                var lang = F.utils.io.simpleLoad("conf/lang");
                var useF = F.utils.io.simpleLoad("conf/useF");
                this.lang = lang ? lang : "en";
                this.useF = useF ? true : false;
            },
            /**
             *
             * @param lang
             * @type string
             * @param useF
             * @type bool
             */
            saveConf: function (lang, useF) {
                F.utils.io.simpleSave("conf/lang", lang);
                F.utils.io.simpleSave("conf/useF", useF);
            }
        },

        screen: {

            isScreenExtended: function () {
                var height;
                var screenH;

                var editor = F.ui.editor.editorElem;
                var height = editor.attr('height');
                var screenH = F.editor.look.y;


                if (height > screenH) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        cleaner: {
            /**
             * The method removes all the unused recording files recorded during
             * the application use.
             * @param listFiles
             */
            cleanUpFiles: function (listFiles) {

                var toMaintain = [];
                for (var z = 0; z < F.editor.controls.tracks.length; z++) {
                    if (F.editor.controls.tracks[z].getType() === "recording") {
                        toMaintain.push(F.editor.controls.tracks[z].getName());
                    }
                }

                for (var i = 0; i < listFiles.length; i++) {
                    if (toMaintain.indexOf(listFiles[i]) === -1) {
                        F.utils.io.deleteFromDb(listFiles[i], function (e) {
                            console.log("deleted " + listFiles[i]);
                        });
                    }
                }

            }
        }
    },
    // Everything concerning the ui
    ui: {
        pages: ['menu', 'editor', 'saves'],
        currentScreen: "menu",
        /**
         * Show or hide a page depending on whether it is showing
         * @param page the page to be toggled
         * @return true if the page is newly opened
         * @return false if the page is now closed
         */
        toggleDisplay: function (page, callbackOpen, callbackClose) {
            var elem = $('#' + page);
            if (elem.hasClass("hiddenElement")) {
                //show
                elem.removeClass("hiddenElement");
                return true;
            }
            //hide
            elem.addClass("hiddenElement");
            return false;
        },
        /***
         * Changes the screen on the ui by making it slide in
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



        editor: {

            editorElem: {},
            lineColor: "#e9fae6",
            /***
             * Initialize the user interface
             */
            init: function () {

                $('#control-menu').click(F.ui.editor.beatSettings.toggleShow);

                this.editorElem = $('#editor-main');

                var radios = document.forms["audioTrack"].elements["type"];
                for (var i = 0; i < radios.length; i++) {
                    radios[i].addEventListener('click', F.ui.editor.trackSettings.toggleSelector)
                }
                $('form button').click(function (e) {
                    e.preventDefault();
                });

                document.addEventListener("visibilitychange", F.editor.suspend);

                $('form[name="audioTrack"] button[name=record-choice]').click(function (e) {

                    F.ui.editor.trackSettings.recordAudio.start();
                    setTimeout(
                        function () {
                            F.editor.trackSettings.recordAudio(F.editor.trackSettings.currentSettingsIndex);
                        }
                        , 3000
                    );

                });

                $('#control-hide').on("click", F.ui.editor.toggleControls);
                var deleteTrack = $('#delete_track_btn');
                deleteTrack.on("click", F.ui.editor.removeTrack);
                var controlVolume = $('input[name=vol]');
                controlVolume.on("change", F.ui.editor.trackSettings.toggleSelector);
                var balanceVolume = $('input[name=bal]');
                balanceVolume.on("change", F.ui.editor.trackSettings.toggleSelector);
                var playSoundBtn = $("button[name=play-choice]");
                playSoundBtn.on("click", F.editor.trackSettings.playRecordedAudio);
                var soundSelector = $('select[name=track-selection]');
                console.log(soundSelector);
                soundSelector.on("change", F.editor.trackSettings.setupAudio);
            },

            /**
             * Return true if it will be showing after call this method.
             */
            toggleControls: function (e) {
                var buttonPressed = new Object();
                if (e == undefined) {
                    buttonPressed = $('#control-hide');
                } else {
                    buttonPressed = $(e.currentTarget);
                }
                var controls = $('.hiddable');
                var className = 'hiddenElement';
                var isHidden = controls.hasClass(className);
                if (isHidden) {
                    controls.removeClass(className);
                    buttonPressed.css('left', '10px');
                    buttonPressed.css('background-image', 'url("icons/controls/arrow_down.png")')
                    return true;
                } else {
                    controls.addClass(className);
                    buttonPressed.css('left', '-138px');
                    buttonPressed.css('background-image', 'url("icons/controls/arrow_up.png")')
                    return false;
                }
            },

            /***
             * Returns true if the condition is positive for the editor to get extended
             * @return bool
             */
            verifyIncreaseStep: function () {
                if (F.editor.controls.tracks.length >= F.editor.row_number) {
                    return true;
                }
                return false;
            },
            /**
             * Returns true if the condition is positive for the editor to get reduced
             * @return bool
             */
            verifyDecreaseStep: function () {
                if (F.editor.controls.tracks.length < F.editor.row_number) {
                    return true;
                }
                return false;
            },
            /**
             * Increse/Decrease the size of the screen of the given pixel step
             * @param step
             * @type number
             * @param increase
             * @type bool
             */
            toggleIncreaseStepSize: function (step, increase) {
                var editor = "editor-main";
                var elements = ["side-controls"];

                var editor = $('#' + editor);
                var height = editor.attr('height');
                var screenH = F.editor.look.y;

                height = parseInt(height);
                // decide how bigger
                if (increase) {
                    height += step;
                } else {
                    height -= step;
                }
                // check not to decrease less than the screen
                if ((height < screenH) && !increase) {
                    console.warn("Cannot reduce screen height");
                    return false;
                }

                editor.attr("height", height);

                for (var z = 0; z < elements.length; z++) {
                    var element = $('#' + elements[z]);
                    element.css("height", height + "px");
                }
                var container = $('#app-container');
                if (height > screenH) {
                    F.ui.editor.refresh();
                    container.css("overflow-y", "scroll");
                } else {
                    container.css("overflow-y", "hidden");
                }
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
             * It names a track in the editor
             * @param index
             * @param name
             */
            nameTrack: function (index, name) {
                $('#mu-' + index + ' .mu-title').html(name);
            },
            /**
             * Adds a new track
             * @param trackNr
             */
            addTrack: function(trackNr){
                $('#mu-list').append('<section class="mu-controller mu-controller-red" id="mu-' + trackNr + '"><span class="mu-title">' + F.editor.trackSettings.songsListObject.categories[0].tracks[0].name + '</span><div class="option" id="mu-op-' + trackNr + '"><img src="css/player/icons/left_controls.png" class="mu-settings" /></div></section>');
                $('.mu-controller').css('height', F.editor.row_size);
                $('#mu-' + trackNr).click(F.editor.trackSettings.toggleSettings);
                return true;
            },
            /**
             * Remove an existing track
             * @param trackNr
             */
            removeTrack: function () {
                var trackNr = F.editor.trackSettings.currentSettingsIndex;
                F.editor.removeTrack(trackNr, F.editor.controls.grid);
                F.ui.editor.trackSettings.hide(trackNr);
                F.editor.trackSettings.currentSettingsIndex = null;

                var increaseSizeScreen = F.ui.editor.verifyDecreaseStep();
                if (increaseSizeScreen) F.ui.editor.toggleIncreaseStepSize(F.editor.row_size, false);
                F.ui.editor.refresh();
                F.ui.editor.cursor.drawLines();
                var mubuttons = $('.mu-controller');
                for (var i = 0; i < mubuttons.length - 1; i++) {
                    if (i != trackNr) {
                        var elem = $('#mu-' + i);
                        if (i > trackNr) {
                            elem.attr('id', 'mu-' + (i - 1).toString());
                        }
                    } else {
                        $('#mu-' + i).off("click");
                    }
                }
                $('#mu-' + trackNr).remove();


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
                    var color1 = "#e9fae6";
                    var color2 = "#dbf5da";
                    var colorToUse = "";
                    if ((eX % 4) == 0) {
                        //colorToUse = color1;
                            colorToUse = color2;
                    } else {
                            colorToUse = color1;

                    }
                    F.editor.co.fillStyle = colorToUse;
                }

                var elX = (eX * F.editor.col_size);
                var elY = (eY * F.editor.row_size)
                F.editor.co.fillRect(elX, elY, F.editor.col_size, F.editor.row_size);
                F.editor.co.strokeRect(elX, elY, F.editor.col_size, F.editor.row_size);
            },
            refresh: function () {
                var grid = F.editor.controls.grid;
                for (var x = 0; x < grid.length; x++) {
                    for (var y = 0; y < grid[x].length; y++) {
                        var isToAdd = false;
                        if (grid[x][y] === 1) {
                            isToAdd = true;
                        }
                        this.addTile(x, y, isToAdd);
                    }
                }
            },
            /**
             * The panel settings
             */
            beatSettings: {
                toggleShow: function(){
                    //Offset adjustments
                    var editor = document.getElementById('app-container');
                    var offsetY = editor.pageYOffset || editor.scrollTop;
                    var container = $('#app-container');

                    var panel = $('#menu-panel');
                    var wpanel= $('#waiting-panel');
                    if (panel.hasClass("visibleElement")){
                        // hides it

                        if (F.utils.screen.isScreenExtended()) {
                            container.css("overflow-y", "scroll");
                        }
                        F.ui.editor.beatSettings.removeListeners();
                        wpanel.removeClass('visibleElement');
                        panel.removeClass('visibleElement');
                    } else {
                        container.css("overflow-y", "hidden");
                        panel.css('top', (offsetY + 15) + 'px');
                        wpanel.css('top', offsetY + 'px');
                        F.ui.editor.beatSettings.addListeners();
                        wpanel.addClass('visibleElement');
                        panel.addClass('visibleElement');
                    }
                },

                toggleNumberColumns: function (hideMenu) {
                    console.log("Toggle Columns" + F.editor.col_number);
                    if (F.editor.col_number === 16) {
                        // TODO display the number of columns
                        F.editor.col_number = 8;
                        F.editor.controls.columns = 8;
                        // TODO refresh the grid
                    } else {
                        F.editor.col_number = 16;
                        F.editor.controls.columns = 16;
                    }

                    if (hideMenu) {
                        F.ui.editor.beatSettings.toggleShow();
                    }
                    // redraws the grid but without drawing the occupied
                    F.editor.newGrid();
                    // draws the tiles.
                    F.ui.editor.refresh();
                    F.ui.editor.cursor.drawLines();

                    //TODO-> goes to ui
                    $('#number-columns-label').html(F.editor.col_number.toString());
                },
                /**
                 *
                 */
                toggleInterval: function(){
                    var panel = $('#selector-panel');
                    var editor = F.ui.editor.editorElem;
                    var appContainer = $('#app-container');
                    var offsetY = appContainer[0].pageYOffset || appContainer[0].scrollTop;
                    if (panel.hasClass('visibleElement')) {
                        // TODO disable scrolling
                        if (F.utils.screen.isScreenExtended()) {
                            editor.css("overflow-y", "scroll");
                        } else {
                            editor.css("overflow-y", "hidden");
                        }
                        panel.removeClass('visibleElement');
                    } else {
                        panel.css('top', offsetY + 'px');
                        editor.css("overflow-y", "hidden");
                        panel.addClass('visibleElement');
                    }
                },

                /**
                 * It consumes an event type.
                 * It sets speed and value to the assigned value.
                 * @param e
                 */
                changePlaySpeed: function (e) {
                    var value = (typeof(e) != "number") ? e.currentTarget.value : e;
                    var bpm = F.utils.convertMstoBpm(value) + " bpm";
                    $('#selector-panel #value-bpm').html(bpm);
                    $('#selector-panel #value-delay').html(value.toString());
                    $('#velocity-label').html(bpm);
                    F.editor.controls.interval = parseInt(value);
                },
                /**
                 * Attempts to save the beat
                 */
                saveBeat: function () {
                    var fileName = $('input[name=file-name]').val();
                    if (fileName == "") alert("File name should be not empty");
                    F.settings.beat.save(fileName, true);
                },

                /**
                 * TODO -> next version should have an export function
                 */
                exportFile: function () {

                },

                exitBeat: function () {
                    F.editor.exit();
                },

                addListeners : function(){
                    $('#selector-panel #range-step').change(F.ui.editor.beatSettings.changePlaySpeed);

                    $('#selector-panel button').click(function (e) {
                        F.ui.editor.beatSettings.toggleInterval();
                    })
                    $('#menu-panel button').click(function(e){
                        //console.log(e.currentTarget.id);
                        switch(e.currentTarget.id)
                        {
                            // TODO - make interface work
                            case "number-spaces":
                                F.ui.editor.beatSettings.toggleNumberColumns(true);
                            break;
                            case "interval-toggle":
                                F.ui.editor.beatSettings.toggleInterval();
                            break;
                            case "save-button":
                                F.ui.editor.beatSettings.saveBeat();
                            break;
                            case "export-button":
                                F.ui.editor.beatSettings.exportFile();
                                break;
                            case "exit-button":
                                F.ui.editor.beatSettings.exitBeat();
                                break;
                        }
                    });
                },
                removeListeners : function(){
                    console.log("removing the listener");
                    $('#menu-panel button').off("click");
                    $('#selector-panel #range-step').off();
                    $('#selector-panel button').off("click");
                }
            },
            trackSettings: {
                /***
                 * Populates the list elements for track categories
                 * @param {object} object containing an array of categories
                 */
                init: function (data) {
                    var catSelect = $('select[name=track-category-selection]');
                    for (var i = 0; i < data.categories.length; i++) {
                        catSelect.append("<option value='" + data.categories[i].name + "'>" + data.categories[i].name + "</option>");
                    }
                    F.ui.editor.trackSettings.loadTracks(data.categories[0].name);
                    catSelect.on("change", F.ui.editor.trackSettings.loadTracks);
                },
                /***
                 * Populates the list elements for track selection
                 * @param {string} name of the category to load the tracks
                 */
                loadTracks: function (e) {
                    var category = "";
                    if (e.target === undefined) {
                        category = e;
                    } else {
                        category = e.target.value;
                    }
                    // clear the select list
                    var tracksSelect = $('select[name=track-selection]');
                    tracksSelect.html("");
                    //var list = F.editor.trackSettings.songsListObject.categories.indexOf(category);
                    var categories = F.editor.trackSettings.songsListObject.categories;
                    for (var i = 0; i < categories.length; i++) {
                        if (categories[i].name === category) {
                            for (var z = 0; z < categories[i].tracks.length; z++) {
                                tracksSelect.append("<option value='" + categories[i].tracks[z].name + "'>" + categories[i].tracks[z].name + "</option>")
                            }
                        }
                    }
                },
                /**
                 *
                 * @param volume
                 * @param balance
                 * @param name
                 * @param type
                 * @param category
                 */
                load: function (volume, balance, name, type, category) {
                    $('form[name=audioTrack] input[name=vol]').val(volume);
                    $('form[name=audioTrack] input[name=bal]').val(balance);
                    $('form[name=audioTrack] select[name=track-category-selection]').val(category);
                    this.loadTracks(category);
                    $('form[name=audioTrack] select[name=track-selection]').val(name);
                    this.toggleAudioType(type);
                },
                /***
                 * Attempts to toggle a change in one of the following elements
                 * @param {string} type
                 */
                toggleSelector: function (e) {
                    var type = e.currentTarget.name;
                    var trackId = $('.blueBackground').attr('id').split('-')[1];
                    console.log(trackId);
                    if (type == 'vol') {
                        var volume = document.forms["audioTrack"].elements["vol"].value;
                        F.editor.trackSettings.setVolume(trackId, volume);
                    } else if (type == 'bal') {
                        var balance = document.forms["audioTrack"].elements["bal"].value;
                        F.editor.trackSettings.setBalance(trackId, balance);
                    } else {
                        var type = document.forms["audioTrack"].elements["type"].value;

                        F.editor.trackSettings.selectAudioType(trackId, type);


                        F.ui.editor.trackSettings.toggleAudioType(type);
                    }
                },
                /***
                 *
                 * @param {string} Audio type should be "audio" or "recording"
                 */
                toggleAudioType: function (type) {
                    //var type= type.target.value;
                    var el = "form[name=audioTrack] ";
                    if (type === "audio") {
                        $(el + '#audio-sec').removeClass('hiddenElement');
                        $(el + '#record-sec').addClass('hiddenElement');
                        $(el + 'input[value=audio]').prop("checked", true);
                        $(el + 'select[name=track-selection]').removeAttr('disabled', 'disabled');
                        $(el + 'button[name=record-choice]').attr('disabled', 'disabled');
                        $(el + 'button[name=play-choice]').attr('disabled', 'disabled');
                        return;
                    }
                    $(el + '#record-sec').removeClass('hiddenElement');
                    $(el + '#audio-sec').addClass('hiddenElement');
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
                    var settingPanel = $('#mu-settings-panel');
                    var editor = document.getElementById('app-container');
                    var offsetY = editor.pageYOffset || editor.scrollTop;
                    var sideControl = $('#side-controls');
                    $(event.currentTarget).addClass('blueBackground');
                    event = event.currentTarget.id.split('-')[1];


                    var container = $('#app-container');
                    container.css("overflow-y", "hidden");
                    // move from the left the control panel
                    // enough pixels to still have everything showing
                    settingPanel.removeClass('hiddenElement');
                    settingPanel.css('left', sideControl.css('width'));
                    settingPanel.css('top', (offsetY + "px"));
                    // hide non usable controls (play and so)
                    $('#right-side-controls').addClass('hiddenElement');
                },
                /***
                 * Hide the track settings
                 * @param index
                 */
                hide: function (index) {
                    var container = $('#app-container');
                    container.css("overflow-y", "scroll");
                    $('#mu-' + index).removeClass('blueBackground');
                    $('#mu-settings-panel').addClass('hiddenElement');
                    $('#right-side-controls').removeClass('hiddenElement');
                },
                /***
                 * Records the audio and shows screens
                 */
                recordAudio: {
                    start: function () {
                        var mic = $('#mic-title');
                        $('#recording-panel').addClass('visibleElement');
                        $('#mic-loader').addClass('animationPopUp');
                        $('#waiting-panel').addClass('visibleElement');
                        mic.html("About to record...");
                        setTimeout(function () {
                            $('#mic-loader').addClass('animationBG');
                            setTimeout(function () {
                                mic.html("Recording in 2...");
                                setTimeout(function () {
                                    mic.html("Recording in 1...");
                                }, 1000)
                            }, 1000)
                        }, 1000);
                        $('button[name="record-choice"]').attr("disabled", "disabled");
                    },
                    end: function () {
                        //TODO->hide the panel
                        setTimeout(function () {
                            $('#mic-title').html("Done. Saving...");

                        }, 500);
                        setTimeout(function () {
                            $('#waiting-panel').removeClass('visibleElement');
                            $('#recording-panel').removeClass('visibleElement');
                            $('#mic-loader').removeClass('animationBG');
                        }, 1500);
                        $('button[name="record-choice"]').removeAttr("disabled");
                    },
                    during: function () {
                        $('#mic-title').html("Recording...");
                    }
                }
            },
            /**
             * Playback cursor
             */
            cursor: {
                drawNext : function(cursor, gridMatrix){
                    var columnIndexToRepaint = (cursor > 0) ? (cursor - 1) : F.editor.controls.columns - 1;
                    this.erase(columnIndexToRepaint, gridMatrix);
                    F.ui.editor.cursor.drawLines(undefined, columnIndexToRepaint);

                    F.editor.co.globalAlpha = 0.2;
                    F.editor.co.fillStyle = "#12d0ff";
                    F.editor.co.fillRect((cursor * F.editor.col_size), 0 , F.editor.col_size , F.editor.c.height);
                    F.editor.co.globalAlpha = 1;
                },
                /**
                 *
                 * @param x {int}
                 * @param y
                 */
                drawLines: function (x, y) {
                    var widthEditor = F.ui.editor.editorElem.attr("width");
                    var heightEditor = F.ui.editor.editorElem.attr("height");
                    var lineSize = 2;
                    F.editor.co.strokeStyle = 'white';

                    F.editor.co.beginPath();

                    var z = 0;
                    var limit = F.editor.controls.tracks.length + 1;
                    // If parameters are passed then draw only the given lines


                    if (x != null) {
                        z = x;
                        limit = x;
                    }


                    // Draws the horizontal lines
                    // Refresh the whole screen
                    for (z; z < limit; z++) {
                        F.editor.co.moveTo(0, z * F.editor.row_size);
                        F.editor.co.lineTo(widthEditor, z * F.editor.row_size);
                        F.editor.co.lineWidth = lineSize;
                        F.editor.co.stroke();
                    }


                    z = (y != null) ? y - 2 : 0;

                    // Draws the columns
                    limit = (y) ? y + 2 : F.editor.controls.columns;

                    for (z; z < limit; z++) {
                        F.editor.co.moveTo(z * F.editor.col_size, 0);
                        F.editor.co.lineTo(z * F.editor.col_size, heightEditor);
                        F.editor.co.lineWidth = lineSize;
                        F.editor.co.stroke();
                    }

                },


                /***
                 * Should repaint only the last two rows
                 * @param {int} columnIndexToRepaint
                 * @param {Array} gridMatrix
                 * @param {bool} isInitialPainting
                 */
                erase: function (columnIndexToRepaint, gridMatrix, initial) {
                    var color1 = "#e9fae6";
                    // the column to repaint is the previous one
                    var color2 = "#dbf5da";
                    var colorToFill = "";

                    for(var i = 0; i < gridMatrix[columnIndexToRepaint].length; i++)
                    {
                        if (gridMatrix[columnIndexToRepaint][i] != 0) {
                            colorToFill = "#FF0000";
                        } else {
                            if (columnIndexToRepaint % 4 == 0) {
                                colorToFill = color2;
                            } else {
                                colorToFill = color1;
                            }
                        }

                        if (initial) {


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
            /**
             * Initialize the user interface for the menu
             */
            init: function(){
                // Loads in the beats saved so far
                this.displaySaves(false, false, 'recent-files-menu', 5);

                document.addEventListener("visibilitychange", F.ui.menu.displayMainMenuSaves);

                var s = setTimeout(function () {

                    if (F.settings.general.detectScreenSizeType() === "portrait") {
                        screen.addEventListener("orientationchange", F.settings.general.screenChange);
                    } else {
                        $('#mainContainer').css('width', window.innerWidth);
                        $('#mainContainer').css('height', window.innerHeight);
                    }
                }, 500)
                $('.new-btn').click(function () {
                    F.ui.changeScreen("editor", "deeper");
                    F.editor.init(true);
                });
                $('.exit-screen').click(F.editor.exit);
                $('#show-saved-list').click(F.menu.saves.toggle);
                $('#about-btn').click(F.menu.about.toggle);

            },
            /***
             *
             */
            displayMainMenuSaves: function (e) {
                F.ui.menu.displaySaves(false, false, 'recent-files-menu', 5);
            },
            /***
             * Populates the menu with the last saves
             * @param arrayFiles
             * @type String[]
             * @param listToAppend
             * @type String
             * @param number of elements to show
             */
            displaySaves: function (showDeleteBtn, showTime, listToAppend, limit) {
                // last should go first in time
                var arrayFiles = (F.utils.io.simpleLoad("beats")) ? F.utils.io.simpleLoad("beats") : '';
                if (arrayFiles === '') return false;
                var arrayOfTime = (F.utils.io.simpleLoad("beats_time")) ? F.utils.io.simpleLoad("beats_time") : '';
                if (arrayFiles != "") arrayFiles = arrayFiles.split(";");
                if (arrayOfTime != "") arrayOfTime = arrayOfTime.split(";");
                // best would be to simply iterate through this without saving a copy of it
                arrayFiles = arrayFiles.reverse();
                arrayOfTime = arrayOfTime.reverse();
                var elem = "";
                var limit = (arrayFiles.length < limit) ? arrayFiles.length : limit;
                showDeleteBtn = showDeleteBtn ? "<aside class='pack-end'><button class='danger deleteThisSave'>Delete</button></aside>" : "";
                var time = "";


                for (var z = 0; z < limit; z++) {
                    var timeFormat = new Date(parseInt(arrayOfTime[z]) * 1000);
                    var day = timeFormat.getDate();
                    var month = timeFormat.getMonth() + 1;
                    var years = timeFormat.getFullYear();
                    (showTime) ? time = ("<span class='timeModified' id='time-" + arrayFiles[z] + "'>Last time modified:   " + day + "/" + month + "/" + years + "</span>") : "";
                    if (arrayFiles[z] != "") {
                        elem += time + "<div class='clear'></div><li class='saved-element' id='" + arrayFiles[z] + "'>" + showDeleteBtn + "<p>" + arrayFiles[z] + "</p></li>";
                    }

                }
                var savesLists = ['saves-list', 'recent-files-menu'];
                /**
                 * Since no more than two ids can exists at the same time,
                 * the ones of the not showing list should be erased.
                 * If more lists are going to be present in the application,
                 * add a string to the array above
                 */
                for (var z = 0; z < savesLists.length; z++) {
                    if (savesLists[z] != listToAppend) {
                        $('#' + savesLists[z]).html("");
                    }
                    $('.saved-element').off("click");
                }

                if (elem == "") {
                    elem = '<li><a href="#"><p>No recent beats</p></a></li>';
                }

                if (elem != "") {
                    $('#' + listToAppend).html(elem);

                    var btnToDelete = $('.saved-element');
                    btnToDelete.on("click", F.settings.beat.load);

                    btnToDelete = $('.deleteThisSave')
                    if (showDeleteBtn != false) {
                        btnToDelete.on("click", F.menu.saves.delete);
                    } else {
                        btnToDelete.off("click");
                    }
                }


            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        sideControls: {},

        PATHTOTRACKS: 'data/effects/',


        init: function (isNew) {

            var date = new Date();
            document.getElementById("file-name").value = "fb_" + date.getDate()+ date.getMonth() + date.getYear() + date.getMinutes();

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

            this.c = $('#editor-main');
            var muLast = $('#mu-last');
            muLast.on("click", F.editor.addTrack);
            this.c.on('click', F.editor.select);
            //$('#editor-main').click(function(e){F.editor.select(e); });
            $('#control-play').on('click', F.editor.controls.play);
            this.c = document.getElementById("editor-main");

            F.editor.controls.recordings = [];


            if (isNew) {
                F.editor.controls.init();
            }
            F.ui.editor.init();
            this.newGrid();

            $('#control-hide').css('width', this.col_size + 'px');

            F.ui.editor.refreshUI();

            //TODO-> refactor this shit!
            //var script = document.createElement('script');
            //script.type = 'text/javascript';
            //script.src = 'js/libs/libmp3lame.min.js';
            //$('head').append(script);

            // TODO LOAD only once
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'js/classes/Recorder.js';
            $('head').append(script);
            // -------------------------
        },

        /**
         * Creates a new grid. This method should be called only on creation.
         * If no parameters are passed, then the size of those will be decided within the
         * method.
         * @param minimum number of rows to be displayed
         * @param minimum number of columns
         *
         */
        newGrid: function (minRows, minColumns) {
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
            var min_num_columns = (this.col_number) ? this.col_number : 8;
            console.log(x, min_num_columns);
            this.col_size = parseInt(x / min_num_columns);
            // rows should be high enough to fill up the space
            //if(window.innerHeight > 320) nrRows = window.innerHeight  ;

            this.row_number = actualNrRows;
            this.col_number = min_num_columns;

            for (var i = 0; i < min_num_columns; i++) {
                F.ui.editor.cursor.erase(i, F.editor.controls.grid);
            }

            F.ui.editor.cursor.drawLines();
        },


        suspend: function () {
            if (document.hidden) {
                var date = new Date();
                if (F.editor.controls.tracks.length > 0) {
                    F.settings.beat.save("AutoSave", false, true);
                }
                F.utils.cleaner.cleanUpFiles(F.editor.controls.recordings);
                F.utils.notify("Your Firebeat was automatically saved.");
                F.editor.exit(true);
            } else {
                F.ui.menu.displaySaves(false, false, 'recent-files-menu', 5);
            }
        },
        /***
         *  Open an existing beat
         */
        openBeat: function (grid, columns, interval) {
            this.init(false);
            F.editor.controls.grid = grid;
            //F.editor.controls.interval = interval;
            F.ui.editor.beatSettings.changePlaySpeed(interval);
            if (columns === 16) {
                F.ui.editor.beatSettings.toggleNumberColumns(false);
            }

            // nr of rows - rows to display - 1 for the extra one
            var nrSteps = (F.editor.controls.tracks.length) - (F.editor.row_number - 1);


            //var nrTracks = F.editor.controls.tracks.length;
            //var increaseSizeScreen = F.ui.editor.verifyIncreaseStep();
            while (nrSteps > 0) {
                F.ui.editor.toggleIncreaseStepSize(F.editor.row_size, true);
                nrSteps--;
            }
            F.ui.editor.refresh()
            F.ui.editor.cursor.drawLines();
        },
        /**
         * Checks a position in the grid to add a tile to it.
         * @param {Event} e
         */
        select: function(e){
            // Verify whether grid already has assigned a tile
            // determine X and Y
            var editor = document.getElementById('app-container');

            var offsetX = parseInt($('#side-controls').css('width').split('px')[0]);
            var offsetY = editor.pageYOffset || editor.scrollTop;


            var x = e.clientX - offsetX;
            var y = e.clientY + offsetY;
            var eX = parseInt(x / F.editor.col_size);
            var eY = parseInt(y / F.editor.row_size);
            if (F.editor.controls.tracks.length > eY) {
                var isToADD = (F.editor.controls.grid[eX][eY] === 0) ? true : false;
                F.ui.editor.addTile(eX,eY, isToADD);
                // Add
                F.editor.controls.grid[eX][eY] = (isToADD) ? 1 : 0;
            }
        },
        /**
         * String, String, String -> Track
         * Add a track to the list. If the parameters are not passed then the last
         * @param category
         * @type string
         * @param filename
         * @type string
         * @param trackName
         * @type string
         * @param balance
         * @type number
         * @param volume
         * @type number
         * @param path
         * @type string
         * @param type
         * @type string ("audio" or "recording")
         */
        addTrack: function (category, filename, trackName, balance, volume, path, type) {
            // if tracks are less than 10 -- for memory reasons

            if (F.editor.controls.tracks.length < F.editor.controls.MAX_ROWS) {
                F.ui.editor.addTrack(F.editor.controls.tracks.length);


                var categoryName = F.editor.trackSettings.songsListObject.categories[0].name;
                var fileName = F.editor.trackSettings.songsListObject.categories[0].tracks[0].file;
                var trackName = F.editor.trackSettings.songsListObject.categories[0].tracks[0].name;
                var type = "audio";


                if (type === "audio") {

                    var lastIndex = F.editor.controls.tracks.push(
                        new Track(
                            new Howl({
                                src: [F.editor.PATHTOTRACKS + categoryName + "/" + fileName],
                                preload: true
                            })
                            , trackName, categoryName) // < --- Modify here
                    );

                }

                var increaseSizeScreen = F.ui.editor.verifyIncreaseStep();
                if (increaseSizeScreen) F.ui.editor.toggleIncreaseStepSize(F.editor.row_size, true);
                F.ui.editor.cursor.drawLines();

            } else {
                alert("Maximum 10 tracks are allowed");
            }
        },
        /***
         * Remove
         * @param index
         * @type number
         * @param array
         * @type the grid array
         */
        removeTrack: function (index, array) {
            // move all the elements after the index up
            F.editor.trackSettings.unsetAudio(F.editor.controls.tracks[index]);
            F.editor.controls.tracks.splice(index, 1);

            var array = array;
            // array = F.editor.controls.grid;

            if (index > array.length) console.alert("Index is greater than tracks number");
            var isFound = false
            for (var i = 0; i < array.length; i++) {

                array[i].splice(index, 1);
                //Destroy the sound object
            }
            // Refactor this!
            var max_number_track = F.editor.controls.MAX_ROWS;
            var last_pos_array = [];
            for (var z = 0; z < array.length; z++) {
                array[z][max_number_track - 1] = 0;
            }
            //newArray[array.length - 1] = last_pos_array;

            return array;
        },
        /**
         * Contains
         */
        controls : {

            MAX_COLUMNS: 16,
            MAX_ROWS: 10,


            recordings: [],

            columns: 8,
            stop : true,
            cursor : 0,
            grid: [],
            tracks : [],
            interval: 500,


            loop: {},
            /**
             * Initiates
             */
            init: function(){
                this.loop = null;
                this.columns = 8;
                this.grid = [];
                this.tracks = [];
                for (var i = 0; i < this.MAX_COLUMNS; i++)
                {
                    this.grid[i] = new Array(this.MAX_ROWS);

                    for (var x = 0; x < this.MAX_ROWS; x++) {
                        this.grid[i][x] = 0;
                    }
                }
            },
            /**
             * Do a check before loading
             */
            play: function (forceStop) {
                if (F.editor.controls.tracks.length == 0 && forceStop != true) {
                    alert('To start, add a track pressing the "+" on the left hand side.');
                } else {
                    if (F.editor.controls.stop && forceStop != true) {
                        F.editor.controls.stop = false;
                        F.editor.controls.load();
                    } else {
                        F.editor.controls.stop = true;
                        clearInterval(F.editor.controls.loop);
                        F.ui.editor.cursor.drawLines();
                    }
                    F.ui.editor.togglePlay();
                }
            },
            /**
             * Loads all the remaining unbuffered songs.
             */
            load: function(){
                if (F.editor.controls.cursor < F.editor.controls.tracks.length) {
                    // load next sound
                    //var obj = this.tracks[this.cursor].getAudioObj();
                    F.editor.controls.cursor++;
                    F.editor.controls.load();
                } else {
                    // play
                    F.editor.controls.cursor = 0;
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

                    var trNr = F.editor.controls.tracks.length;
                    // Selects the right column to play for
                    for (var i = 0; i < F.editor.controls.columns; i++) {
                        if (F.editor.controls.grid[F.editor.controls.cursor][i] != 0) {
                            if (i < trNr) {
                                F.editor.controls.tracks[i].getAudioObj().play();
                            } else {
                                break;
                            }
                        }
                    }
                    // Starts back if the end is reached
                    if (F.editor.controls.cursor + 1 < F.editor.controls.columns) {
                        F.editor.controls.cursor++;
                    } else {
                        F.editor.controls.cursor = 0;
                    }
                    // Recurse
                    this.loop = setTimeout(F.editor.controls.playSound, F.editor.controls.interval);
                } else {
                    var columnIndexToRepaint = (F.editor.controls.cursor > 0) ? (F.editor.controls.cursor-1) : F.editor.controls.grid.length-1;
                    F.ui.editor.cursor.erase(columnIndexToRepaint, F.editor.controls.grid);
                    F.ui.editor.cursor.drawLines(null, F.editor.controls.cursor);
                    F.editor.controls.cursor = 0;
                }
            }
        },
        /**
         * Settings
         */
        trackSettings : {
            songsListObject: null,
            currentSettingsIndex: null,
            recorder: null,
            recording: null,

            /**
             *
             */
            toggleSettings: function (e) {
                var trackNr = e.currentTarget.id.split('-')[1];
                if (F.editor.trackSettings.currentSettingsIndex == trackNr) {
                    F.ui.editor.trackSettings.hide(trackNr);
                    F.editor.trackSettings.currentSettingsIndex = null;
                } else {
                    F.editor.trackSettings.load(e);
                    F.ui.editor.trackSettings.show(e);
                    F.editor.trackSettings.currentSettingsIndex = trackNr;
                }
            },
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
            /***
             * Look up for the audio track and set it
             * @param category
             * @param name
             */
            setupAudio: function (e) {
                var category = $('select[name=track-category-selection]')[0].value;
                var name = e.target.value;

                for (var i = 0; i < F.editor.trackSettings.songsListObject.categories.length; i++) {
                    if (F.editor.trackSettings.songsListObject.categories[i].name === category) {
                        for (var z = 0; z < F.editor.trackSettings.songsListObject.categories[i].tracks.length; z++) {
                            if (F.editor.trackSettings.songsListObject.categories[i].tracks[z].name === name) {
                                var file = F.editor.trackSettings.songsListObject.categories[i].tracks[z].file;
                                F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].setAudio(category, name, F.editor.PATHTOTRACKS + category + "/" + file);
                                F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].getAudioObj().play();
                                // Rename the track
                                F.ui.editor.nameTrack(F.editor.trackSettings.currentSettingsIndex, name)
                                return;
                            }
                        }
                    }
                }
            },
            /***
             *  Destroy the audio object within the track and with it, destroy
             *  a potential recording still in memory.
             */
            unsetAudio: function (track) {
                if (track.getType() === "recording") {
                    var trackName = track.getName();
                    F.utils.io.deleteFromDb(trackName, function (e) {
                        console.log("deleted");
                    });
                }
                track.getAudioObj().stop();

            },
            /**
             * Preview audio files. The audio data will not preserved in the application memory.
             * @param category
             * @param file
             * @param PATHTOTRACKS
             */
            previewAudio: function(category, file, PATHTOTRACKS){
                new Howl({ src: [ PATHTOTRACKS + category + "/" + file] }).play();
            },
            /***
             * Access the user microphone and record a sound to be played in the
             * editor.
             * @param trackId
             */
            recordAudio: function(trackId){
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                //
                if (navigator.getUserMedia) {
                    navigator.getUserMedia({audio: true},
                        // Success!
                        function (e) {
                            F.ui.editor.trackSettings.recordAudio.during();
                            F.editor.trackSettings.recorder = new Recorder(new AudioContext().createMediaStreamSource(e), {
                                workerPath: "js/classes/workers/recorderWorker.js",
                                numChannels: 1
                            });
                            F.editor.trackSettings.recorder.record();

                            setTimeout(function () {
                                F.editor.trackSettings.recorder.stop();
                                F.editor.trackSettings.recorder.exportWAV(function (e) {
                                    // TODO converting to mp3

                                    var filename = "recording/" + Date.now().toString() + ".wav";
                                    F.utils.io.saveRecording(filename, e, function () {
                                        F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].setPath(filename);
                                        F.ui.editor.trackSettings.recordAudio.end();

                                        F.utils.io._loadFromDB(filename, function (e) {
                                            var blob = e;
                                            //var audioElement = document.getElementById('audio_preview');
                                            //audioElement.src = window.URL.createObjectURL(blob);
                                            var src = [window.URL.createObjectURL(blob)];
                                            F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].setAudioObj(src, "wav");
                                            F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].setType("recording");
                                            F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].setName(filename);
                                            F.editor.controls.recordings.push(filename);
                                            F.ui.editor.nameTrack(F.editor.trackSettings.currentSettingsIndex, "Recording")

                                        });
                                    });
                                });

                            }, 1000);
                        },
                        function (err) {
                            alert("The following error occured: " + err.name);
                        }
                    );
                } else {
                    alert("getUserMedia not supported");
                }
            },
            /***
             * Attempts to play the last recorded track.
             * In case that was not recorded yet, it will return false.
             */
            playRecordedAudio: function () {
                var path = F.editor.controls.tracks[F.editor.trackSettings.currentSettingsIndex].getPath();
                if (path != "") {
                    F.utils.io._loadFromDB(path, function (e) {
                        var blob = e;
                        new Howl({
                                src: [window.URL.createObjectURL(blob)],
                                ext: ["wav"],
                                onend: function () {
                                    console.log("Finished playback")
                                }
                            }
                        ).play();
                    });
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
                var category = track.getCategory();
                F.ui.editor.trackSettings.load(volume, balance, name, type, category);
            },
            /***
             * Loads in the list of audio track files
             */
            init: function () {
                $.ajax({
                    type: 'GET',
                    url: './data/tracks.json',
                    // type of data we are expecting in return:
                    dataType: 'json',
                    timeout: 500,
                    success: function (data) {
                        F.editor.trackSettings.songsListObject = data;
                        F.ui.editor.trackSettings.init(F.editor.trackSettings.songsListObject);
                    },
                    error: function (xhr, type) {
                        alert('Tracks are not loaded in!')
                    }
                })
            }
        },
        /***
         * Clean objects around and quit the editor
         */
        exit: function (confirmation) {
            var safetyMessage = (confirmation === true) ? true : confirm("Are you sure to exit the beat?");

            if (safetyMessage) {

                for (var i = 0; i < F.editor.controls.tracks.length; i++) {
                    $('#mu-' + i).off("click");
                }

                //TODO
                var arrayElementsToHide = ['menu-panel', 'selector-panel'];

                if ($('#' + arrayElementsToHide[0]).hasClass("visibleElement")) {
                    F.ui.editor.beatSettings.toggleShow();
                }

                if ($('#' + arrayElementsToHide[1]).hasClass("visibleElement")) {
                    F.ui.editor.beatSettings.toggleInterval();
                }

                var rangeStep = $('#range-step')
                rangeStep.val(500);
                F.ui.editor.beatSettings.changePlaySpeed(500);
                // Hide
                F.ui.editor.trackSettings.hide(F.editor.trackSettings.currentSettingsIndex);


                $('#mu-list').html("");
                $('#control-menu').off('click');
                // remove all the listeners that are not needed
                var mu = $('#mu-last');
                mu.off('click', F.editor.addTrack);

                this.c.removeEventListener('click', F.editor.select);

                $('#control-play').off('click', F.editor.controls.play);
                // force stop
                F.editor.controls.play(true);

                // Resize the editor main
                var editor = $('#editor-main');
                editor.attr('height', F.editor.look.y);
                editor.off('click');
                //Resize the container
                var container = $('#app-container');
                var sideControls = $('#side-controls');
                sideControls.css('height', F.editor.look.y + "px");

                container.scrollTop(0);

                F.utils.cleaner.cleanUpFiles(F.editor.controls.recordings);
                F.editor.controls.recordings = [];

                container.css("overflow-y", "hidden");
                // Restore the columns
                if (F.editor.col_number === 16) {
                    F.ui.editor.beatSettings.toggleNumberColumns(false);
                }
                var radios = document.forms["audioTrack"].elements["type"];
                for (var i = 0; i < radios.length; i++) {
                    radios[i].removeEventListener('click', F.ui.editor.trackSettings.toggleSelector)
                }
                $('form button').off('click');

                $('form[name="audioTrack"] button[name=record-choice]').off('click')

                $('#control-hide').off("click", F.ui.editor.toggleControls);
                var controlVolume = $("input[name=vol]");
                controlVolume.off("change");
                var balanceVolume = $("input[name=bal]");
                balanceVolume.off("change");
                var playSoundBtn = $("button[name=play-choice]");
                playSoundBtn.off("click");
                // visibility
                document.removeEventListener("visibilitychange", F.editor.suspend);
                var soundSelector = $('select[name=track-selection]');
                soundSelector.off("change");
                // Hide
                F.ui.menu.displaySaves(false, false, 'recent-files-menu', 5);
                F.ui.changeScreen("menu", "back");
                // save the last session
            }
        }

    },
    settings: {
        general: {
            detectScreenSizeType: function () {
                var x = window.innerWidth;
                var y = window.innerHeight;

                if (x > y) {
                    return "landscape";
                } else {
                    return "portrait";
                }
            },
            screenChange: function () {
                if (this.detectScreenSizeType() == "landscape") {
                    screen.lockOrientation('landscape');
                }
            }
        },
        beat: {
            /**
             * Consumes a filename and saves a json file into the indexeDB if succefull.
             * @param name
             * @type {string}
             * @param alert
             * @type {boolean}
             * @param forceOverwriting
             * @type {boolean}
             */
            save: function (name, alert, forceOverwriting) {
                var test = /[\/:\*\?"<>\\|]/g.test(name);
                var overwrite = false;

                if (forceOverwriting === true) {
                    overwrite = true;
                }
                var beat = (F.utils.io.simpleLoad("beats")) ? F.utils.io.simpleLoad("beats") : '';

                if (beat.indexOf(name) != -1 && overwrite === false) {
                    var ask = confirm("A beat named: '" + name + "' already exists. By pressing OK you will overwrite it.");
                    if (!ask) {
                        return false;
                    } else {
                        overwrite = true;
                    }
                }
                if (test) {
                    return false;
                }
                if (F.editor.controls.tracks.length > 0) {
                    var contentSave = '{ "grid":';
                    contentSave += JSON.stringify(F.editor.controls.grid);
                    contentSave += ',"tracks": [';

                    for (var i = 0; i < F.editor.controls.tracks.length; i++) {
                        contentSave += "{"
                        contentSave += ('"name": "' + F.editor.controls.tracks[i].getName() + '",');
                        contentSave += ('"path": "' + F.editor.controls.tracks[i].getPath() + '",');
                        contentSave += ('"category": "' + F.editor.controls.tracks[i].getCategory() + '",');
                        contentSave += ('"type": "' + F.editor.controls.tracks[i].getType() + '",');
                        contentSave += ('"balance": "' + F.editor.controls.tracks[i].getBalance() + '",');
                        contentSave += ('"volume": "' + F.editor.controls.tracks[i].getVolume() + '"');
                        if (i == F.editor.controls.tracks.length - 1) {
                            // last track
                            contentSave += "}"
                        } else {
                            contentSave += "},"
                        }
                    }
                    contentSave += "],";
                    contentSave += '"interval": ' + F.editor.controls.interval + ',';
                    contentSave += '"columns": ' + F.editor.controls.columns;
                    contentSave += "}"
                }

                //console.log(contentSave);
                // TODO: refactor constants
                var beat = (F.utils.io.simpleLoad("beats")) ? F.utils.io.simpleLoad("beats") : '';
                var beatTime = (F.utils.io.simpleLoad("beats_time")) ? F.utils.io.simpleLoad("beats_time") : '';

                F.utils.io.saveBeat(name, contentSave, function () {
                    //  Add to the local storage
                    var time = Date.now() / 1000;

                    if (overwrite) {
                        var arrayBeat = beat.split(";");
                        var index = arrayBeat.indexOf(name);
                        var arrayBeatTime = beatTime.split(";");
                        arrayBeat.splice(index, 1);
                        arrayBeatTime.splice(index, 1);
                        beat = F.settings.beat.recomposeString(arrayBeat);
                        beatTime = F.settings.beat.recomposeString(arrayBeatTime);
                    }
                    F.utils.io.simpleSave("beats", beat + ";" + name);
                    F.utils.io.simpleSave("beats_time", beatTime + ";" + time);
                    if (alert != false) F.utils.notify("'" + name + "' has been saved.");
                });
            },
            /**
             * Recomposes the string after the array has been created
             * @param array
             * @returns {string}
             */
            recomposeString: function (array) {
                var string = "";
                for (var i = 0; i < array.length; i++) {
                    if (array[i] != "") {
                        string += array[i] + ";";
                    }
                }
                return string;
            },
            /**
             * Consumes a filename and loads in every data about the beat that should be loaded.
             * @param name
             * example :
             * "{ "grid":[[0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],"tracks": [{"name": "Bd-01","path": "","category": "drum_machine","type": "audio","balance": "0.5","volume": "0.5"}],"interval": 500}"
             */
            load: function (name) {
                // close up the saves long list
                if ($('#saves').hasClass('hiddenElement') === false) {
                    F.menu.saves.toggle();
                }

                var name = (typeof name === "string") ? name : name.currentTarget.id;
                if (name.indexOf(".json") === -1) {
                    name = name + ".json";
                }

                F.utils.io.loadBeat(name, function (text) {

                    // Convert blob into a binary string
                    var reader = new window.FileReader();
                    reader.readAsBinaryString(text);

                    // When it is done the file is parsed,
                    // and the data added.
                    reader.onloadend = function () {
                        text = reader.result;

                    var j = JSON.parse(text);

                        //console.log(j);
                        F.editor.controls.grid = j.grid;
                        F.editor.controls.tracks = [];
                        var tracksLength = j.tracks.length;

                        //Start the loading process
                        loadStep(0);

                        function loadStep(i) {
                            //for (var i = 0; i < j.tracks.length; i++) {
                            // add to the array
                        var currentTrack = j.tracks[i];
                        var newTrack = {};
                        var trackName = currentTrack.name;
                        var categoryName = currentTrack.category;
                        var volume = currentTrack.volume;
                        var balance = currentTrack.balance;
                        var path = currentTrack.path;
                        var type = currentTrack.type;

                        /** TODO : Refactor the below code.
                         * The load from SD card is an ajax call! **/

                            if (type === "recording") {
                            F.utils.io._loadFromDB(path, function (e) {
                                var blob = e;
                                var audioObj = new Howl({
                                        src: [window.URL.createObjectURL(blob)],
                                        ext: ["wav"],
                                        preload: true
                                    }
                                );
                                newTrack = new Track(audioObj, trackName, categoryName);
                                newTrack.setType(type);
                                newTrack.setPath(path);
                                newTrack.setVolume(volume);
                                newTrack.setBalance(balance);
                                F.editor.controls.tracks[i] = newTrack;
                                F.ui.editor.addTrack(i);


                                F.ui.editor.nameTrack(i, "Recording");


                                if (i < tracksLength - 1) {
                                    loadStep(i + 1);
                                }

                            });
                        } else {
                                var name;
                                // Find the url of the track
                                for (var z = 0; z < F.editor.trackSettings.songsListObject.categories.length; z++) {
                                    if (F.editor.trackSettings.songsListObject.categories[z].name === categoryName) {
                                        for (var t = 0; t < F.editor.trackSettings.songsListObject.categories[z].tracks.length; t++) {
                                            if (F.editor.trackSettings.songsListObject.categories[z].tracks[t].name === trackName) {
                                                name = F.editor.trackSettings.songsListObject.categories[z].tracks[t].file;
                                                break;
                                            }
                                        }
                                        break;
                                    }

                                }

                            var path = F.editor.PATHTOTRACKS + categoryName + "/" + name;
                            var audioObj = new Howl({
                                src: [path],
                                ext: ['ogg'],
                                preload: true
                            });


                                newTrack = new Track(audioObj, trackName, categoryName);
                            newTrack.setPath(path);
                            newTrack.setVolume(volume);
                            newTrack.setBalance(balance);
                            F.editor.controls.tracks[i] = newTrack;
                                F.ui.editor.addTrack(i);

                                F.ui.editor.nameTrack(i, trackName);


                                if (i < tracksLength - 1) {
                                    loadStep(i + 1);
                                }
                        }

                        }

                    F.editor.controls.grid=j.grid;
                    F.editor.controls.interval=j.interval;

                        F.ui.changeScreen('editor', 'deeper');
                        F.editor.openBeat(j.grid, j.columns, j.interval);
                    }
                });
            }
        }
    },

    menu: {
        init: function (IO) {
            F.utils.io = IO;
            F.ui.menu.init();
            // Load the track settings only once.
            F.editor.trackSettings.init();
        },

        about: {

            contact: function (e) {
                var id = e.currentTarget.id;
                var url = "";
                if (id === "github-link") {
                    url = "https://github.com/loreV/firebeat";
                } else if (id === "email-link") {
                    url = "mailto:lore@themovingweb.com"

                }

                var openURL = new MozActivity({
                    name: "view",
                    data: {
                        type: "url",
                        url: url
                    }
                });
            },

            toggle: function (e) {
                var about = $('#about');
                var closeBtn = $('#icon-close-about');
                var className = 'hiddenElement';
                var appName = $('#app-name');
                var showing = about.hasClass(className);
                var gitLink = $('#github-link');
                var emailLink = $('#email-link')
                if (showing) {
                    appName.addClass('title-coloring');
                    about.removeClass(className);
                    closeBtn.on("click", F.menu.about.toggle);

                    gitLink.on("click", F.menu.about.contact);
                    emailLink.on("click", F.menu.about.contact);

                } else {
                    appName.removeClass('title-coloring');
                    about.addClass(className);
                    closeBtn.on("click", F.menu.about.toggle);
                    gitLink.off("click");
                    emailLink.off("click");

                }
            }
        },
        saves: {
            toggle: function () {
                var elem = 'saves';
                var isShowing = F.ui.toggleDisplay(elem);
                if (isShowing === true) {
                    F.menu.saves.load(elem);
                } else {
                    F.menu.saves.close(elem);
                }
            },
            load: function (elem) {
                $('#icon-close').click(F.menu.saves.toggle);
                F.ui.menu.displaySaves(true, true, 'saves-list', 9999);
            },
            close: function (elem) {
                $('.icon-close').off("click");
                $('#saves-list').html("");
                F.ui.menu.displaySaves(false, false, 'recent-files-menu', 5);
            },
            delete: function (e) {
                e.stopPropagation();
                var object = $(e.currentTarget).parent().parent()[0];
                var id = object.id;
                var objectTime = $('#time-' + id);

                if (id != "") {
                    var ask = confirm("Are you sure you want to delete '" + id + "', and the connected recordings, from the memory of your phone?");
                    if (ask) {

                        // delete the files
                        object.remove();
                        objectTime.remove();
                        var name = id;
                        if (id.indexOf(".json") === -1) {
                            id = id + ".json";
                        }

                        F.utils.io.loadBeat(id, function (text) {

                            // Convert blob into a binary string
                            var reader = new window.FileReader();
                            reader.readAsBinaryString(text);

                            // When it is done the file is parsed,
                            // and the data added.
                            reader.onloadend = function () {
                                text = reader.result;

                                var j = JSON.parse(text);
                                // DELETE all the tracks
                                for (var z = 0; z < j.tracks.length; z++) {
                                    if (j.tracks[z].type === "recording") {
                                        F.utils.io.deleteFromDb(j.tracks[z].name, function (e) {
                                            console.log("removing tracks");
                                        });
                                    }
                                }
                                F.utils.io.deleteFromDb(id, function (e) {
                                    window.navigator.vibrate(200);
                                });
                                // splice the array
                                var b = F.utils.io.simpleLoad("beats");
                                b = b.split(";");
                                var index = b.indexOf(name);
                                b.splice(index, 1);
                                b = F.settings.beat.recomposeString(b);
                                F.utils.io.simpleSave("beats", b);

                                var b = F.utils.io.simpleLoad("beats_time");
                                b = b.split(";");
                                b.splice(index, 1);
                                b = F.settings.beat.recomposeString(b);
                                F.utils.io.simpleSave("beats_time", b);
                            };
                        });
                    }

                }
            }
        }
    }
};


window.addEventListener('DOMContentLoaded', function () {
    // We'll ask the browser to use strict code to help us catch errors earlier.
    // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
    'use strict';
    var IO = new FIO();
    F.menu.init(IO);
});
