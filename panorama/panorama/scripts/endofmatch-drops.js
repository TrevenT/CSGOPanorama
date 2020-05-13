'use strict';


var EOM_Drops = (function () {

	var _m_pauseBeforeEnd = 2.0;	
	var _m_cP = $.GetContextPanel();


                                                     

	_m_cP.Data().m_retries = 0;

	var _DisplayMe = function() {

		var oDropList = _m_cP.DropListJSO;

		if ( Object.keys( oDropList ).length == 0 )
		{
			return false;
		}

		var animTime = 0;

		                                                                      
		Object.keys( oDropList ).forEach( function (key, index) {

			$.Schedule( animTime, function() {

				var elDropContainer =  $.CreatePanel( "Panel", _m_cP, "drop_" + index );
				elDropContainer.BLoadLayoutSnippet( "eom-drops__item" );

				var elItem = elDropContainer.FindChild( "id-itemtile");	
				elItem.BLoadLayout( "file://{resources}/layout/itemtile.xml", true, false );

				var itemId = oDropList[ key ][ 'item_id' ];

				if ( InventoryAPI.IsItemInfoValid( itemId ) )
					elItem.SetAttributeString( 'itemid', oDropList[ key ][ 'item_id' ] );
				else
					elItem.SetAttributeString( 'itemid', oDropList[ key ][ 'faux_item_id' ] );
					elItem.SetAttributeString( 'loadimage', "1" );

				$.DispatchEvent( 'CSGOInventoryItemLoaded', elItem  );

				var elOwnerLabel = elDropContainer.FindChild( "id-item-owner-name" );	
				elOwnerLabel.AddClass( "eom-drops__item__owner" );
				elOwnerLabel.text = GameStateAPI.GetPlayerName( oDropList[ key ][ 'owner_xuid' ] );

				var rarityVal = InventoryAPI.GetItemRarity( itemId );
				var soundEvent = "ItemDropCommon";
				if( rarityVal == 4 ) {
					soundEvent = "ItemDropUncommon";
				} else if( rarityVal == 5 ) {
					soundEvent = "ItemDropRare";
				} else if( rarityVal == 6 ) {
					soundEvent = "ItemDropMythical";
				} else if( rarityVal == 7 ) {
					soundEvent = "ItemDropLegendary";
				} else if( rarityVal == 8 ) {
					soundEvent = "ItemDropAncient";
				}

				$.DispatchEvent( "PlaySoundEffect", soundEvent, "MOUSE" );
			});

			animTime += oDropList[ key ][ 'display_time' ];

		});

		_m_pauseBeforeEnd += animTime;

		return true;

	}

	                                                         
	                                                                      
	  
	  

	function _Start() 
	{
				
		if ( _DisplayMe() )
		{
			EndOfMatch.SwitchToPanel( 'eom-drops' );
			EndOfMatch.StartDisplayTimer( _m_pauseBeforeEnd );
			
			$.Schedule( _m_pauseBeforeEnd, _End );
		}
		else
		{
			_End();
		}	
	}

	function _End() 
	{
		$.DispatchEvent( 'EndOfMatch_ShowNext' );
	}

	function _Shutdown()
	{
	}


	                      
	return {
		
		Start: _Start,
		Shutdown: _Shutdown,
	};

})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Drops );

})();
