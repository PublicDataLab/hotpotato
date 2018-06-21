var currentSlide=1;
fakeShift=false
fakeAlt=false;

function startDemo(){
    currentSlide=1;

    $("#demo-layer").show();
    $(".demo-content").hide();
    $("#demo-content-1").fadeIn();

}

function stop(){

    $("#demo-layer").fadeOut();
    $(".demo-content").hide();
}

function nextSlide(){
    currentSlide++;
    if(currentSlide>8) currentSlide=0

    $(".demo-content").hide();
    $("#demo-content-"+currentSlide).fadeIn();
    actionsInDemo()
    console.log(currentSlide)
}

function prevSlide(){
    currentSlide--;

    $(".demo-content").fadeOut();
    $("#demo-content-"+currentSlide).fadeIn();
}

function actionsInDemo(){

    if(currentSlide==3){
        console.log("current slide 3")
        var element=d3.select("image#slug-centralgovernment").dispatch("mouseover")

    }
    if(currentSlide==4){
        d3.select("image#slug-centralgovernment").dispatch("mouseleave")
        d3.select("image#slug-devolvedgovernment").dispatch("click")

        //var element=$("image#slug-devolvedgovernment").click();
    }

    if(currentSlide==5){
        d3.select("image#slug-devolvedgovernment").dispatch("click")
        d3.select("image#slug-centralgovernment").dispatch("click")
        fakeShift=true
        d3.select("image#slug-business").dispatch("click")
        fakeShift=false
    }
    if(currentSlide==6){
        d3.select("image#slug-devolvedgovernment").dispatch("click")
        fakeAlt=true
        d3.select("image#slug-centralgovernment").dispatch("click")
        fakeAlt=false
    }

    if(currentSlide==7){
        d3.select("image#slug-devolvedgovernment").dispatch("click")
        fakeShift=true
        d3.select("image#slug-business").dispatch("click")
        d3.select("image#slug-ngo").dispatch("click")
        fakeShift=false
    }
    if(currentSlide==8){
        d3.select("path.arrow-target-devolvedgovernment").dispatch("click")
    }
}
