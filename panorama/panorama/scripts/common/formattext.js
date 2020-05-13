                                                               

"use strict";

var FormatText = ( function ()
{
	var _RemoveItemTypeFromName = function ( name )
	{
		return _GetSectionOfStringAfterSpecifiedLocation( name, "| " );
	}
	
	var _GetSectionOfStringAfterSpecifiedLocation = function ( originalString, location )
	{
		                                                    
		                                          
	
		var index = originalString.indexOf( location );
		return originalString.substring ( index + 1 );
	}

	var _GetInventoryDisplayStringFromName = function ( name )
	{
		                                                                                                                             
		if ( name.indexOf("|  ") != -1 )
			var nameParts = name.split("|  ", 2);
		else if ( name.indexOf("| ") != -1 )
			var nameParts = name.split("| ", 2);
		else
			var nameParts = new Array( name );
		
		return _GetSeperateNameString( nameParts );
	}

	function _GetSeperateNameString( nameParts )
	{
		if ( nameParts.length == 1 )
		{
			return '<span class=\"fontWeight-Bold\">' + nameParts[0] + '</span>';
		}
		else
			return '<span class=\"fontWeight-Bold\">' + nameParts[0] + '</span>' + '<br>'+ nameParts[1];
	}
	
	                                

	var _SecondsToDDHHMMSSWithSymbolSeperator = function( rawSeconds )
	{
		var time = _ConvertSecondsToDaysHoursMinSec( rawSeconds );
		var timeText = [];
		
		var returnRemaining = false;
		for( var key in time )
		{
			                                     
			                                 
			if(( time[key] > 0 &&  !returnRemaining ) || key == 'minutes' )
				returnRemaining = true;

			if( returnRemaining )
			{
				var valueToShow = ( time[key] < 10 ) ? ( '0' + time[key].toString()) : time[key].toString();
				timeText.push( valueToShow );
			}
		}

		return timeText.join( ':' );
	}

	var _SecondsToSignificantTimeString = function( rawSeconds )
	{
		var time = _ConvertSecondsToDaysHoursMinSec( rawSeconds );
		var numComponentsReturned = 0;
		var strResult = '';
		for( var key in time )
		{
			if ( key == 'seconds' )
				break;

			var bAppendThisComponent = false;
			var bFinishedAfterThisComponent = ( numComponentsReturned > 0 );
			if ( time[key] > 0 )
			{
				bAppendThisComponent = true;
			}
			if ( bAppendThisComponent )
			{
				if ( bFinishedAfterThisComponent )
					strResult += ' ';

				var lockey;
				if ( key == 'minutes' )
					lockey = '#SFUI_Store_Timer_Min';
				else if ( key == 'hours' )
					lockey = '#SFUI_Store_Timer_Hour';
				else
					lockey = '#SFUI_Store_Timer_Day';

				strResult += time[key].toString();
				strResult += ' ';
				
				strResult += $.Localize( lockey + ( ( time[key] > 1 ) ? 's' : '' ) );

				++ numComponentsReturned;
			}
			if ( bFinishedAfterThisComponent )
				break;
		}
		return strResult;
	}

	var _ConvertSecondsToDaysHoursMinSec = function ( rawSeconds )
	{
		rawSeconds = Number( rawSeconds );
		
		var time = {
			days : Math.floor( rawSeconds / 86400 ),
			hours : Math.floor(( rawSeconds % 86400 ) / 3600),
			minutes : Math.floor((( rawSeconds % 86400 ) % 3600 ) / 60 ),
			seconds : (( rawSeconds % 86400) % 3600 ) % 60
		}

		return time;
	}


	var _PadNumber = function( integer, digits, char = '0' ) 
	{ 
		integer = integer.toString()

		while ( integer.length < digits) 
			integer = char + integer; 
		
		return integer;
	}

	return{
		SecondsToDDHHMMSSWithSymbolSeperator		: _SecondsToDDHHMMSSWithSymbolSeperator,                    
		SecondsToSignificantTimeString				: _SecondsToSignificantTimeString,                                               
		RemoveItemTypeFromName						: _RemoveItemTypeFromName,                      
		PadNumber									: _PadNumber,                                                                               
		GetSectionOfStringAfterSpecifiedLocation: _GetSectionOfStringAfterSpecifiedLocation,
		GetInventoryDisplayStringFromName			: _GetInventoryDisplayStringFromName                                                  
	};
})();