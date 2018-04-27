num_elemtos=8;
offset=90;
svg_canvas=undefined;
template=undefined
IMAGE_SIZE=110;
CIRCLE_CUT_WIDTH=120;
CIRCLE_CUT_HEIGHT=240
DEBUG=false;
topics=[]
files_clockwise=[
    ["devolvedgovernment","mayor2.png","Devolved Government"],
    ["eucomission","localauth3.png", "European Comission"],
    ["transportproviders","carriage.png", "Transport Providers"],
    ["ngo","occhio.png","NGO"],
    ["activist","activist2.png","Activists"],
    ["localgovernment","speaking2.png", "Local Government"],
    ["citizens","women.png", "Citizens"],
    ["centralgovernment","westiminister.png", "Central Government"],
    ["business","factory2.png", "Business"]
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



    d3.dsv(",", "carsdata.csv", function(d,i) {

         return {
             id:i,
           Action:  d.Action, // convert "Year" column to Date
           Action2: d.Action2,
           pow_original: d.POW_original,
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
            dataByPowByResponsible=d3.nest()

             .key(function(d) { return d.slugPow; } )
             .key(function(d) { return d.slugResponsible; } )
             .rollup(function(leaves) { return leaves.length; })
             .object(data);

            dataByTopic=d3.nest()
             .key(function(d) { return d.Topic; } )
             .object(data);
             topics=Object.keys(dataByTopic)
             topicsData=[]
             for(var i=0; i<topics.length; i++){
                 topics[i]=topics[i].split(';')[0]
                //topicsData.push([topics[i],true])
             }
              topics = topics.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
                })
                for(var i=0; i<topics.length; i++){
                   topicsData.push([topics[i],true])
                }
             buildFilters(topicsData);
       })
    $("#selectAll").on("click",function(event){
            for(var i=0; i<topicsData.length;i++){
                topicsData[i][1]=true
                $(".filter.btn").addClass("selected")
            }
    })
    $("#selectNone").on("click",function(event){
            for(var i=0; i<topicsData.length;i++){
                topicsData[i][1]=false
                $(".filter.btn").removeClass("selected")
            }
    })
} //end onload

function buildFilters(_topics){
    var filterContainer=d3.selectAll("#filters")
    var filterstopics= filterContainer.selectAll('a.filter.btn')
      .data(_topics)
      .enter()
      .append("a")
      .attr("class", "filter btn selected")
      .style("background", function(d, i) { console.log(d[0]); return colores( d[0].length %20)} )
      .html(function(d){return d[0]})
      .on("click", function(d, i) {
          console.log("asd" + d)
          if( d3.select(this).classed("selected")==true){
              d3.select(this).classed("selected",false)

              d[1]=false
          }
          else{
              d3.select(this).classed("selected",true)
               d[1]=true
          }
      })
}
function checkInFilters(s){
    for(var i=0; i<topicsData.length;i++){
        filter=topicsData[i]
            if(filter[1]==true){
                if(s.indexOf(filter[0]) != -1)  return true;
            }
    }
    return false;
}

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

function buildLinks(){
    var links=[]
    globalData.forEach(function(row){
        links.push({
           source: nodesBySlug[row.slugPow],
           target: nodesBySlug[row.slugResponsible],
           value: 0
       })
   });
}

function drawArrowFromTo(originNode){
    // {Action: "Funding for ULEVs: Plug In Car and Plug In Van Grant Schemes", Action2: "Transition to electric and low-emission vehicles", slugPow: "centralgovernment", POW: "Central Government", Responsible: "Central Government", …}
    if(dataByPow[originNode.slug]==undefined) return;
    var i=0;
    var countArrow=0;
    dataByPow[originNode.slug].forEach(function(datarow){ //recorro todos los
        //console.log(datarow)
        var targetNodeSlug=datarow.slugResponsible
        var targetNode=nodesBySlug[targetNodeSlug]
        if(targetNode==undefined)return;
        if(targetNodeSlug==originNode.slug) return
        var color=colores( datarow.Topic.length %20)
        if(checkInFilters( datarow.Topic) )
            countArrow++;
    });
     counter_target={}
    dataByPow[originNode.slug].forEach(function(datarow){ //recorro todos los
        //console.log(datarow)
        var targetNodeSlug=datarow.slugResponsible
        var targetNode=nodesBySlug[targetNodeSlug]
        if(targetNode==undefined)return;
        if(targetNodeSlug==originNode.slug) return
        var color=colores( datarow.Topic.length %20)
    //    console.log(originNode.slug)
    //    console.log(datarow.slugResponsible)
        var totalElements=dataByPowByResponsible[originNode.slug][datarow.slugResponsible]
        if(counter_target[datarow.slugResponsible]==undefined) counter_target[datarow.slugResponsible]=1;
        else counter_target[datarow.slugResponsible] +=1
        if(checkInFilters( datarow.Topic) )
        {
            canvasInsertArrow(originNode.x_inside,originNode.y_inside, targetNode.x_inside , targetNode.y_inside , color,originNode.slug, datarow.id,counter_target[datarow.slugResponsible],totalElements)
        }
        i++;
    //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
    })

}


function createCircle(_svg1,radius_w,radius_h,files){
    var num_elements= files.length;
    var j=0;
    var degrees_seperation= 360/(num_elements );
    svg_canvas=_svg1
    svg_g= _svg1.append("g").attr("transform", function(d){ return "translate (" + 80 + "," + 80 + ")" })

    nodes=[]
    files.forEach(function (el){
        var degrees=degrees_seperation*j
        nodes.push({
            slug:files_clockwise[j][0],
            data:files_clockwise[j],
            x: radius_w+radius_w * Math.cos( (degrees-offset) ),
            y: radius_h+radius_h * Math.sin( (degrees-offset) ),
            x_inside:   radius_w+(radius_w-100) * Math.cos( (degrees-offset) ),
            y_inside:   radius_h+(radius_h-100) * Math.sin( (degrees-offset) ),
            status: "normal",
            id:j
        })
        j++;
    })
    nodesBySlug={}
    nodes.forEach(function(d){
        nodesBySlug[d.slug]=d
    })

    var g_enter= svg_g.selectAll('g.nodeotro')
      .data(nodes)
      .enter()
      .append("g")
      .attr("fill","#ff0000")
      .attr('class',"nodeotro")
      .attr("align-baseline","middle")

      .attr("transform", function(d){ return "translate (" + d.x_inside + "," + d.y_inside + ")" })

        //.attr('x',function(d){return d.x} )
        //.attr('y',function(d){return d.y}  )
    if(DEBUG){
        g_enter.append("circle")
    .attr('cx',0)
    .attr('cy',0)
    .attr('r',4)
    .attr('fill',"#0f0")
    }

    var g_enter= svg_g.selectAll('g.node')
      .data(nodes)
      .enter()
      .append("g")
      .attr("fill","#ff0000")
      .attr('class',"node")
      .attr("align-baseline","middle")
      .attr("transform", function(d){ return "translate (" + d.x + "," + d.y + ")" })

      g_enter.attr("opacity",0).transition().duration(1000).delay(function(d,i){ return i*100}).attr("opacity",1);
        //.attr('x',function(d){return d.x} )
        //.attr('y',function(d){return d.y}  )

    var imageEnter=g_enter.append("image")
        .attr('xlink:href',function(d){return'img/'+d.data[1]})
        .attr('width',IMAGE_SIZE+'px')
        .attr('height',IMAGE_SIZE+'px')
        .attr('y',-IMAGE_SIZE/2+'px')
        .attr('x',-IMAGE_SIZE/2+'px')
        .attr("data-id",j)



        imageEnter.on("click", function(d, i) {
            var num=$(this).attr("data-id")
            d3.event.stopPropagation();
            if(d3.event.shiftKey==false){
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
            console.log(d)

            if(d.status=="normal"){
                d.status="mouseover"
                $(this).attr( "filter","url(#blurFilter2)")
            }

            if(dataByPow[d.slug]==undefined) return;
            dataByPow[d.slug].forEach(function(datarow){ //recorro todos los
                //insertArticle(text, title1, title2, icon1, icon2,class){
                //console.log(datarow)
                if(datarow.slugPow==datarow.slugResponsible)
                {
                    console.log("insert article " + datarow.slugPow )
                    var url=datarow.url
                    if(url!==undefined && url.length>6){}
                    else url=""
                    insertArticle(datarow.Action ,datarow.pow_original, datarow.POW, d.data[1], d.data[1],url, "mouseover")
                }
            //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
            })
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
        .attr("y", function(d) { return "74px"; })
        .text( function (d) { return  d.data[2]  } )
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black");
        if(DEBUG){
        g_enter.append("circle")
        .attr('cx',0)
        .attr('cy',0)
        .attr('r',4)
        .attr('fill',"#f00")
        }

    //canvasInsertArrow(100,100,150,250,"#ff00ff")

}

function canvasInsertArrow(x1,y1,x2,y2,color,id,datanumber,elementNumber,total){
    var lineGenerator = d3.line();
    //lineGenerator.curve(d3.curveCatmullRom.alpha(0.5));
    lineGenerator.curve(d3.curveNatural)
    //console.log(lineGenerator( [ [x1,y1],[x2,y2] ,[x2+100,y2+100] ] ));
     patharrow=svg_g.append('path')
    .attr('class',()=>  'arrow2 arrow-'+id )
    .attr("data-number",datanumber)
    .attr("fill", "none")
    //.attr('marker-end',function(d){ if(elementNumber==(total) ) return    "url(#arrow)"})
    .attr('pointer-events',"visibleStroke")
    .attr("d", function(d) {

         if(y1<y2) ctrlPointY= y1+Math.abs(y2-y1)/2
         else ctrlPointY= y2+Math.abs(y1-y2)/2
        if(x1<x2)  ctrlPointX= x1+Math.abs(x2-x1)/2
        else ctrlPointX= x2+Math.abs(x1-x2)/2
        //return "M" + x1 + "," + y1 + " C " + x1 + ctrlPoint1 + "," + y1 + " " + x1 + ctrlPoint2 + "," + y2 + ctrlPoint3 + " " + x2 + "," + y2;
        aaa= "M" + x1 + " " + y1 + " q " + (ctrlPointX-x1) +" "  + (ctrlPointY-y1) +" "  + (x2-x1) +" " + (y2-y1)
//console.log(aaa)
    if(y2>y1)
        return lineGenerator( [ [x1,y1],  [ (elementNumber*14- (total/2) * 14 ) + Math.abs(x1+x2)/2 , ( elementNumber* 14 - (total/2)*14 ) + Math.abs(y1+y2)/2], [x2,y2] ] )
    else
        return lineGenerator( [ [x1,y1],  [ -(elementNumber*14- (total/2) * 14 ) + Math.abs(x1+x2)/2 ,  + Math.abs(y1+y2)/2], [x2,y2] ] )
    })
    /*.attr('x1',x1)
    .attr('y1',y1)
    .attr('x2',x2)
    .attr('y2',y2)*/
    .style("stroke",color)
    var totalLength = patharrow.node().getTotalLength();
    patharrow.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);

    patharrow.on("click", function(d, i) {
        console.log("clickArrow")
        var num = d3.select(this).attr("data-number");
        datarow=globalData[num]
        var icon1=nodesBySlug[datarow.slugPow].data[1]
        //console.log(icon1)
        var icon2=nodesBySlug[datarow.slugResponsible].data[1]
        //console.log(icon2)
        d3.selectAll(".article.clicked").remove()
        var url=datarow.url
        if(url!==undefined && url.length>6){}
        else url=""
        insertArticle(datarow.Action ,datarow.pow_original, datarow.Responsible, icon1,icon2,url,"clicked")

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

/*function replaceArrow(){
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
}*/

function insertArticle(text,title1, title2, icon1, icon2, url, extraclass){
    var context = {"body": text, "src_title" :title1, "dst_title": title2, "src_image": icon1 , "dst_image": icon2, "colorArrow":"#000","link":url,"extraclass":extraclass };
    var html    = template(context);
    aa=$('#description').append(html)
    var hh= $("#description .article ").first().find(".text-container").height()
    $("#description .article ").first().find(".image-line").css("height",hh+"px")


}
