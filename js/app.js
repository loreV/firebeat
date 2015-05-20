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
        }




    },

    editor: {

        look:{
            x:0,
            y:0
        },

        c: {},
        co: {},
        grid: {},



        init: function () {

            // TODO -> turn the screen & lock it
            this.c = document.getElementById("editor-main");
            this.c.width = window.innerWidth;
            this.c.height = window.innerHeight;
            this.co = F.editor.c.getContext("2d");

            //F.ui.changeOrientation();

            console.log(screen.orientation);
            F.editor.newGrid();

            //screen.addEventListener("orientationchange",
            //    function(){
            //      },
            //    false);

        },

        newGrid: function () {
            var x =window.innerWidth;
            var y =window.innerHeight;

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


            var row_height = y /actualNrRows;

            // then count how many columns we are going to have;
            var min_num_columns = 12;
            var column_size = x / 12;


            // rows should be high enough to fill up the space
            //if(window.innerHeight > 320) nrRows = window.innerHeight  ;

            var color1 = "#fff3e0";
            var color2= "#f9fbe7";

            var diffBackground = true;
            var diffBackground2 = true;
            for (var i = 0; i < actualNrRows; i++) {
                F.editor.co.fillStyle = diffBackground ? color1 : color2;
                F.editor.co.fillRect(0, (i * row_height), x , row_height);

                for(var z = 0 ; z < min_num_columns; z++){
                    // Render the controller
                    // if z == 0;
                    F.editor.co.fillStyle = diffBackground2 ? color2 : color1 ;
                    F.editor.co.fillRect((z * column_size), (i*row_height) , column_size , row_height);
                    diffBackground2 = !diffBackground2;
                }



                diffBackground = !diffBackground;
                diffBackground2 = !diffBackground2;
            }


        },


        newBeat: function () {

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
