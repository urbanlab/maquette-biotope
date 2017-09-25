'use strict';

// let leftData = Array.from(tAxis, function(t) {
//   let t0 = moment(startTime); // commodity
//   return {"x": t, "y": leftDataGeneratingFunction( t.unix() )};
// });


window.socket = io();

window.index = 0; // initialization

window.chartColors = {
  red: '#F30000', // Grand Lyon's red
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  // blue: 'rgb(54, 162, 235)',
  // blue: '#144F76', // bIoTope dark blue
  blue: '#02AEF1',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

let myOptions = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  title: {display: false, text:"MyTitle"},
  layout: {padding: {left: 20, top: 0, right: 20, bottom: 0} },
  scales: {
    xAxes:
          [{
            type: "time",
            display: true,
            scaleLabel: {display: true, labelString: 'time', fontColor: "#000000"},
            ticks: {major: {fontStyle: "bold", fontColor: "#000000"}, minor: {fontColor: "#000000"}},
            time: {
                max: moment().add(5, 'seconds')
            }
          }],
    yAxes:
          [{
            display: true,
            scaleLabel: {display: true, labelString: 'value', fontColor: "#000000"},
            ticks: {min: -1.5, max: 1.5, major: {fontStyle: "bold", fontColor: "#000000"}, minor: {fontColor: "#000000"}}
          }]
  }
};


let leftData  = new Array();//{x: new Date(), y: 0.0}];
let rightData = new Array();//{x: new Date(), y: 0.0}];


let lowerThreshold = -0.5;
let upperThreshold = 0.5;

let myAnnotation = {
  events: ['click'],
  annotations: [
                {
                  drawTime: "afterDatasetsDraw",
                  id: "vline",
                  type: "line",
                  mode: "vertical",
                  scaleID: "x-axis-0",
                  value: new Date(),
                  borderColor:  "black",
                  borderWidth:  3,
                  label: {backgroundColor: "black", fontColor: "#fff", fontSize: 20, content: "Now!", enabled: true, xPadding: 10, yPadding: 10}
                },
                {
                  drawTime: "afterDatasetsDraw",
                  id: "lowerHline",
                  type: "line",
                  mode: "horizontal",
                  scaleID: "y-axis-0",
                  value: lowerThreshold,
                  borderColor: "black",
                  borderWidth: 3,
                  label: {backgroundColor: "black", fontColor: "#fff", content: "Switch OFF Threshold", enabled: true, xPadding: 10, yPadding: 10}
                },
                {
                  drawTime: "afterDatasetsDraw",
                  id: "UpperHline",
                  type: "line",
                  mode: "horizontal",
                  scaleID: "y-axis-0",
                  value: upperThreshold,
                  borderColor: "black",
                  borderWidth: 3,
                  label: {backgroundColor: "black", fontColor: "#fff", content: "Switch ON Threshold", enabled: true, xPadding: 10, yPadding: 10}
                }
               ]
};

myOptions.annotation = myAnnotation;

// cf. http://www.chartjs.org/docs/latest/charts/line.html#dataset-properties

let color = Chart.helpers.color;
Chart.defaults.global.defaultFontColor = 'black';

let config = {
  data: {
          datasets:
          [
            // {
            //   type: 'scatter',
            //   label: "myOtherLabel",
            //   backgroundColor: color(window.chartColors.blue).alpha(1.0).rgbString(),
            //   borderColor: 'black',
            //   // window.chartColors.blue,
            //   pointStyle: 'circle',
            //   pointRadius: 10,
            //   pointHoverRadius: 15,
            //   pointBackgroundColor: 'black',
            //   fill: true,
            //   data: Array(leftData[ window.index ])
            // },
            {
              type: 'line',
              label: "Left Sector",
              backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
              borderColor: window.chartColors.red,
              pointRadius: 5,
              pointHoverRadius: 10,
              fill: false,
              data: leftData
           },
           {
             type: 'line',
             label: "Right Sector",
             backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
             borderColor: window.chartColors.blue,
             pointRadius: 5,
             pointHoverRadius: 10,
             fill: false,
             data: rightData
          }
          ]
        },
  options: myOptions
};




let trim = function( dataArray ) {

  // dataArray.sort( function(a, b) {
  //   let t0 = moment(a.x);
  //   let t1 = moment(b.x);
  //   return t0.diff(t1, 'seconds');
  // })

  // console.log(sortedArray);
  let duration = moment.duration(60, 'seconds');

  let t0 = moment( dataArray[0].x );
  let t1 = moment();// dataArray[dataArray.length-1].x );

  while ( dataArray.length > 0 && t1.diff(t0, 'seconds') > duration.asSeconds() ) {
    dataArray.shift();
    if (dataArray.length > 0) {
      t0 = moment( dataArray[0].x );
    };
  };

  return;
};



let leftSectorMessageFeed_hist = new Array();
let leftSectorMessageFeed_last;
let rightSectorMessageFeed_hist = new Array();
let rightSectorMessageFeed_last;


let formatMessage = function( msg, zone ) {
  let latestMessage = "[{timestamp}] Switch {msg} message received."
  latestMessage = latestMessage.replace(/{timestamp}/g, new Date(msg.x).toLocaleTimeString());

  let myColor;

  if (zone === 'right') {
    myColor = window.chartColors.blue;
  } else {
    myColor = window.chartColors.red;
  }

  latestMessage = latestMessage.replace(/{msg}/g, '<span style="color:' + myColor + ';font-weight: bold">' + msg.y + '</span>');
  latestMessage = latestMessage.replace(/{lr}/g, zone);
  return latestMessage;
}
// let msgFeedArrayToString = function( msgFeed ) {
//   msgFee
// }

let setNow = function( now ) {
  window.myChart.annotation.elements.vline.options.value = now;
  window.myChart.options.scales.xAxes[0].time.min = moment(now).subtract(60, "seconds");
  window.myChart.options.scales.xAxes[0].time.max = moment(now).add(5, "seconds");
}

window.onload = function() {

  var ctx = document.getElementById("canvas").getContext("2d");
  window.myChart = new Chart(ctx, config);

  // setInterval( function() {
  //     window.myChart.annotation.elements.vline.options.value = new Date();
  // }, 1000);

  window.socket.once('Left_Zone_Bootstrap', function(msg){

   while (leftData.length > 0) {
      leftData.shift();
    }
   msg.forEach( function(x) {
      leftData.push(x);
    })
    trim(leftData);
    setNow( leftData[leftData.length-1].x );
    window.myChart.update();

    // window.socket.removeListener('Left_Zone_Bootstrap');
  });

  window.socket.once('Right_Zone_Bootstrap', function(msg){

    while (rightData.length > 0) {
      rightData.shift();
    }
    msg.forEach( function(x) {
      rightData.push(x);
    })
    trim(rightData);
    setNow( rightData[rightData.length-1].x );
    window.myChart.update();

    // window.socket.off('Left_Zone_Bootstrap');
  });

  window.socket.on('Left_Zone', function(msg){
    leftData.push(msg);
    trim(leftData);
    setNow( leftData[leftData.length-1].x );
    window.myChart.update();
  });

  window.socket.on('Right_Zone', function(msg){
    rightData.push(msg);
    trim(rightData);
    setNow( rightData[rightData.length-1].x );
    window.myChart.update();
  });

  window.socket.on('Left_Zone_Actuation', function(msg){
    // rightData.push(msg);
    // trim(rightData);
    // console.log(msg);
    let latestMessage = formatMessage(msg, "left");

    leftSectorMessageFeed_hist.push(leftSectorMessageFeed_last);
    leftSectorMessageFeed_last = latestMessage;

    if (leftSectorMessageFeed_hist.length > 4) {
      leftSectorMessageFeed_hist.shift();
    }


    document.getElementById("leftSectorMessageFeed_hist").innerHTML = leftSectorMessageFeed_hist.join('<br/>');

    document.getElementById("leftSectorMessageFeed_last_div").remove();

    var div = document.createElement('div');
    div.setAttribute('class', 'typewriter');
    div.setAttribute('id', 'leftSectorMessageFeed_last_div');

    var p = document.createElement('p');
    p.setAttribute('id', 'leftSectorMessageFeed_last_p');

    div.appendChild(p);
    document.getElementById("leftSectorMessageFeed_last_container").appendChild(div);
    document.getElementById("leftSectorMessageFeed_last_p").innerHTML = leftSectorMessageFeed_last;

    // leftSectorMessageFeed.push(latestMessage);
    // if (leftSectorMessageFeed.length > 5) {
    //   leftSectorMessageFeed.shift();
    // }
    //
    // document.getElementById("leftSectorMessageFeed").innerHTML = leftSectorMessageFeed.join('<br/>');
    //   // window.myIntervals.push(setInterval( loop, 16));
  });

  window.socket.on('Right_Zone_Actuation', function(msg){

    let latestMessage = formatMessage(msg, "right");


    rightSectorMessageFeed_hist.push(rightSectorMessageFeed_last);
    rightSectorMessageFeed_last = latestMessage;

    if (rightSectorMessageFeed_hist.length > 4) {
      rightSectorMessageFeed_hist.shift();
    }


    document.getElementById("rightSectorMessageFeed_hist").innerHTML = rightSectorMessageFeed_hist.join('<br/>');

    document.getElementById("rightSectorMessageFeed_last_div").remove();

    var div = document.createElement('div');
    div.setAttribute('class', 'typewriter');
    div.setAttribute('id', 'rightSectorMessageFeed_last_div');

    var p = document.createElement('p');
    p.setAttribute('id', 'rightSectorMessageFeed_last_p');

    div.appendChild(p);
    document.getElementById("rightSectorMessageFeed_last_container").appendChild(div);
    document.getElementById("rightSectorMessageFeed_last_p").innerHTML = rightSectorMessageFeed_last;
  });


};



// function resize() {
//
//     var canvas = document.getElementById('canvas');
//     var canvasRatio = canvas.height / canvas.width;
//     var windowRatio = window.innerHeight / window.innerWidth;
//     var width;
//     var height;
//
//
//     if (windowRatio < canvasRatio) {
//         height = window.innerHeight;
//         width = height / canvasRatio;
//     } else {
//         width = window.innerWidth;
//         height = width * canvasRatio;
//     }
//
//     canvas.style.width = width + 'px';
//     canvas.style.height = "20" + 'px';
//     // console.log('here');
// };
