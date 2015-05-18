// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded

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
        }
    },

    editor: {
        c: {},
        co: {},
        grid: {},

        init: function () {
            F.editor.c = document.getElementById("editor-main");
            F.editor.c.width = window.innerWidth;
            F.editor.c.height = window.innerHeight;
            F.editor.co = F.editor.c.getContext("2d");
            F.editor.newGrid();
        },

        newGrid: function () {
            var nrRows = 3;
            // rows should be high enough to fill up the space
            //if(window.innerHeight > 320) nrRows = window.innerHeight  ;

            var diffBackground = true;
            for (var i = 0; i < nrRows; i++) {
                F.editor.co.fillStyle = diffBackground ? "#ffd8c9" : "#FFFFFF";
                F.editor.co.fillRect(0, 0 + (i * 106), F.editor.c.width, 106);


                diffBackground = !diffBackground;
            }


        },


        newBeat: function () {

        }

    },

    menu: {
        init: function () {
            $('.new-btn').click(function () {
                F.ui.changeScreen("editor", "deeper");
                F.editor.init();
            });
            $('.exit-screen').click(function () {
                F.changeScreen("menu", "back")
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
