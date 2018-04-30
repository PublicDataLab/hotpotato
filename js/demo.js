var currentSlide=1;
fakeShift=false

function startDemo(){
    currentSlide=1;
    console.log("startdemo")
    $("#demo-layer").show();
    $(".demo-content").hide();
    $("#demo-content-1").fadeIn();

}

function stop(){
    console.log("startdemo")
    $("#demo-layer").fadeOut();
    $(".demo-content").hide();
}

function nextSlide(){
    currentSlide++;
    if(currentSlide>=9) currentSlide=0
    console.log("next" +currentSlide)
    $(".demo-content").hide();
    $("#demo-content-"+currentSlide).fadeIn();
    actionsInDemo("next")
}

function prevSlide(){
    currentSlide--;
    console.log("prev")
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
        d3.select(".arrow-devolvedgovernment").dispatch("click")
    }
    if(currentSlide==6){
        d3.select("image#slug-devolvedgovernment").dispatch("click")
        fakeShift=true
        d3.select("image#slug-business").dispatch("click")
        fakeShift=false
    }
    if(currentSlide==7){

    }

    if(currentSlide==8){

    }
}
