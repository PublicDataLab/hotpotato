num_elemtos=8;
offset=90;
svg_canvas=undefined;
template=undefined
IMAGE_SIZE=90;
CIRCLE_CUT_WIDTH=120;
CIRCLE_CUT_HEIGHT=160
DEBUG=false;
topics=[]
files_clockwise=[
    ["devolvedgovernment","mayor2.png","Devolved Government"],
    ["eucomission","localauth3.png", "European Commission"],
    ["localgovernment","speaking2.png", "Local Government"],
    ["ngo","occhio.png","NGO"],
    ["activist","activist2.png","Activists"],
    ["transportproviders","carriage.png", "Transport Providers"],
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
    h=w_height-150
    colores=d3.scaleOrdinal(d3.schemeCategory20);
    $('#canvas').css('width',w+'px')
    $('#canvas').css('height',h+'px')
    $('#canvas').css('margin-left',CIRCLE_CUT_WIDTH/2+'px')
    svg = d3.select("#canvas");
    createCircle(svg,(w-CIRCLE_CUT_WIDTH*2)/2,(h-CIRCLE_CUT_HEIGHT)/2,files_clockwise)

    $('#demo-btn').on("click",        function(event){  event.stopPropagation(); startDemo()}    )
    $('#next').on("click",        function(event){  event.stopPropagation(); nextSlide()}    )
    $('#prev').on("click",        function(event){  event.stopPropagation(); prevSide()}    )
    $('#stop').on("click",        function(event){  event.stopPropagation(); stop()}    )
    $('#demo-layer').on("click",        function(event){  event.stopPropagation(); stop()}    )


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

            dataByPowByResponsibleCounter=d3.nest()
             .key(function(d) { return d.slugPow; } )
             .key(function(d) { return d.slugResponsible; } )
             .rollup(function(leaves) { return leaves.length; })
             .object(data);

             dataByPowByResponsible=d3.nest()
              .key(function(d) { return d.slugPow; } )
              .key(function(d) { return d.slugResponsible; } )
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
      .style("background", function(d, i) {  return colores( d[0].length %20)} )
      .html(function(d){return d[0]})
      .on("click", function(d, i) {

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

function drawArrowFrom(originNode){
    // {Action: "Funding for ULEVs: Plug In Car and Plug In Van Grant Schemes", Action2: "Transition to electric and low-emission vehicles", slugPow: "centralgovernment", POW: "Central Government", Responsible: "Central Government", …}
    if(dataByPow[originNode.slug]==undefined) return;
    //var i=0;
/*      var countArrow=0;
        dataByPow[originNode.slug].forEach(function(datarow){ //recorro todos los
        //console.log(datarow)
        var targetNodeSlug=datarow.slugResponsible
        var targetNode=nodesBySlug[targetNodeSlug]
        if(targetNode==undefined)return;
        if(targetNodeSlug==originNode.slug) return
        var color=colores( datarow.Topic.length %20)
        if(checkInFilters( datarow.Topic) )
            countArrow++;
    });*/
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
        var totalElements=dataByPowByResponsibleCounter[originNode.slug][datarow.slugResponsible]

        if(counter_target[datarow.slugResponsible]==undefined) counter_target[datarow.slugResponsible]=1;
        else counter_target[datarow.slugResponsible] +=1

        if(checkInFilters( datarow.Topic) )
        {
            canvasInsertArrow(originNode.x_inside,originNode.y_inside, targetNode.x_inside , targetNode.y_inside , color,originNode.slug, datarow.slugResponsible, datarow.id, counter_target[datarow.slugResponsible],totalElements)
        }
        //i++;
    //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
    })
}

function drawArrowFromTo(originNode,targetNode,recursive){
    recursive = typeof recursive !== 'undefined' ? recursive : true;
    if(recursive) drawArrowFromTo(targetNode,originNode,false)

    console.log(dataByPowByResponsible[originNode.slug])

    // {Action: "Funding for ULEVs: Plug In Car and Plug In Van Grant Schemes", Action2: "Transition to electric and low-emission vehicles", slugPow: "centralgovernment", POW: "Central Government", Responsible: "Central Government", …}
    if(dataByPowByResponsible[originNode.slug]==undefined) return;
    if(dataByPowByResponsible[originNode.slug][targetNode.slug]==undefined) return;
    console.log(dataByPowByResponsible[originNode.slug][targetNode.slug])
    counter_target={}
    dataByPowByResponsible[originNode.slug][targetNode.slug].forEach(function(datarow){ //recorro todos los
        var color=colores( datarow.Topic.length %20)
        var totalElements=dataByPowByResponsible[originNode.slug][datarow.slugResponsible].length
        if(counter_target[datarow.slugResponsible]==undefined) counter_target[datarow.slugResponsible]=1;
        else counter_target[datarow.slugResponsible] +=1
        console.log(counter_target)
        if(checkInFilters( datarow.Topic) )
        {
            canvasInsertArrow(originNode.x_inside,originNode.y_inside, targetNode.x_inside , targetNode.y_inside , color,originNode.slug, datarow.slugResponsible, datarow.id,counter_target[datarow.slugResponsible],totalElements)
        }
    })


}


function createCircle(_svg1,radius_w,radius_h,files){
    var num_elements= files.length;
    var j=0;
     degrees_seperation= 360/(num_elements );
    svg_canvas=_svg1
    svg_g= _svg1.append("g").attr("transform", function(d){ return "translate (" + 80 + "," + 80 + ")" })

    nodes=[]

    polarToCartesian(radius_w , radius_h , radius_w, radius_h, j * degrees_seperation);

    files.forEach(function (el){
        var degrees=degrees_seperation*j
        nodes.push({
            slug:files_clockwise[j][0],
            data:files_clockwise[j],
            /*x: radius_w+radius_w * Math.cos( (degrees-offset) ),
            y: radius_h+radius_h * Math.sin( (degrees-offset) ),
            x_inside:   radius_w+(radius_w-100) * Math.cos( (degrees-offset) ),
            y_inside:   radius_h+(radius_h-100) * Math.sin( (degrees-offset) ),*/
            x: polarToCartesian(radius_w , radius_h , radius_w, radius_h, j * degrees_seperation-offset).x,
            y:polarToCartesian(radius_w , radius_h , radius_w, radius_h, j * degrees_seperation-offset).y,
            x_inside:polarToCartesian(radius_w , radius_h , radius_w-80, radius_h-80, j * degrees_seperation-offset).x,
            y_inside:polarToCartesian(radius_w , radius_h , radius_w-80, radius_h-80, j * degrees_seperation-offset).y,
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
      .attr("transform", function(d){ return "translate (" + d.x_inside + "," + d.y_inside + ")" })
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
        .attr("id",(d)=>{return "slug-" + d.slug})
        .attr('xlink:href',function(d){return'img/'+d.data[1]})
        .attr('width',IMAGE_SIZE+'px')
        .attr('height',IMAGE_SIZE+'px')
        .attr('y',-IMAGE_SIZE/2+'px')
        .attr('x',-IMAGE_SIZE/2+'px')
        .attr("data-id",j)



        imageEnter.on("click", function(d, i) {
            var num=$(this).attr("data-id")
            d3.event.stopPropagation();
            if(d3.event.altKey==true || fakeAlt==true){ //pulsando tecla lat
                selected_nodes1=nodes.filter((d1)=>{return d1.status=="clicked"})
                if(selected_nodes1.length>0){
                    _svg1.selectAll(".arrow2").remove();
                    _svg1.selectAll("g.node")
                    .attr( "filter","")
                    .each(function(otrosD, i) {
                        if(d!=otrosD)
                        otrosD.status="normal"
                    })
                    d3.selectAll(".article.clicked").remove()
                    d3.selectAll(".title_rev").remove()
                    drawArrowFromTo(d,selected_nodes1[0])
                }
            }

            else {
                if(d3.event.shiftKey==false && fakeShift==false){ //mark all other elements as not selected cuando no se pulsa tecla shift
                    _svg1.selectAll(".arrow2").remove();
                    _svg1.selectAll("g.node")
                    .attr( "filter","")
                    .each(function(otrosD, i) {
                        if(d!=otrosD)
                        otrosD.status="normal"
                    })
                    d3.selectAll(".article.clicked").remove()
                    d3.selectAll(".title_rev").remove()
                }
                if(d.status=="clicked"){
                    _svg1.selectAll(".arrow-src-"+d.data[0]).remove()
                    d.status="normal"
                    $(this).parent().attr( "filter","")
                    d3.selectAll(".article.clicked").remove()
                    d3.selectAll(".title_rev").remove()
                }
                else{
                  d.status="clicked"
                  $(this).parent().attr( "filter","url(#sepiatone)")
                  drawArrowFrom(d)
                  var num=$(this).attr("data-id")
                  if(dataByPow[d.slug]==undefined) return;
                  d3.selectAll(".title_rev").remove()
                  showTitle=true;
                  if(dataByPow[d.slug].length<0){
                    $('#description').append("<div class='title_rev'>  According to <i>"+ nodesBySlug[d.slug].data[2] +'</i>,<br/> they are responsible for: </div>')

                  }
                  dataByPow[d.slug].forEach(function(datarow){ //recorro todos los
                      if(datarow.slugPow==datarow.slugResponsible)
                      {
                          var url=datarow.url
                          if(url!==undefined && url.length>6){}
                          else url=""
                          insertArticle(datarow.Action ,datarow.pow_original, datarow.POW, d.data[1], d.data[1],url, "clicked")
                      }
                  //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
                  })
              }
            }
            //$(this).attr("data-status","clicked")

        })
        .on("mouseover", function(d, i) {
            var num=$(this).attr("data-id")
            if(d.status=="normal"){
                d.status="mouseover"
                $(this).attr( "filter","url(#blurFilter2)")
                d3.select(this.parentNode).selectAll("text").classed("mouseover",true)
            }
        /*    if(dataByPow[d.slug]==undefined) return;
            dataByPow[d.slug].forEach(function(datarow){ //recorro todos los
                if(datarow.slugPow==datarow.slugResponsible)
                {
                    var url=datarow.url
                    if(url!==undefined && url.length>6){}
                    else url=""
                    insertArticle(datarow.Action ,datarow.pow_original, datarow.POW, d.data[1], d.data[1],url, "mouseover")
                }
            //    function canvasInsertArrow(x1,y1,x2,y2,color,id){
            })*/
        })
        .on("mouseout", function(d, i) {
            var num=$(this).attr("data-id")
            //<console.log(files_clockwise[num])
                if(d.status=="mouseover"){
                    d.status="normal"
                    $(this).attr( "filter","")
                    $(this).attr("data-status","")
                }
                d3.select(this.parentNode).selectAll("text").classed("mouseover",false)
                /*f
                d3.selectAll(".article.mouseover").remove()*/
                if(d3.selectAll(".article").size()==0) $("#basetext").show();
        })

        g_enter.append("text")
        .attr("x", function(d) { return d.cx; })
        .attr("y", function(d) { return "60px"; })
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

function canvasInsertArrow(x1,y1,x2,y2,color,src_slug,target_slug,datanumber,elementNumber,total){
    var lineGenerator = d3.line();
    //lineGenerator.curve(d3.curveCatmullRom.alpha(0.5));
    lineGenerator.curve(d3.curveNatural)
    //console.log(lineGenerator( [ [x1,y1],[x2,y2] ,[x2+100,y2+100] ] ));
     patharrow=svg_g.append('path')
    .attr('class',()=>  'arrow2 arrow-src-'+src_slug + ' arrow-target-'+target_slug)
    .attr("data-number",datanumber)
    .attr("fill", "none")
    .attr('marker-end',function(d){

                if(elementNumber==(Math.floor(total/2)  ) ) return    "url(#arrow)"
                if(total==1)return    "url(#arrow)"


    })
    //.attr('pointer-events',"visibleStroke")
    .attr("d", function(d) {
        pendiente=(y1-y2)/(x1-x2)
        angulo=Math.atan(pendiente)
        punto_medio=[Math.abs(x1+x2)/2 ,  Math.abs(y1+y2)/2]
        distancia=(elementNumber*4- (total/2) * 4 )
        //distancia=elementNumber*10;
        punto=rotate(punto_medio[0],punto_medio[1],punto_medio[0],punto_medio[1]-distancia,-angulo*57.29577951308232 )
        //return lineGenerator( [ [x1,y1],  [ Math.sin(angulo)*distancia +punto_medio[0] ,  Math.cos(angulo)*distancia + punto_medio[1] ], [x2,y2] ] )
        return lineGenerator( [ [x1,y1],  punto, [x2,y2] ] )


    })

    .style("stroke",color)
    var totalLength = patharrow.node().getTotalLength();
    patharrow.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);

    patharrow.on("click", function(d, i) {
        var num = d3.select(this).attr("data-number");
        datarow=globalData[num]
        insertArticles(datarow.slugPow,datarow.slugResponsible);
    })
    .on("mouseover", function(d, i) {
        //console.log( $(this) )
        var clases=d3.select(this).attr("class")
        d3.selectAll("."+clases.replace(/\s/g,".")).classed("mouseover",true)
    })
    .on("mouseout", function(d, i) {
        //console.log( $(this) )
        var clases=d3.select(this).attr("class")
    //    console.log("."+clases.replace(" ","."))
        d3.selectAll("."+clases.replace(/\s/g,".")).classed("mouseover",false)
    })
}

function insertArticles(src_slug, target_slug){
    d3.selectAll(".article.clicked").remove()
    d3.selectAll(".title_rev").remove()
    var showTitle=false;
    dataByPow[src_slug].forEach(function(datarow){ //recorro todos los
        if(datarow.slugResponsible==target_slug)
        {
          if(showTitle==false && $('.title_rev').length==0){
            $('#description').append("<div class='title_rev'>  According to <i>"+ nodesBySlug[src_slug].data[2] +'</i>,<br/> <i> ' +nodesBySlug[target_slug].data[2]   + '</i> is responsible for: </div>')
            showTitle=true;
          }
            var icon1=nodesBySlug[src_slug].data[1]
            //console.log(icon1)
            var icon2=nodesBySlug[target_slug].data[1]
            var url=datarow.url
            if(url!==undefined && url.length>6){}
            else url=""
            insertArticle(datarow.Action ,datarow.pow_original, datarow.Responsible, icon1,icon2,url,"clicked")
        }
    })
}

function insertArticle(text,title1, title2, icon1, icon2, url, extraclass){
    $("#basetext").hide();
    var context = {"body": text, "src_title" :title1, "dst_title": title2, "src_image": icon1 , "dst_image": icon2, "colorArrow":"#000","link":url,"extraclass":extraclass };
    var html    = template(context);
    aa=$('#description').append(html)
    var hh= $("#description .article ").first().find(".text-container").height()
    $("#description .article ").last().find(".image-line").css("height",hh+"px")


}

function polarToCartesian(centerX, centerY, radiusX, radiusY, angleInDegrees) {

        var angleInRadians = (angleInDegrees* Math.PI / 180.0);
        return {
            x: centerX + (radiusX * Math.cos(angleInRadians)),
            y: centerY + (radiusY * Math.sin(angleInRadians))
        };
    }
//https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
//The first two parameters are the X and Y coordinates of the central point (the origin around which the second point will be rotated).
//The next two parameters are the coordinates of the point that we'll be rotating. The last parameter is the angle, in degrees.

    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }
