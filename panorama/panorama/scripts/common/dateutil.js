'use strict';


    	              										    				  
    	    												    				        
    	         											    				        
    	             										     				             
    	            										      				  
    	             										      				 
    	           											      				   
    	            										      				  
    	                    								      				 
    	                									    				            
    	                                                	      				 
    	            										    				  
    	                  									      				 
    	                  									      				  
    	                    								      				 
    	                    								      				  
    	              										      				  
    	                									      				  
    	           											      				   
    	         											                 	                                     
    	         											                 	     
    	         											                  	                  

var DateUtil = ( function()
{

	          
	function _UUU_dd ( date )
	{
		return $.Localize( 'LOC_Date_DayShort' + date.getDay() ) + " " + date.getDate();
	}

	          
	function _MMM_dd ( date )
	{
		var monthPaddedNumber = ( '0' + ( date.getMonth() + 1 ) ).slice( -2 );
		return $.Localize( $.Localize( 'MonthName' + monthPaddedNumber + '_Short' ) + " " + date.getDate());
	}
	
	              
	function _UUU_MMM_dd ( date )
	{
		var monthPaddedNumber = ( '0' + ( date.getMonth() + 1 ) ).slice( -2 );
		return $.Localize( 'LOC_Date_DayShort' + date.getDay() ) + " " + $.Localize( 'MonthName' + monthPaddedNumber + '_Short' ) + " " + date.getDate();
	}

	            
	function _FullMonthName ( date )
	{
		var monthPaddedNumber = ( '0' + ( date.getMonth() + 1 ) ).slice( -2 );
		return $.Localize( 'MonthName' + monthPaddedNumber + '_Long' );
	}

	function _FullMonth_dd ( date )
	{
		var monthPaddedNumber = ( '0' + ( date.getMonth() + 1 ) ).slice( -2 );
		return $.Localize( 'MonthName' + monthPaddedNumber + '_Long' ) + " " + date.getDate();
	}
	


	return {
		UUU_MMM_dd: 		_UUU_MMM_dd,
		UUU_dd:				_UUU_dd,
		MMM_dd: 			_MMM_dd,
		FullMonthName: 		_FullMonthName,
		FullMonth_dd: 		_FullMonth_dd
		
	}


})();

(function()
{
})();

