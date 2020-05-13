                                                               

"use strict";

                                           
  
                         
                                  
               
                                 
               
         
      
  
                                                                                                     
                                                                                                    
                                                       
   

var CFormattedText = class {
    constructor( strLocTag, mapDialogVars ) {
        this.tag = strLocTag;

                                                                 
        this.vars = Object.assign({}, mapDialogVars);
    }

    SetOnLabel( elLabel ) {
        FormatText.SetFormattedTextOnLabel(elLabel, this);
    }
};

var FormatText = ( function ()
{
    var _SetFormattedTextOnLabel = function ( elLabel, fmtText ) {
        _ClearFormattedTextFromLabel( elLabel );

        elLabel.text = fmtText.tag;
        elLabel.fmtTextVars = {};
        for ( var varName in fmtText.vars )
        {
            elLabel.SetDialogVariable( varName, fmtText.vars[varName] );
            elLabel.fmtTextVars[varName] = true;
        }
    }

    var _ClearFormattedTextFromLabel = function ( elLabel ) {
        elLabel.text = '';

        if( !elLabel.fmtTextVars )
            return;

        for( var varName in elLabel.fmtTextVars )
        {
                                                                            
            elLabel.SetDialogVariable(varName, '');
        }

                     
        delete elLabel.fmtTextVars;
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
		if ( rawSeconds < 60 )
			return '1 ' + $.Localize( '#SFUI_Store_Timer_Min' );

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
	    SetFormattedTextOnLabel                     : _SetFormattedTextOnLabel,                                                                 
	    ClearFormattedTextFromLabel                 : _ClearFormattedTextFromLabel,                                                                 
	    SecondsToDDHHMMSSWithSymbolSeperator		: _SecondsToDDHHMMSSWithSymbolSeperator,                    
		SecondsToSignificantTimeString				: _SecondsToSignificantTimeString,                                               
		PadNumber									: _PadNumber,                                                                               
	};
})();