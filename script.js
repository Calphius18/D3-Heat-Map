const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

d3.json(url).then(data =>{
 document.getElementById('chart').onload = makeMap(data)
})

const makeMap = function(dataset) {
 
  const baseTemp = dataset.baseTemperature
  
   const temps = dataset.monthlyVariance

  const minDate = d3.min(temps, d => d.year)
 
  const maxDate = d3.max(temps, d => d.year) + 1
  
   const padding = 50
  const width = (padding * 2 + (maxDate-minDate) * 3 + padding)
  const height = 750
  const spacing = 1

  const binWidth = (width - padding * 3) / (maxDate - minDate)
  const binHeight = (height - padding * 4) / 12

  const xScale = d3.scaleLinear()
                    .domain([ minDate, maxDate ])
                    .range([ padding * 2, width - padding ])
  
  const yScale = d3.scaleBand()
                    .domain([11,10,9,8,7,6,5,4,3,2,1,0])
                    .range([ height - padding * 2, padding * 2 ])

  const svg = d3.select('#map')
                  .append('div')
                    .attr('class', 'map')
                    .style('width', width + 'px')
                    .style('height', height + 'px')
                  .append('svg')                
                    .attr('width', width)
                    .attr('height', height)

   const minVar = d3.min(temps, d => d.variance)
  const maxVar = d3.max(temps, d => d.variance)
  
    const colors = ['#04136e', '#3394d6', '#49bcc9', '#7da88b', '#FFFFFF','#f2c96d', '#fa8632', '#db3118', '#910421']
  const quantize = d3.scaleQuantize()
  .domain([minVar, maxVar])
    .range(colors)

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d')).tickSizeOuter(0)
  svg.append('g')
      .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding * 2})`)
  
   svg.append('text')
      .text('Year')
        .attr('width', width)
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${(width - padding * 4) / 2 + padding * 1}, ${height - padding})`)
  .attr("font-size", "30px")
        .attr('fill', 'black')
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const yAxis = d3.axisLeft(yScale).tickFormat(function (month) {
      var date = new Date(0);
      date.setUTCMonth(month);
      var format = d3.timeFormat('%B');
      return format(date);
    })
  svg.append('g')
      .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding * 2}, 0)`)
        .attr('class', 'y-axis')
      .call(shiftLabel)
  
  function shiftLabel(labels) {
    labels.selectAll('.tick text')     
  }
  
  svg.append('text')
      .text('Month')
        .attr('width', height)
        .attr('text-anchor', 'middle')
   .attr("font-size", "30px")
        .attr('transform', `translate(${padding}, ${height / 2})rotate(-90)`)
        .attr('fill', 'black')
  
   const binSize = 30 

  const legend = svg.append('g').attr('id', 'legend')
  
  legend.selectAll('rect')
          .data(colors).enter().append('rect')
            .attr('x', (d, i) => i * binSize)
            .attr('y', 25)
            .attr('width', binSize)
            .attr('height', binSize)
            .attr('fill', d => d)
  
  const ticks = d3.range(colors.length + 1)  
  legend.selectAll('text')
          .data(ticks).enter()
            .append('text')
              .text(d => formatLegendText(d))
              .attr('x', d => d * binSize)
              .attr('y', 65)
              .attr('fill', 'black')
              .attr('font-size', 10)
              .attr('text-anchor', 'middle')
              .attr('fill', '#EEE')
  
  legend.attr('transform', 'translate(' + (width - binSize * 11) + ',' + (height - padding * 2) + ')')
  
  function formatLegendText(i) {
    let binSpread = (maxVar - minVar) / colors.length
    return ((i) * binSpread + minVar).toFixed(1)
  }
  
   const bins = svg.append('g').attr('class', 'bins')
                  .selectAll('rect')
                    .data(temps).enter()
                      .append('rect')
                        .attr('class', 'cell')
                        .attr('data-year', d => d.year)
                        .attr('data-month', d => d.month - 1)
                        .attr('data-temp', d => d.variance)
                        .attr('x', d => xScale(d.year))
                        .attr('y', d => yScale(d.month - 1))
                        .attr('width', binWidth)
                        .attr('height', binHeight)
                        .attr('fill', d => quantize(d.variance))
  
   .on('mouseover', mouseOver)
   .on('mouseout', mouseOut)

   const tooltip = d3.select('#map')
                    .append('div')
                      .attr('id', 'tooltip')
                      .style('display', 'none')
                      .style('opacity', 0)
   
   function mouseOver(d) {
      const text = d.year + ' ' + months[d.month - 1] + '<br />' + 
                (baseTemp + d.variance).toFixed(2) + '°C' + '<br />' +
                (d.variance > 0 ? '+' : '-') + Math.abs(this.dataset.temp) + '°C'
      
      tooltip.attr('data-year', this.dataset.year)
    
      tooltip.html(text)
                .style('left', (d3.event.pageX + 10) + 'px')
                .style('top', (d3.event.pageY - 65) + 'px') 
      tooltip.transition()
               .duration(500)
               .style('display', 'inline')
               .style('opacity', 1)
   }
   function mouseOut() {
    tooltip.transition()
            .delay(100)
            .style('display', 'none')
  }
}