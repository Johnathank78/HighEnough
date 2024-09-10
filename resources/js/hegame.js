function highEnough(){

    // INIT

    const winMsg = ["MAJESTIC", "PERFECT", "GOOD", "NICE", "COOL"]
    const looseMsg = ["F*CK", "OUCH", "TOO BAD", "CRAP", "NEXT TIME"]

    const platform = "Web"
    var current_page = "landing"

    function setFullHeight() {
        let viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${viewportHeight}px`);
    }
    
    window.addEventListener('load', setFullHeight);
    window.addEventListener('resize', setFullHeight);

    var scores = scores_read()

    // GET DATA
    
    function scores_read(){
        let data = localStorage.getItem("scores")

        if (data === null || data == ""){
            scores_save([])
            return []
        }else{ 
            data = JSON.parse(data)
            return data
        }
    }

    function scores_save(data){
        localStorage.setItem("scores", JSON.stringify(data))
        return
    }

    async function phoneINIT(){
        window.screen.orientation.lock('portrait');
        await StatusBar.setOverlaysWebView({ overlay : true })

        setTimeout(() => {
            StatusBar.hide({ animation : 'SLIDE'});
        }, 2500);


        let isHiding = false

        setInterval(async () => {
            let data = await StatusBar.getInfo()

            if(data.visible && !isHiding){
                isHiding = true
                setTimeout(async () => {
                    await StatusBar.hide({ animation : 'SLIDE'});
                    isHiding = false
                }, 2500);
            }

        }, 100);
    }
    
    if(platform == "Mobile"){
        phoneINIT()
    }
    
    $("body").scrollTop($(window).height())
    $(".gameFrame").css("background", "linear-gradient(0deg, #2F2F2F 0%, #2F2F2F "+7+"%, #87cefa "+7+"%, #87cefa 100%)")
    
    // UTILITY
    
    function zoom(target, vec, zoomStrength, zoomSpeed, zoomCenter=[0.5, 0.5], callback=false){
        
        let HWRatio = $(target).height()/$(target).width()
        
        let zoomStrengthWH = [zoomStrength, zoomStrength*HWRatio]
        let zoomOffset = [(zoomStrengthWH[0]/2), (zoomStrengthWH[1]/2)]
        
        let tZoomCenter = []
        
        for(let i=0; i < zoomCenter.length; i++){
            if(zoomCenter[i] < 0.5){
                tZoomCenter[i] = 1 - zoomCenter[i]
            }else{
                tZoomCenter[i] = 0.5 + zoomCenter[i]
            }
        }

        $(target).animate({
            width: "+="+vec*zoomStrengthWH[0]+"px",
            height: "+="+vec*zoomStrengthWH[1]+"px",
            left: "+="+(-vec)*zoomOffset[0]*tZoomCenter[0]+"px",
            top: "+="+(-vec)*zoomOffset[1]*tZoomCenter[1]+"px",
        }, zoomSpeed, function(){
            if(callback){callback()}
        })
    }

    function tilt(target, strenght, speed, center, tiltPause, midCallback=false, endCallBack=false){
        zoom(target, 1, strenght, speed/2, center, function(){
            if(midCallback){midCallback()}
            setTimeout(() => {
                if(endCallBack){
                    zoom(target, -1, strenght, speed/3, center, endCallBack)
                }else{
                    zoom(target, -1, strenght, speed/3, center)
                }
            }, tiltPause);
        })
        
    }

    // FIX

    if(platform == "Web"){
        document.oncontextmenu = function(){
            return false
        }
    }

    $(window).on('resize', function(){
        if(current_page == "landing"){
            $("body").scrollTop($(window).height())
        }if(current_page == "game"){
            $("body").scrollTop(0)
        }if(current_page == "scores"){
            $("body").scrollTop(2*$(window).height())
        }
    })

    // BTN

    $(".mainFrame_btn").on("click", function(e){
        if($(this).hasClass("play")){
            startParty()
        }else if($(this).hasClass("scores")){
            showScoreboard()
        }
    })

    // GAME

    var goal_fadeInDelay = 250
    var goal_fadeOutDelay = 150

    var text_fadeInDelay = 500
    var text_fadeOutDelay = 350
    var text_fadePauseDelay = 650

    var gameReady = false
    var nextRound = true
    var gameover = false

    var combo = 0
    var round = 0
    var score = 0
    var hearts = 3
    
    var gameIntervall = false

    function getGoalPos(){
        let allZone = 0.5 * $(window).height()
        let deadZone = allZone * 0.3
        let safeZone = allZone - deadZone

        let randomVal = [Math.random(0, 1)*deadZone, deadZone + Math.random(0, 1)*safeZone, deadZone + Math.random(0, 1)*safeZone, deadZone + Math.random(0, 1)*safeZone, deadZone + Math.random(0, 1)*safeZone]
        let randomInd = Math.round(Math.random(0, 1)*(randomVal.length - 1))

        return 125 + randomVal[randomInd]
    }
        
    function startParty(replay=false){
        current_page = "play"

        if(gameIntervall){clearInterval(gameIntervall); gameIntervall = false}

        if(!replay){
            let step = 8
            let scrollIntervall = setInterval(() => {
                if($("body").scrollTop() <= 0){gameStart(); clearInterval(scrollIntervall)}
                $("body").scrollTop($("body").scrollTop() - step)
            }, 1);
        }

        gameIntervall = setInterval(() => {

            if(gameReady && nextRound && !gameover){

                round += 1
                nextRound = false
                isAnimationOver = true
                hasBeenReleased = false
                
                let randomHeight = getGoalPos()

                $(".gameFrame_gameGoal").css('top', randomHeight + "px")
                $(".gameFrame_gameGoal").animate({
                    opacity: 1
                }, goal_fadeInDelay)

            }
        }, 1);
    }

    function gameStart(){
        current_page = "play"
        gameReady = true

        $(".gameFrame_gameGoal").css("display", "flex")
    }

    function endOfRound(){

        // CALCULATE BOUNDS
        let barTop = finalHeight
        let goalUpperBound = $(".gameFrame_gameGoal").offset().top
        let goalLowerBound = goalUpperBound + $(".gameFrame_gameGoal").height()

        $(".gameFrame_gameGoal").animate({
            opacity: 0
        }, goal_fadeOutDelay)

        let won = false
        let randomWord = false

        let target = false
        let target_shadow = false

        if(barTop >= goalUpperBound && barTop <= goalLowerBound){
            won = true
            combo += 1

            target = $(".gameFrame_winMsg, .gameFrame_scoreMsg")
            target_shadow = $(".gameFrame_winMsg_shadow, .gameFrame_scoreMsg_shadow")

            randomWord = winMsg[Math.round(Math.random(0, 1)*(winMsg.length - 1))]

            if(combo == 5){
                combo = 0
                if(hearts < 3){
                    tilt($($(".gameFrame_heart")[hearts]), 15, 1225, [0.5, 1], 100, function(){
                        $($(".gameFrame_heart")[hearts]).attr("src", "./resources/imgs/heartFull1.svg")
                        hearts += 1
                    })

                    $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text("COMBO x5")
                    $('.gameFrame_scoreMsg_shadow, .gameFrame_scoreMsg').html('+<img src="./resources/imgs/heartFull1.svg" class="gameFrame_heartText" alt="">')
                }
            }

            if(hearts == 3 || combo != 0){
                $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text(randomWord)
                $('.gameFrame_scoreMsg_shadow, .gameFrame_scoreMsg').html("+1")
            }

            score += 1 
            $(".gameFrame_score").text('SCORE : ' + score.toString())

            if(score%10 == 0 && $(".gameFrame_gameGoal").height() > 10){
                $(".gameFrame_gameGoal").css("height", ($(".gameFrame_gameGoal").height() - 2.5) + "px")
            }

        }else{
            combo = 0
            target = $(".gameFrame_winMsg")
            target_shadow = $(".gameFrame_winMsg_shadow")

            randomWord = looseMsg[Math.round(Math.random(0, 1)*(looseMsg.length - 1))]
            $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text(randomWord)

            tilt($($(".gameFrame_heart")[hearts - 1]), 15, 1225, [0.5, 1], 100, function(){
                $($(".gameFrame_heart")[hearts - 1]).attr("src", "./resources/imgs/heartEmpty1.svg")
                hearts -= 1
            })

            if(hearts == 1){
                setTimeout(() => {
                    clearInterval(gameIntervall)
                    gameIntervall = false
                    gameOver()
                    return
                }, 250);
            }
        }

        if(!(hearts == 1 && !won) && hearts >= 1){
            $(target).animate({
                opacity: 1
            }, text_fadeInDelay, function(){
                setTimeout(() => {                    
                    $(target).animate({
                        opacity: 0
                    }, text_fadeOutDelay)
                }, text_fadePauseDelay);
            })
    
            $(target_shadow).animate({
                opacity: .3
            }, text_fadeInDelay, function(){
                setTimeout(() => {
                    $(target_shadow).animate({
                        opacity: 0
                    }, text_fadeOutDelay)
                }, text_fadePauseDelay);
            })
            
            setTimeout(() => {
                nextRound = true
            }, text_fadeInDelay + text_fadePauseDelay + text_fadeOutDelay);
        }

    }

    $('.gameFrame').on("dropped", function(){
        endOfRound()
    })

    function gameOver(){
        gameover = true
        nextRound = false

        $('.gameFrame_gameOverWrapper').animate({
            opacity : 1
        }, text_fadeInDelay, function(){
            $('.gameFrame_gameOverWrapper').css('pointer-events', 'all')
        })
        
        $(".gameFrame_winMsg_shadow, .gameFrame_winMsg").text("GAME OVER !")
        $(".gameFrame_winMsg").animate({
            opacity: 1
        }, text_fadeInDelay)
        
        $(".gameFrame_winMsg_shadow").animate({
            opacity: .3
        }, text_fadeInDelay)
    }

    function gameReset(){
        $('.gameFrame_gameOverWrapper').css('pointer-events', 'none')
        
        $('.gameFrame_gameOverWrapper').animate({
            opacity : 0
        }, text_fadeOutDelay)

        $(".gameFrame_gameGoal").css("height", "30px")

        hearts = 3
        
        round = 0
        score = 0
        combo = 0

        isAnimationOver = false
        hasBeenReleased = true
        lastRoundPressed = 0

        $(".gameFrame_score").text('SCORE : ' + score.toString())

        $(".gameFrame_winMsg").animate({
            opacity: 0
        }, text_fadeOutDelay, function(){
        })

        $(".gameFrame_winMsg_shadow").animate({
            opacity: 0
        }, text_fadeOutDelay)

        setTimeout(() => {
            gameover = false
            nextRound = true
        }, Math.max(text_fadeOutDelay, goal_fadeInDelay));

        $(".gameFrame_heart").attr("src", "./resources/imgs/heartFull1.svg")
    }

    function saveScore(){
        scores.push([$('#player').val(), score])
        scores.sort((a, b) => b[1] - a[1]);

        scores = scores.slice(0, 6)
        scores_save(scores)
    }

    $(".gameFrame_goBack").on("click", function(){
        saveScore()
        gameReset()
        goToMain()
    })

    $(".gameFrame_playAgain").on("click", function(){
        saveScore()
        gameReset()
        startParty(true)
    })

    // MECHANIC

    var paused = false

    $(document).on("click", '.gameFrame_pause, .pauseScreen_resume', function(){

        if(paused){
            $(".pauseScreen").css("display", 'none')
        }else{
            $(".pauseScreen").css("display", 'flex')
        }

        paused = !paused
    })

    $(".pauseScreen_leave").on('click', function(){
        gameReset()
        goToMain()
        
        paused = false
        gameReady = false

        $(".gameFrame_gameGoal").css("opacity", "0")
        $('.pauseScreen').css('display', 'none')
    })

    var isAnimationOver = false
    var hasBeenReleased = false

    var growIntervall = false
    var unFillIntervall = false
    
    var height = 7
    var speed = 1000

    var lastRoundPressed = round
    
    $(document).on("mousedown touchstart", function(e){
        if($(e.target).closest(".gameFrame_pause").length != 0 || paused || !isAnimationOver || !gameReady || gameover){return}

        if(unFillIntervall){
            clearInterval(unFillIntervall)
            unFillIntervall = false
        }
        
        isAnimationOver = false
        hasBeenReleased = false
        lastRoundPressed = round

        let step = (100/speed)*3
        
        growIntervall = setInterval(() => {
            if($(".gameFrame").height() - (height/100) * $(".gameFrame").height() < $(".gameFrame_gameGoal").offset().top - 30){
                releasePress($(".gameFrame")[0])
                return
            }else{
                height += step
                $(".gameFrame").css("background", "linear-gradient(0deg, #2F2F2F 0%, #2F2F2F "+height+"%, #87cefa "+height+"%, #87cefa 100%)")
            }
        }, 1)
    })

    $(document).on("mouseup touchend", function(e){
        if($(e.target).closest(".gameFrame_pause").length != 0 || paused || lastRoundPressed != round || hasBeenReleased || !gameReady || gameover || isAnimationOver){return}
        
        releasePress($(".gameFrame")[0])
    })

    var finalHeight = 0
    function releasePress(item){

        hasBeenReleased = true

        finalHeight = $(".gameFrame").height() - (height/100) * $(".gameFrame").height()
        let step = (100/speed)*8

        unFillIntervall = setInterval(() => {
            if(height < 7){
                $(".gameFrame").css("background", "linear-gradient(0deg, #2F2F2F 0%, #2F2F2F "+"7%"+", #87cefa "+"7%"+", #87cefa 100%)")
                clearInterval(unFillIntervall)
                unFillIntervall = false
            }else{
                height -= step
                $(".gameFrame").css("background", "linear-gradient(0deg, #2F2F2F 0%, #2F2F2F "+height+"%, #87cefa "+height+"%, #87cefa 100%)")
            }
        }, 1);

        let event = new CustomEvent('dropped', { bubbles: true })
        item.dispatchEvent(event)

        if(platform == "Mobile"){Haptics.impact({ style: ImpactStyle.Medium })}

        clearInterval(growIntervall)
        growIntervall = false
    }

    function goToMain(){

        if(current_page == "scores"){
            let step = 8
            let scrollIntervall = setInterval(() => {
                if($("body").scrollTop() <= $(window).height()){
                    $("body").scrollTop($(window).height())
                    clearInterval(scrollIntervall)
                }else{
                    $("body").scrollTop($("body").scrollTop() - step)                  
                }
            }, 1);

        }else if(current_page == "play"){
            let step = 8
            let scrollIntervall = setInterval(() => {
                if($("body").scrollTop() >= $(window).height()){
                    $("body").scrollTop($(window).height())
                    clearInterval(scrollIntervall)
                }else{
                    $("body").scrollTop($("body").scrollTop() + step)
                }
            }, 1);
        }

        current_page = "landing"
    }   

    // SCORES

    $(".scoreFrame_leaveBtn").on("click", function(){
        goToMain()
    })

    function showScoreboard(){
        current_page = "scores"

        let step = 8
        let scrollIntervall = setInterval(() => {
            if($("body").scrollTop() >= 2*$(window).height()){
                clearInterval(scrollIntervall)
            }
            $("body").scrollTop($("body").scrollTop() + step)
        }, 1);

        $(".rank_col, .name_col, .score_col").find(".scoreFrame_columnText").remove()

        let data = scores

        if(scores.length == 0){
            $('.scoreFrame_EmptyMsg').css("display", "inline-block")
        }else{
            $('.scoreFrame_EmptyMsg').css("display", "none")
            for(let i=0; i<data.length; i++){
                $(".rank_col").append('<span class="scoreFrame_columnText">'+(i+1).toString()+'</span>')
                $(".name_col").append('<span class="scoreFrame_columnText">'+data[i][0]+'</span>')
                $(".score_col").append('<span class="scoreFrame_columnText">'+data[i][1]+'</span>')
            } 
        }   
    }

    if(platform == "Mobile"){
        App.addListener('backButton', () => {
            if(current_page == "scores"){
                $(".scoreFrame_leaveBtn").click()
            }else if(current_page == "play"){
                if(gameover){
                    $('.gameFrame_goBack').click()
                }else{
                    $('.gameFrame_pause').click()
                }
            }else if(current_page == "landing"){
                App.exitApp();
            }
        }); 
    }
}


//RUN
$(document).ready(function(){highEnough()})