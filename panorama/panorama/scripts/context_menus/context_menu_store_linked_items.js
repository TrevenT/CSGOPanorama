'use strict';

var StoreLinkedItems = ( function()
{

	function _Init ()
	{
		var itemId = $.GetContextPanel().GetAttributeString( "itemids", "" );
		var aItemIds = itemId.split(',');

		                              
		var elItem = null;

		for( var i = 0; i < aItemIds.length; i++ )
		{
			var elItem = $.GetContextPanel().FindChildInLayoutFile( aItemIds[ i ] );

			if( !elItem )
			{
				elItem = $.CreatePanel( 'Button', $.GetContextPanel(), aItemIds[ i ] );
				
				elItem.Data().oData = {
					id: aItemIds[ i ],
					isMarketItem: false
				}
		
				elItem.BLoadLayout( "file://{resources}/layout/mainmenu_store_tile.xml", false, false );
			}
		}
	}

	return {
		Init: _Init,
	}

})();

(function()
{

})();