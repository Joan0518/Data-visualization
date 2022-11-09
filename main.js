
//把標示為空值"NA"的字串轉為Javascript認知的空值
const parseNA = string => (string == 'NA' ? undefined : string);
//轉為Javascript的日期時間格式
const parseDate = string => d3.timeParse('%Y%m')(string);

function type(d){
    const date = parseDate(d.Trading_Date);
    return {
        COID:+d.COID,
        NAME:parseNA(d.NAME),
        Industry:parseNA(d.Industry),
        Trading_Volume:+d.Trading_Volume,
        Trading_Date:date
    }
}
//資料選取
function filterData(data){
    return data.filter(
        d => {
            return(
                d.COID > 0 &&
                d.Trading_Volume > 0 &&
                d.NAME &&
                d.Industry
            );
        }
    );
}

//資料聚合
function prepareBarChartData(data){
    console.log(data);
    const dataMap = d3.rollup(
        data,
        v => d3.sum(v,leaf => leaf.Trading_Volume),
        d => d.Industry
    );
    // debugger;
        const dataArray = Array.from(dataMap, d => ({Industry:d[0],Trading_Volume:d[1]}));
        return dataArray;
}

function ready(個股資料){
    const 個股資料Clean = filterData(個股資料);
    const barChartData = prepareBarChartData(個股資料Clean).sort(
        (a,b) => {
            return d3.descending(a.Trading_Volume,b.Trading_Volume)
        }
    );
    console.log(barChartData);
    setupCanvas(barChartData);
}

// function setupCanvas(barChartData)
function setupCanvas(barChartData)
{
    const svg_width = 400;
    const svg_height = 500;
    const chart_margin = {top:80, right:40, bottom:40, left:80};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height - (chart_margin.top + chart_margin.bottom);
    
    const this_svg = d3.select('.bar-chart-container').append('svg')
    .attr('width',svg_width).attr('height', svg_height).append('g')
    .attr('transform', `translate(${chart_margin.left}, ${chart_margin.top})`);
 
    const xExtent = d3.extent(barChartData, d=> d.Trading_Volume);
    const xScale = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    const xMax = d3.max(barChartData, d=>d.Trading_Volume)
    const yScale = d3.scaleBand().domain(barChartData.map(d=>d.Industry))
                    .rangeRound([0, chart_height])
                    .paddingInner(0.25)
 
    const xAxis = d3.axisTop(xScale)
                    .tickFormat(formatTicks)
                    .tickSizeInner(-chart_height)
                    .tickSizeOuter(0);
    const xAxisDraw = this_svg.append('g')
                              .attr('class','x axis')
                              .call(xAxis);
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    const yAxisDraw = this_svg.append('g')
                              .attr('class','y axis')
                              .call(yAxis);
    yAxisDraw.selectAll('text').attr('dx','-0.6em')

//繪製長條圖
    const bars = this_svg.selectAll('.bar')
                         .data(barChartData)
                         .enter()
                         .append('rect')
                         .attr('class','bar')
                         .attr('x',0)
                         .attr('y',d=>yScale(d.Industry))
                         .attr('width',d=>xScale(d.Trading_Volume))
                         .attr('height',yScale.bandwidth())
                         .style('fill','steelblue')
                    


//加上標題
const header = this_svg.append('g').attr('class','bar-header')
                .attr('transform', `translate(0,${-chart_margin.top/2})`)
                .append('text');
header.append('tspan').text('上市公司產業每月累計成交量排行')
header.append('tspan').text('Years:2012/11-2022/11    單位:筆數(千筆)')
    .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555')
}

//刻度顯示格式轉換
function formatTicks(d){
    return d3.format('~s')(d)
             .replace('M','mil')
             .replace('G','bil')
             .replace('T','trl')
}



//取得資料
d3.csv('data/TWSE產業別個股交易量.csv',type).then(
    res => {
    ready(res);
    // console.log('CSV',res);
   

//     {console.log('Movies:',res[0]);
 }
);

