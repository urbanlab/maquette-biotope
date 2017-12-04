var cheerio = require('cheerio');
var moment  = require('moment');

exports.XMLdataParser = function( xmlData ) {

  let $     = cheerio.load( xmlData );
  let ts    = $('InfoItem[name=Value] value').attr('datetime');
  // let ts2    = $('InfoItem[name=Temperature] value').attr('unixtime');
  let value = $('InfoItem[name=Value] value').text();

  //   let toto = $('id').filter(function(i, el) {
  //   // this === el
  //   return $(this).text() === 'Left_Zone';
  // }).siblings().find('infoitem value').text();

  let msg = {'x': ts, 'y': value};
  return msg;
};


exports.XMLboostrapDataParser = function( xmlData, zone ) {

  let $     = cheerio.load( xmlData );
  let ts    = $('InfoItem[name=Value] value').attr('datetime');
  // let ts2    = $('InfoItem[name=Temperature] value').attr('unixtime');
  let value = $('InfoItem[name=Value] value').text();

  let selectedZoneData = $('id').filter(function(i, el) {
    // this === el
    return $(this).text() === zone;
  }).siblings().find('infoitem value');//.text();

  // toto.siblings().forEach( function(x) {
  //   console.log(x.find('infoitem value').text());
  // } );

  let msg = new Array();

  selectedZoneData.map(function(index, x) {
    //  console.log($(this).text());
    //  console.log($(this).attr('datetime'));
     msg.push( {'x': $(this).attr('datetime'), 'y': $(this).text()} );
  });
  // console.log('here');
  // console.log(new Array(toto));

  // let msg = {'x': ts, 'y': value};
  return msg.reverse();
};


exports.XMLActuationDataParser = function( xmlData ) {

  let $     = cheerio.load( xmlData );
  let ts    = $('InfoItem[name=Status] value').attr('datetime');
  // let ts2    = $('InfoItem[name=Temperature] value').attr('unixtime');
  let value = $('InfoItem[name=Status] value').text();

  //   let toto = $('id').filter(function(i, el) {
  //   // this === el
  //   return $(this).text() === 'Left_Zone';
  // }).siblings().find('infoitem value').text();

  let msg = {'x': ts, 'y': value};
  return msg;
};
