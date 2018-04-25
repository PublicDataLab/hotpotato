num_elemtos=8;
offset=90;
svg_canvas=undefined;
template=undefined
IMAGE_SIZE=80;
CIRCLE_CUT_WIDTH=80;
CIRCLE_CUT_HEIGHT=200
topics=[]
files_clockwise=[
    ["devolvedgovernment","mayor2.png"],
    ["eucomission","localauth3.png"],
    ["transportproviders","carriage.png"],
    ["ngo","occhio.png"],
    ["activist","activist2.png"],
    ["localgovernment","speaking2.png"],
    ["citizens","women.png"],
    ["centralgovernment","westiminister.png"],
    ["business","factory2.png"]
]

links=
    {
        0:{
        link:[2,3]
    },
    3:{
        link:[5,8]
    }
}

window.onload = function() {
    w_width=$( window ).width();
    w_height=$( window ).height();
    w=$('#elements').width();
    var source   = document.getElementById("article-template").innerHTML;
    template = Handlebars.compile(source);
    h=w_height-50
    colores=d3.scaleOrdinal(d3.schemeCategory20);
    $('#canvas').css('width',w+'px')
    $('#canvas').css('height',w_height+'px')
    $('#canvas').css('margin-left',CIRCLE_CUT_WIDTH/2+'px')
    svg = d3.select("#canvas");
    createCircle(svg,(w-CIRCLE_CUT_WIDTH*2)/2,(h-CIRCLE_CUT_HEIGHT)/2,files_clockwise)

    replaceArrow();

    d3.dsv("\t", "carsdata.tsv", function(d,i) {

         return {
             id:i,
           Action:  d.Action, // convert "Year" column to Date
           Action2: d.Action2,
           slugPow: string2Slug(d.POW),
           POW:     d.POW,
           Responsible: d.Responsible,
           slugResponsible: string2Slug(d.Responsible),
           Relationship: d.Relationship,
           Topic: d.Topic,
           url: d["Source URL"]
         };
       }).then(function(data) {
           globalData=data
           dataByPow=d3.nest()
            .key(function(d) { return d.slugPow; } )
            .object(data);
            dataByTopic=d3.nest()
             .key(function(d) { return d.Topic; } )
             .object(data);
             topics=Object.keys(dataByTopic)
       })

} //end onload

function string2Slug(s){
    if(s==undefined) return ""
    //console.log(s)
    s=s.trim()
    s=s.replace(/ /g,'')
    s=s.toLowerCase()
    //if(s.indexOf("Central Government")>=0) return "centralgovernment"
    //if(s.indexOf("Local Government")>=0) return "localgovernment"
    if(s.indexOf("greaterlondonauthority")>=0) return "localgovernment"
    if(s.indexOf("taxisandprivate")>=0) return "transportproviders"
    return s
}

function drawArrowFromTo(originNode){
    // {Action: "Funding for ULEVs: Plug In Car and Plug In Van Grant Schemes", Action2: "Transition to electric and low-emission vehicles", slugPow: "centralgovernment", POW: "Central Government", Responsible: "Central Government", …}
    if(dataByPow[originNode.slug]==undefined) return;
    var i=0;
    dataByPow[originNode.slug].forEach(function(datarow){ //recorro todos los
        //console.log(datarow)
        var targetNodeSlug=datarow.slugResponsible
        var targetNode=nodesBySlug[targetNodeSlug]
        if(targetNode==undefined)return;
        if(targetNodeSlug==originNode.slug) return
        var color=colores( datarow.Topic.length %20)
        canvasInsertArrow(originNode.x+40+i*2,originNode.y+40+i*2, targetNode.x+40+i*2 , targetNode.y+40+i*2 , color,originNode.slug, datarow.id)
        i++;
    //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
    })

}


function createCircle(_svg1,radius_w,radius_h,files){
    var num_elements= files.length;
    var j=0;
    var degrees_seperation= 360/(num_elements );
    svg_canvas=_svg1
    nodes=[]
    files.forEach(function (el){
        var degrees=degrees_seperation*j
        nodes.push({
            slug:files_clockwise[j][0],
            data:files_clockwise[j],
            x: radius_w+radius_w * Math.cos( (degrees-offset) ),
            y: radius_h+radius_h * Math.sin( (degrees-offset) ),
            status: "normal",
            id:j
        })
        j++;
    })
    nodesBySlug={}
    nodes.forEach(function(d){
        nodesBySlug[d.slug]=d
    })



    var g_enter= _svg1.selectAll('g.node')
      .data(nodes)
      .enter()
      .append("g")
      .attr("fill","#ff0000")
      .attr('class',"node")
      .attr("transform", function(d){ return "translate (" + d.x + "," + d.y + ")" })

        //.attr('x',function(d){return d.x} )
        //.attr('y',function(d){return d.y}  )
    g_enter.append("image")
        .attr('xlink:href',function(d){return'img/'+d.data[1]})
        .attr('width',IMAGE_SIZE+'px')
        .attr('height',IMAGE_SIZE+'px')
        .attr("data-id",j)
        .on("click", function(d, i) {
            var num=$(this).attr("data-id")
            event.stopPropagation();
            if(event.shiftKey==false){
                _svg1.selectAll(".arrow2").remove();
                _svg1.selectAll("g.node")
                .attr( "filter","")
                .each(function(otrosD, i) {
                    if(d!=otrosD)
                    otrosD.status="normal"
                })

                //TODO remove other selections
            }
            if(d.status=="clicked"){
                _svg1.selectAll(".arrow-"+d.data[0]).remove()
                d.status="normal"
                $(this).parent().attr( "filter","")
            }
            else{
                d.status="clicked"
                $(this).parent().attr( "filter","url(#sepiatone)")
                // add articles
                //insertArticle("tirri <br/> tirrii 2" ,d.data[0], "otro", d.data[1], d.data[1])
                //draw links
                //console.log(event.altKey)
                /*if(links[d.id]!=undefined){
                    links[d.id].link.forEach(function(destid){
                            console.log(event.altKey)
                            canvasInsertArrow(d.x +40,d.y+40, nodes[destid].x +40 ,nodes[destid].y+40,"#ff00ff",d.data[0])
                    })
                }*/
                console.log(d)
                drawArrowFromTo(d)
            }
            //$(this).attr("data-status","clicked")

        })
        .on("mouseover", function(d, i) {
            var num=$(this).attr("data-id")
            //add article
            //TODO estoy metiendo los articulos al hacer mouseover
            if(dataByPow[d.slug]==undefined) return;
            dataByPow[d.slug].forEach(function(datarow){ //recorro todos los
                //insertArticle(text, title1, title2, icon1, icon2,class){
                //console.log(datarow)
                if(datarow.slugPow==datarow.slugResponsible)
                {
                    console.log("insert article " + datarow.slugPow )
                    insertArticle(datarow.Action ,datarow.POW, datarow.POW, d.data[1], d.data[1],"mouseover")
                }
            //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
            })

            if(d.status=="normal"){
                d.status="mouseover"
                $(this).attr( "filter","url(#blurFilter2)")
            }
        })
        .on("mouseout", function(d, i) {
            var num=$(this).attr("data-id")
            //<console.log(files_clockwise[num])
                if(d.status=="mouseover"){
                    d.status="normal"
                    $(this).attr( "filter","")
                    $(this).attr("data-status","")
                }
                d3.selectAll(".article.mouseover").remove()
        })

        g_enter.append("text")
        .attr("x", function(d) { return d.cx; })
        .attr("y", function(d) { return "90px"; })
        .text( function (d) { return  d.data[0]  } )
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("fill", "black");


    //canvasInsertArrow(100,100,150,250,"#ff00ff")

}

function canvasInsertArrow(x1,y1,x2,y2,color,id,datanumber){
    svg_canvas.append('line')
    .attr('class',()=>  'arrow2 arrow-'+id )
    .attr("data-number",datanumber)
    .attr('marker-end',"url(#arrow)")
    .attr('x1',x1)
    .attr('y1',y1)
    .attr('x2',x2)
    .attr('y2',y2)
    .style("stroke",color)
    .on("click", function(d, i) {
        console.log("clickArrow")
        var num = d3.select(this).attr("data-number");
        datarow=globalData[num]
        var icon1=nodesBySlug[datarow.slugPow].data[1]
        console.log(icon1)
        var icon2=nodesBySlug[datarow.slugResponsible].data[1]
        console.log(icon2)
        insertArticle(datarow.Action ,datarow.POW, datarow.Responsible, icon1,icon2,"clicked")

    })
    .on("mouseover", function(d, i) {
        console.log( $(this) )
        d3.select(this).classed("mouseover",true)
    })
    .on("mouseout", function(d, i) {
        console.log( $(this) )
        d3.select(this).classed("mouseover",false)
    })
}

function replaceArrow(){
    $(".arrow").each(function(index){
        c=$(this).data("color")
        $(this).append( insertArrow(144,c) )
    })
}

function insertArrow(h,color){
    return '<svg width="9px" height="144px" viewBox="0 0 9 144" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
        <!-- Generator: Sketch 43.2 (39069) - http://www.bohemiancoding.com/sketch -->\
        <title>Group</title>\
        <defs></defs>\
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
            <g id="Group">\
                <path d="M4.5,0.5 L4.5,135.592561" id="Line" stroke="'+color+'" stroke-linecap="square"></path>\
                <polygon id="Triangle" fill="'+color+'" transform="translate(4.500000, 137.500000) rotate(180.000000) translate(-4.500000, -137.500000) " points="4.5 131 9 144 0 144"></polygon>\
            </g>\
        </g>\
    </svg>'
}

function insertArticle(text,title1, title2, icon1, icon2, extraclass){
    var context = {"body": text, "src_title" :title1, "dst_title": title2, "src_image": icon1 , "dst_image": icon2, "colorArrow":"#ff0000","extraclass":extraclass };
    var html    = template(context);
    $('#description').append(html)

}
