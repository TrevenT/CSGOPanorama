'use strict';


var EOM_Drops = (function () {

	var _m_pauseBeforeEnd = 1;
	var _m_cP = $.GetContextPanel();


                                                     

	_m_cP.Data().m_retries = 0;

	var _DisplayMe = function()
	{

		var oDropList = _m_cP.DropListJSO;
		var numDrops = Object.keys( oDropList ).length;

		if ( numDrops === 0 )
		{
			return false;
		}

		var animTime = 0;

		                                                                      
		Object.keys( oDropList ).forEach( function( key, index )
		{
			$.Schedule( animTime, function()
			{
				var elDropContainer = $.CreatePanel( "Panel", _m_cP, "drop_" + index );
				elDropContainer.BLoadLayoutSnippet( "eom-drops__item" );

				var itemId = oDropList[ key ].item_id;

				itemId = InventoryAPI.IsItemInfoValid( itemId ) ? itemId : oDropList[ key ].faux_item_id;

				         
				var color = ItemInfo.GetRarityColor( itemId );
				if ( color )
				{
					elDropContainer.FindChildInLayoutFile( 'id-item-rarity' ).style.backgroundColor = color;
				}

				elDropContainer.FindChildInLayoutFile( 'id-item-rarity' ).AddClass( 'reveal' );

				             
				elDropContainer.FindChildInLayoutFile( 'id-item-image' ).itemid = itemId;

				            
				var fmtName = ItemInfo.GetFormattedName( itemId );
				fmtName.SetOnLabel( elDropContainer.FindChildInLayoutFile( 'id-item-name' ) );

				              
				var elOwnerLabel = elDropContainer.FindChildInLayoutFile( "id-item-owner-name" );
				elOwnerLabel.AddClass( "eom-drops__item__owner" );
				elOwnerLabel.SetDialogVariable( 'user_name', GameStateAPI.GetPlayerName( oDropList[ key ].owner_xuid ) );
				
				if ( oDropList[ key ].is_local )
				{
					elOwnerLabel.AddClass( 'localplayer' );
				}

				                                                 
				                                    
				TintSprayIcon.CheckIsSprayAndTint( itemId, elDropContainer.FindChildInLayoutFile( 'id-item-image' ) );

				var elOwnerAvatar = elDropContainer.FindChildInLayoutFile( "id-avatar" );
				elOwnerAvatar.steamid = oDropList[ key ].owner_xuid;

				         
				var rarityVal = InventoryAPI.GetItemRarity( itemId );
				var soundEvent = "ItemDropCommon";
				if ( oDropList[ key ].is_local && rarityVal < 3 )
				{
					soundEvent = "ItemRevealSingleLocalPlayer";
				}
				else if ( rarityVal == 4 )
				{
					soundEvent = "ItemDropUncommon";
				}
				else if ( rarityVal == 5 ) 
				{
					soundEvent = "ItemDropRare";
				}
				else if ( rarityVal == 6 ) 
				{
					soundEvent = "ItemDropMythical";
				}
				else if ( rarityVal == 7 )
				{
					soundEvent = "ItemDropLegendary";
				}
				else if ( rarityVal == 8 ) 
				{
					soundEvent = "ItemDropAncient";
				}

				$.Schedule( 0.5, function() { elDropContainer.AddClass( 'blendmode' ); } );

				var dropWidth = 220;
				_m_cP.style.width = ( dropWidth * ( index + 1 ) ) + 'px';

				$.DispatchEvent( "PlaySoundEffect", soundEvent, "MOUSE" );
				elDropContainer.ScrollParentToMakePanelFit( 2, false );

				                                                                       
				                                                                          
				if ( index === ( numDrops - 1 ) && index > 4 )
				{
					_m_cP.AddClass( 'showscroll' );
				}
			} );

			animTime += oDropList[ key ].display_time;
		} );

		_m_pauseBeforeEnd += animTime;

		return true;
	};

	                                                         
	                                                                      
	  
	  

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
		name: 'eom-drops',
		Start: _Start,
		Shutdown: _Shutdown,
	};

})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Drops );

})();
