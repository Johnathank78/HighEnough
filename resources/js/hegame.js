function highEnough(){

    // METHOD

    jQuery.fn.getStyleValue = function(prop){
        return parseFloat($(this).css(prop).replace('px', ''));
    };

    // INIT

    const platform = "Web";
    const isMobile = /Mobi/.test(navigator.userAgent);

    var current_page = "landing";

    var HErecovery = HErecovery_read();
    var scores = scores_read();

    const winMsg = [
        "MAJESTIC", "PERFECT", "GOOD", "NICE", "COOL",
        "AWESOME", "BRILLIANT", "EXCELLENT", "FANTASTIC", "WONDERFUL",
        "INCREDIBLE", "OUTSTANDING", "SUPERB", "SPECTACULAR", "AMAZING",
        "IMPRESSIVE", "FABULOUS", "EPIC", "GLORIOUS", "MAGNIFICENT", "PHENOMENAL", 
        "UNSTOPPABLE", "LEGENDARY"
    ];

    const looseMsg = [
        "F*CK", "OUCH", "TOO BAD", "CRAP", "NEXT TIME",
        "BUMMER", "FAIL", "YIKES", "CLOSE ONE", "UH-OH",
        "WHOOPS", "DISASTER", "TRY AGAIN", "SO CLOSE",
        "TRAGIC", "BUSTED", "NOPE", "OUCHIE", "MISS", "WRONG MOVE", 
        "TOUGH BREAK", "DARN"
    ];

    // GLOBAL VARS 

    const text_fadeInDelay = 500;
    const text_fadeOutDelay = 350;
    const text_fadePauseDelay = 650;
    
    const minHeight = $(".gameFrame_heart").getStyleValue('height') + 30;

    var lastName = '';

    // GET DATA
    
    function scores_read(){
        let data = localStorage.getItem("scores");

        if(data === null || data == ""){
            scores_save([]);
            return [];
        }else{ 
            data = JSON.parse(data);
            return data;
        };
    };

    function scores_save(data){
        localStorage.setItem("scores", JSON.stringify(data));
        return;
    };

    function HErecovery_read(){
        let data = localStorage.getItem("HErecovery");
    
        if(data === null || data == ""){
            return false;
        }else{
            data = JSON.parse(data);
            return data;
        };
    };
    
    function HErecovery_save(data){
        localStorage.setItem("HErecovery", JSON.stringify(data));
        return;
    };

    function update_HErecovery(){
        HErecovery = {
            "gameover": gameover,
            "combo": combo,
            "maxCombo": maxCombo,
            "score": score,
            "hearts": hearts,
            "maxhearts": maxhearts,
            "goalHeight": goalRandomHeight,
            "goalSize": goalSize
        };

        HErecovery_save(HErecovery);
    };

    function HErecovery_init(mode){
        HErecovery = {
            "gameover": false,
            "combo": false,
            "maxCombo": false,
            "score": false,
            "hearts": false,
            "maxhearts": false,
            "goalHeight": false,
            "goalSize": false
        };
    };

    async function phoneINIT(){
        window.screen.orientation.lock('portrait');
        await StatusBar.setOverlaysWebView({ overlay : true })

        setTimeout(() => {
            StatusBar.hide({ animation : 'SLIDE'});
        }, 2500);

        let isHiding = false;

        setInterval(async () => {
            let data = await StatusBar.getInfo()

            if(data.visible && !isHiding){
                isHiding = true;
                setTimeout(async () => {
                    await StatusBar.hide({ animation : 'SLIDE'});
                    isHiding = false;
                }, 2500);
            };

        }, 100);
    };
    
    if(platform == "Mobile"){
        phoneINIT();
    };
    
    // UTILITY
    
    function zoom(target, vec, zoomStrength, zoomSpeed, zoomCenter=[0.5, 0.5], callback=false){
        let HWRatio = $(target).height()/$(target).width();
        
        let zoomStrengthWH = [zoomStrength, zoomStrength*HWRatio];
        let zoomOffset = [(zoomStrengthWH[0]/2), (zoomStrengthWH[1]/2)];
        
        let tZoomCenter = zoomCenter;

        if($(target).is('span')){
            $(target).animate({
                fontSize: "+="+vec*zoomStrength*0.45+"px"
            }, zoomSpeed, function(){
                if(callback){callback()};
            });
        }else{
            $(target).animate({
                width: "+="+vec*zoomStrengthWH[0]+"px",
                height: "+="+vec*zoomStrengthWH[1]+"px",
                left: "+="+(-vec)*zoomOffset[0]*tZoomCenter[0]+"px",
                top: "+="+(-vec)*zoomOffset[1]*tZoomCenter[1]+"px",
            }, zoomSpeed, function(){
                if(callback){callback()};
            });
        };
    };

    function tilt(target, strenght, speed, center, tiltPause, midCallback=false, endCallBack=false){
        zoom(target, 1, strenght, speed/2, center, function(){
            if(midCallback){midCallback()}
            setTimeout(() => {
                if(endCallBack){
                    zoom(target, -1, strenght, speed/3, center, endCallBack);
                }else{
                    zoom(target, -1, strenght, speed/3, center);
                };
            }, tiltPause);
        });
    };
    
    function goBack(platform){
        if(current_page == "scores"){
            $(".scoreFrame_leaveBtn").click();
        }else if(current_page == "play"){
            if(gameover){
                $('.gameFrame_goBack').click();
            }else{
                $('.gameFrame_pause').click();
            };
        }else if(current_page == "landing" && platform == "Mobile"){
            App.exitApp();
        };
    };

    if(platform == "Mobile"){
        App.addListener('backButton', () => {
            goBack(platform);
        }); 
    }else if(platform == "Web"){
        $(".IOSbacker").on("touchstart", function(e){
            e.preventDefault();
        }).on("touchmove", function(e){
            backerX = e.touches[0].clientX;
        }).on("touchend", function(){
            if(backerX > 50){
                goBack(platform);
            };
        });
    };

    // NAVIGATION

    $(".mainFrame_btn").on("click", function(e){
        if($(this).hasClass("play")){
            startParty();
        }else if($(this).hasClass("scores")){
            showScoreboard();
        };
    });

    function goToMain(){

        if(current_page == "scores"){
            let step = 8;
            let scrollIntervall = setInterval(() => {
                if(Math.round(($("body").scrollTop()/$('.app').height()) * 100) <= 60){
                    $('html').css('backgroundColor', "rgb(135, 206, 250)");
                };

                if($("body").scrollTop() - step <= $(window).height()){
                    $("body").scrollTop($(window).height())
                    clearInterval(scrollIntervall)
                }else{
                    $("body").scrollTop($("body").scrollTop() - step)     
                };
            }, 1);

        }else if(current_page == "play"){
            let step = 8;
            let scrollIntervall = setInterval(() => {
                if($("body").scrollTop() + step >= $(window).height()){
                    $("body").scrollTop($(window).height())
                    clearInterval(scrollIntervall)
                }else{
                    $("body").scrollTop($("body").scrollTop() + step)     
                };
            }, 1);
        };

        current_page = "landing";
    };

    // GOAL

    var goalRandomHeight = false;
    var goalSize = 35;
    var goal_fadeInDelay = 150;
    var goal_fadeOutDelay = 150;

    var playerLimit = false;

    function getGoalPos(){
        let allZone = 0.5 * $(window).height();
        let deadZone = allZone * 0.3;
        let safeZone = allZone - deadZone;

        let randomVal = [Math.random(0, 1)*deadZone, deadZone + Math.random(0, 1)*safeZone, deadZone + Math.random(0, 1)*safeZone, deadZone + Math.random(0, 1)*safeZone, deadZone + Math.random(0, 1)*safeZone];
        let randomInd = Math.round(Math.random(0, 1)*(randomVal.length - 1));

        return 125 + randomVal[randomInd];
    };

    function goalSpawn(HErecovery = false){
        $(".gameFrame_gameGoal").css("height", goalSize + "px");
        $(".gameFrame_gameGoal").css('top', goalRandomHeight + "px");

        if(!HErecovery){
            $(".gameFrame_gameGoal").animate({
                opacity: 1
            }, goal_fadeInDelay);
        }else{
            $(".gameFrame_gameGoal").css('opacity', '1');
        };

        playerLimit = Math.floor(Math.abs($(window).innerHeight() - goalRandomHeight));
    };

    // PARTY

    var gameReady = false;
    var nextRound = true;
    var gameover = false;

    var maxhearts = 3;
    var hearts = 3;
    
    var combo = 0;
    var maxCombo = 0;
    const comboGoal = 3;

    var lastRoundPressed = 0;
    var round = 0;
    var score = 0;

    var height = minHeight;
    var finalHeight = 0;

    var gameIntervall = false;
        
    function startParty(replay=false){
        current_page = "play";

        if(gameIntervall){clearInterval(gameIntervall); gameIntervall = false};

        if(!replay){
            let step = 8;
            let scrollIntervall = setInterval(() => {
                if($("body").scrollTop() <= 0){gameStart(); clearInterval(scrollIntervall)};
                $("body").scrollTop($("body").scrollTop() - step);
            }, 1);
        };

        if(!HErecovery){HErecovery = HErecovery_init()};

        gameIntervall = setInterval(() => {
            if(gameReady && nextRound && !gameover){

                round += 1;
                nextRound = false;

                firstRoundDown = true;
                firstRoundUp = true;

                goalRandomHeight = getGoalPos();

                if(round > 0 && score > 0){
                    update_HErecovery();
                };

                goalSpawn();
            };
        }, 100);
    };

    function gameStart(){
        current_page = "play";
        gameReady = true;

        $(".gameFrame_gameGoal").css("display", "flex");
    };

    function endOfRound(){

        // CALCULATE BOUNDS

        let goalUpperBound = playerLimit;
        let goalLowerBound = goalUpperBound - goalSize;

        $(".gameFrame_gameGoal").animate({
            opacity: 0
        }, goal_fadeOutDelay)

        let won = false
        let randomWord = false

        let target = false
        let target_shadow = false
        let heartId = maxhearts - hearts;

        if(finalHeight <= goalUpperBound && finalHeight >= goalLowerBound){
            won = true;

            combo += 1;
            $(".gameFrame_combo").text('COMBO : ' + combo.toString());

            if(combo%comboGoal == 0){
                tilt($('.gameFrame_combo').eq(0), 30, 1225, [-0.5, -0.5], 300);
            };

            target = $(".gameFrame_winMsg, .gameFrame_scoreMsg");
            target_shadow = $(".gameFrame_winMsg_shadow, .gameFrame_scoreMsg_shadow");

            randomWord = winMsg[Math.round(Math.random(0, 1)*(winMsg.length - 1))];

            if(combo%comboGoal == 0){
                if(hearts < maxhearts){
                    tilt($(".gameFrame_heart").eq(heartId - 1), 15, 1225, [0.5, 1], 100, function(){
                        $(".gameFrame_heart").eq(heartId - 1).attr("src", "./resources/imgs/heartFull1.svg");
                        hearts += 1;
                    });

                    $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text("COMBO x"+combo);
                    $('.gameFrame_scoreMsg_shadow, .gameFrame_scoreMsg').html('+<img src="./resources/imgs/heartFull1.svg" class="gameFrame_heartText" alt="">');
                }else if(combo >= (maxhearts - 2)*comboGoal && maxhearts == hearts && maxhearts < 10){
                    hearts += 1;
                    maxhearts += 1;
                    
                    $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text("COMBO x"+combo);
                    $('.gameFrame_scoreMsg_shadow, .gameFrame_scoreMsg').html('+<img src="./resources/imgs/heartFull1.svg" class="gameFrame_heartText" alt="">');

                    let additionalHeart = $('<img src="./resources/imgs/heartFull1.svg" class="gameFrame_heart" alt="">');
                    $(additionalHeart).css({
                        right: $('.gameFrame_heart').last().getStyleValue('right') + 30 + "px",
                        opacity: 0
                    });

                    $('.gameFrame').append($(additionalHeart));
                    $(".gameFrame_heart").last().animate({
                        opacity: 1
                    }, 100);

                    tilt($(".gameFrame_heart").last(), 15, 1225, [0.5, 1], 100);
                }else{
                    $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text(randomWord);
                    $('.gameFrame_scoreMsg_shadow, .gameFrame_scoreMsg').html("+1");
                };
            }else{
                $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text(randomWord);
                $('.gameFrame_scoreMsg_shadow, .gameFrame_scoreMsg').html("+1");
            };

            score += 1;
            //$(".gameFrame_score").text('SCORE : ' + score.toString());

            if(score%10 == 0 && $(".gameFrame_gameGoal").height() > 17.5){
                goalSize -= 2.5;
                tilt($('.gameFrame_score').eq(0), 30, 1225, [-0.5, -0.5], 300);
            };
        }else{
            if(combo > maxCombo){
                maxCombo = combo;
            };

            combo = 0;

            $(".gameFrame_combo").text('COMBO : ' + combo.toString());

            target = $(".gameFrame_winMsg");
            target_shadow = $(".gameFrame_winMsg_shadow");

            randomWord = looseMsg[Math.round(Math.random(0, 1)*(looseMsg.length - 1))];
            $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text(randomWord);

            tilt($(".gameFrame_heart").eq(heartId), 15, 1225, [0.5, 1], 100, function(){
                $(".gameFrame_heart").eq(heartId).attr("src", "./resources/imgs/heartEmpty1.svg");
                hearts -= 1;
            });

            if(hearts == 1){
                setTimeout(() => {
                    clearInterval(gameIntervall);
                    gameIntervall = false;
                    gameOver();
                    return;
                }, 250);
            }
        };

        if(!(hearts == 1 && !won) && hearts >= 1){
            $(target).animate({
                opacity: 1
            }, text_fadeInDelay, function(){
                setTimeout(() => {                    
                    $(target).animate({
                        opacity: 0
                    }, text_fadeOutDelay);
                }, text_fadePauseDelay);
            });
    
            $(target_shadow).animate({
                opacity: .3
            }, text_fadeInDelay, function(){
                setTimeout(() => {
                    $(target_shadow).animate({
                        opacity: 0
                    }, text_fadeOutDelay);
                }, text_fadePauseDelay);
            });
            
            setTimeout(() => {
                nextRound = true
            }, text_fadeInDelay + text_fadePauseDelay + text_fadeOutDelay);
        };
    };

    // END OF PARTY

    function gameOver(HErecovery = false){
        gameover = true;
        nextRound = false;

        $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text("GAME OVER !");
        
        if(HErecovery){
            $('.gameFrame_gameOverWrapper').css("opacity", "1");
            $(".gameFrame_winMsg").css("opacity", "1");
            $(".gameFrame_winMsg_shadow").css("opacity", ".3");
            $('.gameFrame_gameOverWrapper').css('pointer-events', 'all');
        }else{
            update_HErecovery();

            $('.gameFrame_gameOverWrapper').animate({
                opacity : 1
            }, text_fadeInDelay, function(){
                $('.gameFrame_gameOverWrapper').css('pointer-events', 'all');
            });
            
            $(".gameFrame_winMsg").animate({
                opacity: 1
            }, text_fadeInDelay);
            
            $(".gameFrame_winMsg_shadow").animate({
                opacity: .3
            }, text_fadeInDelay);
        };

        $('#player').val(lastName);
    };

    function gameReset(){
        $('.gameFrame_gameOverWrapper').css('pointer-events', 'none');
        $('.gameFrame_gameOverWrapper').animate({
            opacity : 0
        }, text_fadeOutDelay);

        setCanvaHeight(minHeight);

        $('.gameFrame_heart').slice(3).remove();
        $(".gameFrame_heart").attr("src", "./resources/imgs/heartFull1.svg");
        
        round = 0;

        score = 0;
        combo = 0;
        maxCombo = 0;

        maxhearts = 3;
        hearts = 3;

        goalSize = 35;

        firstRoundDown = false;
        firstRoundUp = false;

        $(".gameFrame_score").text('SCORE : ' + score.toString());
        $(".gameFrame_combo").text('COMBO : ' + combo.toString());

        $(".gameFrame_winMsg").animate({
            opacity: 0
        }, text_fadeOutDelay);

        $(".gameFrame_winMsg_shadow").animate({
            opacity: 0
        }, text_fadeOutDelay);

        setTimeout(() => {
            gameover = false;
            gameReady = false;
            nextRound = true;
        }, Math.max(text_fadeOutDelay, goal_fadeInDelay));

        HErecovery = false;
        HErecovery_save(HErecovery);
    };

    function saveScore(){
        lastName = $('#player').val() == '' ? 'Player' : $('#player').val();
        scores.push([lastName, score, maxCombo]);
        scores.sort((a, b) => b[1] - a[1]);

        scores = scores.slice(0, 6);
        scores_save(scores);
    };

    $(".gameFrame_goBack").on("click", function(){
        saveScore();
        gameReset();
        goToMain();
    });

    $(".gameFrame_playAgain").on("click", function(){
        saveScore();
        gameReset();
        startParty(true);
    });

    // PAUSE

    var paused = false;

    $(document).on("click", '.gameFrame_pause, .pauseScreen_resume', function(){

        if(paused){
            $(".pauseScreen").css("display", 'none');
        }else{
            $(".pauseScreen").css("display", 'flex');
        };

        paused = !paused;
    });

    $(".pauseScreen_leave").on('click', function(){
        gameReset();
        goToMain();
        
        paused = false;
        gameReady = false;

        $(".gameFrame_gameGoal").css("opacity", "0");
        $('.pauseScreen').css('display', 'none');
    });

    // CANVA && PLAYER

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var isGrowing = false;
    var isUngrowing = false;

    var firstRoundDown = true;
    var firstRoundUp = true;

    const speed = 750;

    function setCanvaHeight(height) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = "#87cefa"; // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height - height);
    
        ctx.fillStyle = "#2F2F2F"; // Dark gray
        ctx.fillRect(0, canvas.height - height, canvas.width, height);
    };

    function growSquareAnimation(){
        if (!isGrowing) return;

        let add = (speed) / 120;

        if(height + add >= playerLimit + 15){
            releasePress();
            return;
        }else{
            height += add; 
        };

        setCanvaHeight(height);
        requestAnimationFrame(growSquareAnimation);
    };

    function unGrowSquareAnimation(){
        if (!isUngrowing) return;

        let substract = (2.5 * speed) / 120;

        if(height - substract <= minHeight){
            height = minHeight;
            
            isUngrowing = false;
            setCanvaHeight(height);
            return;
        }else{
            height -= substract;
        };

        setCanvaHeight(height);
        requestAnimationFrame(unGrowSquareAnimation);
    };

    // EVENT HANDLERS

    function mouseDownHandler(){
        isGrowing = true;
        isUngrowing = false;

        firstRoundDown = false;
        lastRoundPressed = round;

        growSquareAnimation();
    };

    function mouseUpHandler(){
        releasePress();
    };

    function releasePress(){
        isGrowing = false;
        isUngrowing = true;

        firstRoundUp = false;
        finalHeight = Math.floor(height);

        unGrowSquareAnimation();
        endOfRound();

        if(platform == "Mobile"){Haptics.impact({ style: ImpactStyle.Medium })};
    };

    if(!isMobile){
        $(".gameFrame").on("mousedown", function(e){
            if($(e.target).closest(".gameFrame_pause, .IOSbacker").length != 0 
                || paused 
                || !gameReady || gameover 
                || !firstRoundDown || !firstRoundUp
            ){return};
    
            mouseDownHandler();
        });
    
        $(".gameFrame").on("mouseup", function(e){
            $('.gameFrame_score').text(round.toString() + " : " + lastRoundPressed.toString());
            if($(e.target).closest(".gameFrame_pause, .IOSbacker").length != 0 
                || paused 
                || !gameReady || gameover 
                || !firstRoundUp || firstRoundDown
                || round != lastRoundPressed
            ){return};
    
            mouseUpHandler();
        });
    }else{
        $(".gameFrame").on("touchstart", function(e){
            if($(e.target).closest(".gameFrame_pause, .IOSbacker").length != 0 
                || paused 
                || !gameReady || gameover 
                || !firstRoundDown || !firstRoundUp
            ){return};
    
            mouseDownHandler();
        });
    
        $(".gameFrame").on("touchend", function(e){
            $('.gameFrame_score').text(round.toString() + " : " + lastRoundPressed.toString());
            if($(e.target).closest(".gameFrame_pause, .IOSbacker").length != 0 
                || paused 
                || !gameReady || gameover 
                || !firstRoundUp || firstRoundDown
                || round != lastRoundPressed
            ){return};
    
            mouseUpHandler();
        });
    };

    // SCORES

    $(".scoreFrame_leaveBtn").on("click", function(){
        goToMain();
    });

    function showScoreboard(){
        current_page = "scores";

        let step = 8;
        let scrollIntervall = setInterval(() => {
            if(Math.round(($("body").scrollTop()/$('.app').height()) * 100) >= 60){
                $('html').css('backgroundColor', "rgb(164 104 16)");
            };
            
            if($("body").scrollTop() >= 2*$(window).height()){
                clearInterval(scrollIntervall)
            };

            $("body").scrollTop($("body").scrollTop() + step);
        }, 1);

        $(".scoreFrame_columnText:not(.columnHeader)").remove();

        if(scores.length == 0){
            $('.scoreFrame_EmptyMsg').css("display", "inline-block");
        }else{
            $('.scoreFrame_EmptyMsg').css("display", "none");
            for(let i=0; i<scores.length; i++){
                $(".rank_col").append('<span class="scoreFrame_columnText">'+(i+1).toString()+'</span>');
                $(".name_col").append('<span class="scoreFrame_columnText">'+scores[i][0]+'</span>');
                $(".score_col").append('<span class="scoreFrame_columnText">'+scores[i][1]+'</span>');
                $(".combo_col").append('<span class="scoreFrame_columnText">'+scores[i][2]+'</span>');
            };
        };
    };

    // GRAPHIC UPDATE

    if(platform == "Web"){
        document.oncontextmenu = function(){
            return false;
        };
    };

    $(window).on('resize', function(){
        if(current_page == "landing"){
            $("body").scrollTop($(window).height());
        }if(current_page == "play"){
            $("body").scrollTop(0);
        }if(current_page == "scores"){
            $("body").scrollTop(2*$(window).height());
        };

        minHeight = Math.round((59 / $(".gameFrame").height()) * 100);
        if(!growIntervall && !unFillIntervall){
            $(".gameFrame").css("background", "linear-gradient(0deg, #2F2F2F 0%, #2F2F2F "+minHeight+"%"+", #87cefa "+minHeight+"%"+", #87cefa 100%)");
        };
    });
    
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', setVh);
    setVh();

    // KEYS

    $(document).on("keyup", function(e){
        if(e.which === 27){
            if(current_page == "play"){
                goBack(platform);
            }else{
                goBack(platform);
            };
        }else if(e.which === 32){
            $(".gameFrame").mouseup();
        };
    });
    
    $(document).on("keydown", function(e){
        if(e.which === 32){
            $(".gameFrame").mousedown();
        };
    });

    // START

    $("body").scrollTop($(window).height());
    setCanvaHeight(minHeight);

    if(HErecovery){
        current_page = "play";

        replay = true;
        gameReady = true;
        nextRound = false;

        gameover = HErecovery["gameover"];
        combo = HErecovery["combo"];
        maxCombo = HErecovery["maxCombo"];
        score = HErecovery["score"];

        $(".gameFrame_combo").text('COMBO : ' + combo.toString());
        $(".gameFrame_score").text('SCORE : ' + score.toString());

        hearts = !gameover ? HErecovery["hearts"] : 0;
        maxhearts = HErecovery["maxhearts"];

        goalRandomHeight = HErecovery["goalHeight"];
        goalSize = HErecovery["goalSize"];

        $("body").scrollTop(0);
        for(let i = 0; i < maxhearts - 3; i++){
            let additionalHeart = $('<img src="./resources/imgs/heartFull1.svg" class="gameFrame_heart" alt="">');
            $(additionalHeart).css({
                right: $('.gameFrame_heart').last().getStyleValue('right') + 30 + "px"
            });

            $('.gameFrame').append($(additionalHeart));
        };

        $(".gameFrame_heart").filter((id, _) => $(".gameFrame_heart").length - id > hearts).attr("src", "./resources/imgs/heartEmpty1.svg");

        if(gameover){
            gameOver(true);
        }else{
            goalSpawn(true);
        };

        startParty();
    };
};

//RUN
$(document).ready(function(){highEnough()})
