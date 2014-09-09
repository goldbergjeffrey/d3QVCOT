/**
 * @author JOG
 */

var template_path = Qva.Remote +
"?public=only&name=Extensions/d3CirclesOverTime/";
var start_year = 9999;
var end_year = 0;




function extension_init()
{
	
		if(typeof jQuery == 'undefined')
		{
			Qva.LoadScript(template_path + 'jquery-2.1.0.min.js', extension_loadHelpers());
		}
		else
		{
			extension_loadHelpers();
		}

}


function extension_loadHelpers()
{
	var helperFiles = new Array();
	helperFiles.push(template_path + "d3.min.js");
	//Add more helper files here if necessary
	Qv.LoadExtensionScripts(helperFiles, extension_register);
	Qva.LoadCSS(template_path + "style.css");
}

function extension_register()
{
	Qv.AddExtension("d3CirclesOverTime", renderChart);
}


function renderChart()
{
	var _this = this;
	var randomWholeNumber = Math.round(10*Math.random() + 13*Math.random() + 92*Math.random());
	//Build the div name
	//var divName = "d3CirlesOverTime_" + randomWholeNumber;
	var divName = _this.Layout.ObjectId.replace("\\","_");
	//Now build the D3 object
	var margin = {top: 20, right: 200, bottom: 0, left: 20};
	var width = _this.GetWidth() - margin.left - margin.right;
	var height = _this.GetHeight() - margin.top - margin.bottom;
	//var width = 300, height = 600;
	_this.Data.SetPagesizeY(5000);
	
	//Build the html element on the page
	if(_this.Element.children.length==0)
	{
		var ui = document.createElement("div");
		ui.setAttribute("id", divName);
		ui.setAttribute("class","d3CirclesOverTime");
		_this.Element.appendChild(ui);
	}
	else
	{
		$("#" + divName).empty();
	}	
	
	//Get the data into a format that D3 can read easily.
	var td = _this.Data;
	var jsonData = formatData(td);
	getYearRange(td);
	


	var catColors = d3.scale.category20c();
	
	//When you see d3 code that has multiple lines starting with a period, think of the With...End With construct of Visual Basic.
	var xScale = d3.scale.linear()
		.range([0, width]);
	
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("top");
		
	var formatYears = d3.format("0000");
	xAxis.tickFormat(formatYears);
	
	var svg = d3.select("#" + divName)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("margin-left", margin.left + "px")
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")");
		
	//seeing the visualization come to life
	d3Dots(jsonData);
	
	
	
	function d3Dots(data)
	{
		xScale.domain([start_year, end_year]);
		//var xScale = d3.scale.linear()
		//	.domain([start_year, end_year])
		//	.range([0, width]);
		
		svg.append("g")
			.attr("class","x axis")
			.attr("transform", "translate(0," + 0 + ")")
			.call(xAxis);
			
		for (var j = 0; j< data.length; j++)
		{
			var g = svg.append("g").attr("class","y axis");
			
			var circles = g.selectAll("circle")
				.data(data[j]['DimensionValues'])
				.enter()
				.append("circle");
				
			var text = g.selectAll("text")
				.data(data[j]['DimensionValues'])
				.enter()
				.append("text");
				
			var rScale = d3.scale.linear()
				.domain([0, d3.max(data[j]['DimensionValues'], function(d) {return d[1];})])
				.range([2, 12]);
			
			circles
				.attr("cx", function(d,i) {return xScale(d[0]); })
				.attr("cy", j*20+20)
				.attr("r", function(d) {return rScale(d[1]); })
				.style("fill", function(d) {return catColors(j); });
				
			text
				.attr("y", j*20+25)
				.attr("x", function(d,i) {return xScale(d[0])-5; })
				.attr("class","value")
				.text(function(d) {return d[1]; })
				.style("fill", function(d) {return catColors(j); })
				.style("display","none");
				
			g.append("text")
				.attr("y",j*20+25)
				.attr("x", width+20)
				.attr("class","label")
				.text(truncate(data[j]['DimensionName'],20,"..."))
				.style("fill", function(d) {return catColors(j); })
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);
		}	
	}
	
	function mouseover(p) 
	{
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","none");
		d3.select(g).selectAll("text.value").style("display","block");
	}
	
	function mouseout(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","block");
		d3.select(g).selectAll("text.value").style("display","none");
	}
}



function formatData(td)
{
	var FooArray = new Array();
	for(var i = 0; i<td.Rows.length;i++)
	{
		var tdr = td.Rows[i];
		var boolExist = false;
		for(var j =0; j<FooArray.length;j++)
		{
			if(FooArray[j].Dim1 === tdr[0].text)
			{
				FooArray[j].valPair.push([tdr[1].text, parseFloat(tdr[2].text)]);
				boolExist = true;
				break;
			}
		}
		if(! boolExist)
		{
			//alert (tdr[0].text + " " +  tdr[1].text + " " + tdr[2].text);
			//FooArray.push([buildRow(tdr[0].text, tdr[1].text, parsefloat(tdr[2].text))]);
			FooArray[FooArray.length] = new buildRow(tdr[0].text, tdr[1].text, parseFloat(tdr[2].text));
		}		
	}
	
	return buildJSON(FooArray);
	
}

function getYearRange(td)
{
	for(var i = 0; i<td.Rows.length;i++)
	{
		var tdr = td.Rows[i];	
		var vYear = tdr[1].text;
		if(start_year > parseInt(vYear) ) {
			start_year = parseInt(vYear);
		}
		if(end_year < parseInt(vYear)) {
			end_year = parseInt(vYear);
		}
	}	
}

function buildRow(vDim1, vDim2, vMeasure)
{
	var me = this;
	me.Dim1 = vDim1;
	me.valPair = new Array();
	
	me.valPair[me.valPair.length] = [vDim2,vMeasure];
}

function buildJSON(dataArray)
{
	var jsondata = [];
	for(i=0;i<dataArray.length;i++)
	{
		jsondata[i] = {"DimensionName": dataArray[i].Dim1, "DimensionValues": dataArray[i].valPair};
	}
	
	return jsondata;
}

function truncate(str, maxLength, suffix)
{
	if(str.length > maxLength)
	{
		str = str.substring(0, maxLength + 1); 
		str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
		str = str + suffix;
	}
	return str;
}

extension_init();
