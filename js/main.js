num_elemtos=8;
offset=90;
svg_canvas=undefined;
template=undefined
IMAGE_SIZE=80;
CIRCLE_CUT_WIDTH=80;
CIRCLE_CUT_HEIGHT=200
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
    $('#canvas').css('width',w+'px')
    $('#canvas').css('height',w_height+'px')
    $('#canvas').css('margin-left',CIRCLE_CUT_WIDTH/2+'px')
    svg = d3.select("#canvas");
    createCircle(svg,(w-CIRCLE_CUT_WIDTH*2)/2,(h-CIRCLE_CUT_HEIGHT)/2,files_clockwise)

    replaceArrow();

} //end onload



function createCircle(_svg1,radius_w,radius_h,files){
    var num_elements= files.length;
    var j=0;
    var degrees_seperation= 360/(num_elements );
    svg_canvas=_svg1
    nodes=[]
    files.forEach(function (el){
        var degrees=degrees_seperation*j
        nodes.push({
            data:files_clockwise[j],
            x: radius_w+radius_w * Math.cos( (degrees-offset) ),
            y: radius_h+radius_h * Math.sin( (degrees-offset) ),
            status: "normal",
            id:j
        })
        j++;
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
            console.log(d.id)
            if(d.status=="clicked"){
                _svg1.selectAll(".arrow-"+d.data[0]).remove()
                d.status="normal"
                $(this).parent().attr( "filter","")
            }
            else{
                d.status="clicked"
                $(this).parent().attr( "filter","url(#sepiatone)")
                // add articles
                insertArticle("tirri <br/> tirrii 2",d.data[0], "otro", d.data[1], d.data[1])
                //draw links
                if(links[d.id]!=undefined){
                    links[d.id].link.forEach(function(destid){
                            canvasInsertArrow(d.x +40,d.y+40, nodes[destid].x +40 ,nodes[destid].y+40,"#ff00ff",d.data[0])
                    })
                }
            }
            //$(this).attr("data-status","clicked")

        })
        .on("mouseover", function(d, i) {
            var num=$(this).attr("data-id")

            console.log($(this).attr( "filter") )
            if(d.status=="normal"){
                d.status="mouseover"
                $(this).attr( "filter","url(#blurFilter2)")
            }
        })
        .on("mouseout", function(d, i) {
            var num=$(this).attr("data-id")
            console.log(files_clockwise[num])
                if(d.status=="mouseover"){
                    d.status="normal"
                    $(this).attr( "filter","")
                    $(this).attr("data-status","")
                }
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

function canvasInsertArrow(x1,y1,x2,y2,color,id){
    svg_canvas.append('line')
    .attr('class',()=>  'arrow2 arrow-'+id)
    .attr('marker-end',"url(#arrow)")
    .attr('x1',x1)
    .attr('y1',y1)
    .attr('x2',x2)
    .attr('y2',y2)
    .style("stroke",color)
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

function insertArticle(text,title1, title2, icon1, icon2){
    var context = {"body": text, "src_title" :title1, "dst_title": title2, "src_image": icon1 , "dst_image": icon2, "colorArrow":"#ff0000" };
    var html    = template(context);
    $('#description').append(html)

}
