var cheerio = require('cheerio');
var moment  = require('moment');

exports.XMLdataParser = function( xmlData ) {

  let $     = cheerio.load( xmlData );
  let ts    = $('InfoItem[name=Value] value').attr('datetime');
  let value = $('InfoItem[name=Value] value').text();
  let msg = {'x': ts, 'y': value};

  return msg;

};

exports.XMLboostrapDataParser = function( xmlData, zone ) {

  let $     = cheerio.load( xmlData );
  let ts    = $('InfoItem[name=Value] value').attr('datetime');
  let value = $('InfoItem[name=Value] value').text();

  let selectedZoneData = $('id').filter(function(i, el) {
    return $(this).text() === zone;
  }).siblings().find('infoitem value');

  let msg = new Array();

  selectedZoneData.map(function(index, x) {
     msg.push( {'x': $(this).attr('datetime'), 'y': $(this).text()} );
  });

  return msg.reverse();

};

exports.XMLActuationDataParser = function( xmlData ) {

  let $     = cheerio.load( xmlData );
  let ts    = $('InfoItem[name=Status] value').attr('datetime');
  let value = $('InfoItem[name=Status] value').text();
  let msg = {'x': ts, 'y': value};

  return msg;

};
