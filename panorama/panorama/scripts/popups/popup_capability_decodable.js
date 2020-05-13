'use-strict';

              
                                                
             

var CapabilityDecodable = ( function()
{
	var m_aItemsInLootlist = [];
	var m_scrollListsPanelIds = [ 'ScrollList', 'ScrollListMagnified' ];
	var m_caseId = '';
	var m_itemFromContainer = '';
	var m_Inspectpanel = $.GetContextPanel();
	var m_keyId = '';
	var m_keytoSellId = '';
	var m_isKeyless = false;
	var m_storeItemId = '';
	var m_unusualItemImagePath = '';
	
	var _Init = function()
	{
		var strMsg = $.GetContextPanel().GetAttributeString( "key-and-case", "" );
		                

		var idList = strMsg.split( ',' );
		m_caseId = idList[ 1 ];
		m_keyId = idList[ 0 ];

		                                           
		if ( !m_keyId )
		{
			var associatedItemCount = InventoryAPI.GetAssociatedItemsCount( m_caseId );

			if ( !InventoryAPI.IsItemInfoValid( m_caseId ) )
			{
				return;
			}

			m_storeItemId = $.GetContextPanel().GetAttributeString( "storeitemid", "" );
			if (( associatedItemCount === 0 || !associatedItemCount ) && !m_storeItemId )
			{
				                                                           
				m_isKeyless = true;
			}
			else if( !m_storeItemId )
			{
				                                                      
				m_keytoSellId = InventoryAPI.GetAssociatedItemIdByIndex( m_caseId, 0 );
			}
		}
		else
		{
			                 
			if ( !InventoryAPI.IsItemInfoValid( m_keyId ) )
			{
				return;
			}
		}

		_SetUpPanelElements();
		$.DispatchEvent( 'CapabilityPopupIsOpen', true );
	};

	var _SetUpPanelElements = function( )
	{
		                                                                            
		if ( !m_keyId )
		{
			$.GetContextPanel().SetAttributeString( 'asyncworkitemwarning', 'no' );
			$.GetContextPanel().SetAttributeString( 'asyncactiondescription', 'no' );
		}
		else
		{
			$.GetContextPanel().SetAttributeString( 'toolid', m_keyId );
			$.GetContextPanel().SetAttributeString( 'asyncworkitemwarning', 'yes' );
			$.GetContextPanel().SetAttributeString( 'asyncactiondescription', 'yes' );
		}

		if ( m_isKeyless )
		{
			$.GetContextPanel().SetAttributeString( 'decodeablekeyless', 'true' );
			$.GetContextPanel().SetAttributeString( 'asyncworkitemwarning', 'yes' );
			$.GetContextPanel().SetAttributeString( 'asyncactiondescription', 'no' );
		}

		_SetupHeader( m_caseId );
		_SetCaseModelImage( m_caseId );
		_ShowPurchase(( m_keyId ) ? '' : m_keytoSellId );
		_SetUpAsyncActionBar( m_caseId );
		_SetCaseModelCamera( 1, false );

		if( !ItemInfo.ItemMatchDefName( m_caseId, 'spray' ) )
		{
			_PlayCaseModelAnim( 'fall', 'idle' );
			_PlayContainerSound( m_caseId, 'fall' );
		}

		_SetLootListItems( m_caseId, m_keyId );

	};

	var _SetupHeader = function( caseId )
	{
		var elCapabilityHeaderPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpCapabilityHeader' );
		CapabiityHeader.Init( elCapabilityHeaderPanel, caseId, _GetSettingCallback );
	};

	var _GetSettingCallback = function( settingname, defaultvalue )
	{
		return m_Inspectpanel.GetAttributeString( settingname, defaultvalue );
	};

	                                                                                                    
	                                                    
	                                                                                                    
	var _SetCaseModelImage = function( caseId )
	{
		var elItemModelImagePanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectModelOrImage' );
		InspectModelImage.Init( elItemModelImagePanel, caseId, _GetSettingCallback );
	};

	var _PlayCaseModelAnim = function( anim, idle )
	{
		var elModel = InspectModelImage.GetModelPanel();
		elModel.QueueSequence( anim, true );
		elModel.QueueSequence( idle , false );
	};

	var _SetCaseModelCamera = function( preset, shouldTransition )
	{
		var elModel = InspectModelImage.GetModelPanel();
		elModel.SetCameraPreset( preset, shouldTransition );
	};

	                                                                                                    
	              
	                                                                                                    
	var _SetUpAsyncActionBar = function( itemId )
	{
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		
		InspectAsyncActionBar.Init(
			elAsyncActionBarPanel,
			itemId,
			_GetSettingCallback
		);
	};

	var _ShowPurchase = function( m_keytoSellId )
	{
		var elPurchase = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectPurchaseBar' );

		InpsectPurchaseBar.Init(
			elPurchase,
			m_keytoSellId,
			_GetSettingCallback
		);
	};

	                                                                                                    
	                
	                                                                                                    
	var _SetLootListItems = function( caseId, keyId )
	{
		var count = ItemInfo.GetLootListCount( caseId );
		var elLootList = $.GetContextPanel().FindChildInLayoutFile( 'DecodableLootlist' );

		if ( count === 0 )
		{
			_ShowHideLootList( false );
			return;
		}

		var elImage = InspectModelImage.GetImagePanel();
		elImage.AddClass( 'y-offset' );

		_ShowHideLootList( true );
		for ( var i = 0; i < count; i++ )
		{
			var itemid = ItemInfo.GetLootListItemByIndex( caseId, i );
			var elItem = elLootList.FindChildInLayoutFile( itemid );
			
			if ( !elItem )
			{
				                                                            

				var elItem = $.CreatePanel( 'Panel', elLootList, itemid );
				elItem.SetAttributeString( 'itemid', itemid );
				elItem.BLoadLayoutSnippet( 'LootListItem' );

				_UpdateLootListItemInfo( elItem, itemid, caseId );
				elItem.SetPanelEvent( 'onactivate', _OnActivateLootlistTile.bind( undefined, itemid, caseId, keyId ) );
				elItem.SetPanelEvent( 'oncontextmenu', _OnActivateLootlistTile.bind( undefined, itemid, caseId, keyId ) );

				if ( itemid !== '0' )
				{
					m_aItemsInLootlist.push( {
						id: itemid,
						weight: _GetDisplayWeightForScroll( itemid ),
					} );
				}
			}
		}
	};

	var _OnActivateLootlistTile = function( itemid, caseId, keyId )
	{
		if ( !InventoryAPI.IsValidItemID( itemid ) )
			return;

		                                 
		InventoryAPI.PrecacheCustomMaterials( itemid );

		var callBackFunc = function( itemid, caseId, keyId  )
		{
			$.DispatchEvent( 'ContextMenuEvent', '' );
			_ClosePopUp();

			var additionalParams = ( m_storeItemId ) ? m_storeItemId : '';
			
			$.DispatchEvent(
				"LootlistItemPreview",
				itemid,
				keyId + ',' + caseId + ',' + additionalParams
			);
		};

		var items = [];
		items.push( { label: 'Inspect', jsCallback: callBackFunc.bind( undefined, itemid, caseId, keyId ) } );
		UiToolkitAPI.ShowSimpleContextMenu( '', 'ControlLibSimpleContextMenu', items );
	};

	var _GetDisplayWeightForScroll = function( itemid )
	{
		var rarityVal = InventoryAPI.GetItemRarity( itemid );
		                                                         
		var displayItemWeight = [ 150000, 30000, 6000, 1250, 250, 50, 10 ];

		return displayItemWeight[ rarityVal ];
	};

	var _UpdateLootListItemInfo = function( elItem, itemid, caseId )
	{
		if ( itemid == '0' )
		{
			                                                                  
			m_unusualItemImagePath = InventoryAPI.GetLootListUnusualItemImage( caseId ) + ".png";
			_UpdateUnusualItemInfo( elItem, caseId, m_unusualItemImagePath );

		}
		else
		{
			elItem.FindChildInLayoutFile( 'ItemImage' ).itemid = itemid;
			elItem.FindChildInLayoutFile( 'JsRarity' ).style.backgroundColor = ItemInfo.GetRarityColor( itemid );
			elItem.FindChildInLayoutFile( 'JsItemName' ).text = ItemInfo.GetName( itemid );
		}
	};

	var _ShowHideLootList = function( bshow )
	{
		var elLootListContainer = $.GetContextPanel().FindChildInLayoutFile( 'DecodableLootlistContainer' );
		elLootListContainer.SetHasClass( 'hidden', !bshow );
	};

	var _UpdateUnusualItemInfo = function( elItem, caseId, unusualItemImagePath )
	{
		elItem.FindChildInLayoutFile( 'ItemImage' ).SetImage( "file://{images_econ}/" + unusualItemImagePath );
		elItem.FindChildInLayoutFile( 'JsRarity' ).AddClass( 'popup-decodable-wash-color-unusual' );

		var elBg = elItem.FindChildInLayoutFile( 'ItemTileBg' );

		if( elBg )
			elBg.AddClass( 'popup-decodable-wash-color-unusual-bg' );

		var elName = elItem.FindChildInLayoutFile( 'JsItemName' );
		if ( elName )
			elName.text = InventoryAPI.GetLootListUnusualItemName( caseId );
	};

	                                                                                                    
	                  
	                                                                                                    
	var _SetUpCaseOpeningScroll = function()
	{
		_ShowHideLootList( false );

		var elImage = InspectModelImage.GetImagePanel();
		var elCase = null;
		var delay = 0;
		
		if ( !elImage.BHasClass( 'hidden' ) )
		{
			elImage.RemoveClass( 'y-offset' );
			elCase = elImage;
			delay = 0.1;
		}
		else
		{
			$.Schedule( 1, _PlayCaseModelAnim.bind( undefined, 'open', 'openidle' ) );
			_SetCaseModelCamera( 3, true );
			
			elCase = InspectModelImage.GetModelPanel();
			delay = 2.3;
		}

		$.Schedule( delay, _ShowScroll.bind( undefined, elCase ) );
	};

	var _ShowScroll = function( elCase )
	{
		var elScroll = $.GetContextPanel().FindChildInLayoutFile( 'DecodableItemsScroll' );
		elScroll.RemoveClass( 'hidden' );
		
		elCase.AddClass( 'popup-inspect-modelpanel_darken_blur' );

		
		_FillScrollsWithItems( m_scrollListsPanelIds );
		$.Schedule( 0.1, _PlayScrollAnim.bind( undefined, m_scrollListsPanelIds ) );
	};

	var _PlayScrollAnim = function( scrolllists )
	{
		var targetId = 'ItemFromContainer';

		var xOffsetSlackPercent = (Math.floor( Math.random() * ( ( 90 ) - 10 + 1 ) + 10 )/100 );
		
		scrolllists.forEach( element =>
		{
			var xPos = _GetStopPostion( $.GetContextPanel().FindChildInLayoutFile( element ), targetId, xOffsetSlackPercent );
			var elScroll = $.GetContextPanel().FindChildInLayoutFile( element );
			elScroll.ScrollToFitRegion( xPos, xPos, 0, 0, 3, true, false );
		} );
		
		$.Schedule( 6, _ShowInspect );

		var itemDefName = ItemInfo.GetItemDefinitionName( m_caseId );

		var soundEventName = "container_weapon_ticker";
		if(itemDefName && itemDefName.indexOf("sticker") != -1) {
			soundEventName = "container_sticker_ticker";
		}
			

		for(var i = 0; i < _TickSoundIntervals.length; ++i) {
			$.Schedule( _TickSoundIntervals[i], _ScrollTick.bind(undefined, soundEventName));
		}
	};

	                                                                                                                                 
	var _TickSoundIntervals = [ 0.000, 0.063, 0.125, 0.188, 0.250, 0.313, 0.375, 0.438, 0.500, 0.563, 0.625, 0.688, 0.750, 0.813, 0.875, 0.938, 1.000, 1.063, 1.125, 1.188, 1.250, 1.313, 1.375, 1.483, 1.351, 1.620, 1.701, 1.786, 1.872, 2.003, 2.154, 2.313, 2.466, 2.615, 2.773, 2.941, 3.104, 3.339, 3.630, 3.953, 4.385, 5.004, ];

	var _ScrollTick = function(soundEventName)
	{
		$.DispatchEvent( "PlaySoundEffect", soundEventName, "MOUSE" );

	};

	var _GetStopPostion = function( elParent, targetId, xOffsetSlackPercent )
	{
		var elTile = elParent.FindChildInLayoutFile( targetId );
		var tileWidth = elTile.contentwidth;

		return ( elTile.actualxoffset + ( tileWidth * xOffsetSlackPercent ));
	};

	var _ShowInspect = function()
	{
		if( m_itemFromContainer )
		{
			                                                                                
			                                                                                         
			                                                                                                 
			                                            
			InventoryAPI.SetItemSessionPropertyValue( m_itemFromContainer, 'recent', '1' );
			InventoryAPI.AcknowledgeNewItembyItemID( m_itemFromContainer );

			CapabilityDecodable.ClosePopUp();
			$.DispatchEvent( "InventoryItemPreview", m_itemFromContainer );

			var rarityVal = InventoryAPI.GetItemRarity( m_itemFromContainer );
			var soundEvent = "ItemRevealRarityCommon";
			if( rarityVal == 4 ) {
				soundEvent = "ItemRevealRarityUncommon";
			} else if( rarityVal == 5 ) {
				soundEvent = "ItemRevealRarityRare";
			} else if( rarityVal == 6 ) {
				soundEvent = "ItemRevealRarityMythical";
			} else if( rarityVal == 7 ) {
				soundEvent = "ItemRevealRarityLegendary";
			} else if( rarityVal == 8 ) {
				soundEvent = "ItemRevealRarityAncient";
			}

			$.DispatchEvent( "PlaySoundEffect", soundEvent, "MOUSE" );
		}
		else
		{
			CapabilityDecodable.ClosePopUp();
			
			                                                               
			UiToolkitAPI.ShowGenericPopupOk(
				$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
				$.Localize( '#SFUI_InvError_Item_Not_Given' ),
				'',
				function()
				{
				},
				function()
				{
				}
			);
		}
	};
	
	                                                                                                    
	                         
	                                                                                                    
	var _FillScrollsWithItems = function( lists )
	{
		var numTilesInScroll = 38;
		var indexItemsFromContainer = 3;
		var indexStart = ( numTilesInScroll - 3 );

		var totalWeight = 0;
		m_aItemsInLootlist.forEach( element =>
			{
				totalWeight += element.weight;
		} );
		
		var displayItemsList = [];
		
		for ( var i = 0; i < numTilesInScroll; i++ )
		{
			displayItemsList.push( GetItemBasedOnDisplayWeight( totalWeight, m_aItemsInLootlist ));
		}
		
		lists.forEach( element =>
		{
			var elParent = $.GetContextPanel().FindChildInLayoutFile( element );

			for ( var i = 0; i < numTilesInScroll; i++ )
			{
				var itemId = displayItemsList[ i ];
				var tileId = ( i === indexItemsFromContainer ) ? 'ItemFromContainer' : ( i === indexStart ) ? 'ItemStart' : itemId;

				var elTile = $.CreatePanel( 'Panel', elParent, tileId );
				elTile.BLoadLayoutSnippet( 'ScrollItem' );

				_UpdateScrollTile( element, elTile, itemId );
			}
		});
	};

	var _UpdateScrollTile = function ( listId, elTile, itemId )
	{
		if ( listId === 'ScrollListMagnified' )
		{
			elTile.AddClass( 'magnified' );
		}

		                                                                                 
		itemId = ( elTile.id === 'ItemFromContainer' && m_itemFromContainer ) ? m_itemFromContainer : itemId;

		if ( InventoryAPI.IsItemUnusual( itemId ) && m_unusualItemImagePath )
		{	
			_UpdateUnusualItemInfo( elTile, m_caseId, m_unusualItemImagePath );
			                                                                                                          
		}
		else
		{
			elTile.FindChildInLayoutFile( 'ItemImage' ).itemid = itemId;
			elTile.FindChildInLayoutFile( 'JsRarity' ).style.washColor = ItemInfo.GetRarityColor( itemId );
			elTile.FindChildInLayoutFile( 'JItemTint' ).style.washColor = ItemInfo.GetRarityColor( itemId );
		}
	};

	var GetItemBasedOnDisplayWeight = function( totalWeight, aItemsInLootlist )
	{
		                                         
		var weightOfItem = 0;
		
		var Random = Math.floor( Math.random() * totalWeight );

		for ( var i = 0; i < aItemsInLootlist.length; i++ )
		{
			weightOfItem += aItemsInLootlist[ i ].weight;
			
			if ( Random <= weightOfItem )
				return aItemsInLootlist[ i ].id;
		}	
	};

	                                                                                                    
	            
	                                                                                                    
	var _SetUpCaseOpeningCountdown = function()
	{
		_UpdateOpeningCounter.ShowCounter();
		_UpdateOpeningCounter.UpdateCounter();
		_ShowHideLootList( false );
	};

	var _UpdateOpeningCounter = (function()
	{
		var counterVal = 6;
		var elCountdown = $.GetContextPanel().FindChildInLayoutFile( 'DecodableCountdown' );
		var elCountdownLabel = elCountdown.FindChildInLayoutFile( 'DecodableCountdownLabel' );
		var elCountdownRadial = elCountdown.FindChildInLayoutFile( 'DecodableCountdownRadial' );
		var timerHandle = null;

		var _UpdateCounter = function()
		{
			timerHandle = null;
			counterVal = counterVal - 1;

			if ( counterVal === 0 )
			{
				                                      
				elCountdown.AddClass( 'hidden' );
				_ShowInspect();
			}
			else
			{
				elCountdownLabel.text = counterVal;

				elCountdownLabel.RemoveClass( 'popup-countdown-anim' );
				elCountdownLabel.AddClass( 'popup-countdown-anim' );

				elCountdownRadial.RemoveClass( 'popup-countdown-timer-circle-anim' );
				elCountdownRadial.AddClass( 'popup-countdown-timer-circle-anim' );

				timerHandle = $.Schedule( 1, _UpdateCounter );
			}
		};

		var _ShowCounter = function()
		{
			elCountdown.RemoveClass( 'hidden' );
		};

		var _CancelTimer = function()
		{
			if ( timerHandle )
			{
				$.CancelScheduled( timerHandle );
				timerHandle = null;
			}
		};

		return {
			UpdateCounter: _UpdateCounter,
			ShowCounter: _ShowCounter,
			CancelTimer: _CancelTimer
		};
	} )();
	
	                                                                                                    
	                        
	                                                                                                   
	var _UpdateScrollResultTile = function( numericType, type, itemId )
	{
		                                                                     
		
		                                               
		                                 
		                                     
		                                                           

		if ( type === "crate_unlock" || type === 'graffity_unseal' )
		{
			m_itemFromContainer = itemId;

			                                                                                         
			if ( $.GetContextPanel().FindChildInLayoutFile( 'DecodableItemsScroll' ).BHasClass( 'hidden' ) )
			{
				return;
			}
			else
			{
				                                                                                                                 
				m_scrollListsPanelIds.forEach( element =>
				{
					var elScroll = $.GetContextPanel().FindChildInLayoutFile( element );
					var elTile = elScroll.FindChildInLayoutFile( 'ItemFromContainer' );
					_UpdateScrollTile( element, elTile, itemId );
				} );
			}
		}
	};

	var _ItemAcquired = function( ItemId )
	{
		$.DispatchEvent( "PlaySoundEffect", "rename_purchaseSuccess", "MOUSE" );
		
		if ( !m_keyId && m_keytoSellId )
		{
			var matchtingKeyDefName = ItemInfo.GetItemDefinitionName( m_keytoSellId );
			
			if (  ItemInfo.ItemMatchDefName( ItemId, matchtingKeyDefName ) )
			{
				m_keyId = ItemId;
				$.DispatchEvent( 'HideStoreStatusPanel', '' );
				_AcknowlegeMatchingKeys( matchtingKeyDefName );
				_SetUpPanelElements();
			}
		}
		else if( m_storeItemId )
		{
			_ClosePopUp();
			$.DispatchEvent( 'ShowAcknowledgePopup', '', ItemId );
			$.DispatchEvent( 'HideStoreStatusPanel', '' );
		}
	};

	var _AcknowlegeMatchingKeys = function( matchtingKeyDefName )
	{
		var itemCount = InventoryAPI.GetUnacknowledgeItemsCount();
		var newItemsList = [];

		for ( var i = 0; i < itemCount; i++ )
		{
			var newItemId = InventoryAPI.GetUnacknowledgeItemByIndex( i );
			newItemsList.push( newItemId );
		}

		newItemsList.forEach( itemId => 
		{
			if ( ItemInfo.ItemMatchDefName( itemId, matchtingKeyDefName ) )
			{
				InventoryAPI.AcknowledgeNewItembyItemID( itemId );
				InventoryAPI.SetItemSessionPropertyValue( itemId, 'recent', '1' );
			}
		} );
	};

	var _ShowUnlockAnimation = function()
	{
		var lootListCount = InventoryAPI.GetLootListItemsCount( m_caseId );

		if ( lootListCount <= 1 )
		{
			_SetUpCaseOpeningCountdown();
		}
		else
		{
			_SetUpCaseOpeningScroll();
		}

		_PlayContainerSound( m_caseId, 'open' );

		_PlayContainerSound( m_caseId, 'ticker' );
	};

	var _PlayContainerSound = function(caseId, soundName) {
		$.DispatchEvent( "PlaySoundEffect", "container_" + _GetContainerType(caseId) + "_" + soundName, "MOUSE" );
	};

	var _GetContainerType = function(caseId) {
		var itemDefName = ItemInfo.GetItemDefinitionName( m_caseId );
		var slot = ItemInfo.GetSlot( m_caseId );
		if(itemDefName && itemDefName.indexOf("spray") != -1) {
			return 'graffiti';
		} else if(itemDefName && itemDefName.indexOf("sticker") != -1) {
			return 'sticker';
		} else if(itemDefName && itemDefName.indexOf("coupon") == 0) {
			return 'music';
		} else {
			return 'weapon';
		}
	};

	var _ClosePopUp = function()
	{
		if ( m_Inspectpanel.IsValid() )
		{ 
			var elAsyncActionBarPanel = m_Inspectpanel.FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
			var elPurchase = m_Inspectpanel.FindChildInLayoutFile( 'PopUpInspectPurchaseBar' );
			if ( !elAsyncActionBarPanel.BHasClass( 'hidden' ) )
			{
				InspectAsyncActionBar.OnEventToClose();
			}
			else if ( !elPurchase.BHasClass( 'hidden' ) ) 
			{
				InpsectPurchaseBar.ClosePopup();
			}

		}

		_UpdateOpeningCounter.CancelTimer();
	};
	
	return {
		Init: _Init,
		SetUpCaseOpening: _SetUpCaseOpeningScroll,
		ClosePopUp: _ClosePopUp,
		UpdateScrollResultTile: _UpdateScrollResultTile,
		ItemAcquired: _ItemAcquired,
		ShowUnlockAnimation: _ShowUnlockAnimation
	};
} )();

( function()
{
	                             
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_ItemCustomizationNotification', CapabilityDecodable.UpdateScrollResultTile );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PurchaseCompleted', CapabilityDecodable.ItemAcquired );
	$.RegisterForUnhandledEvent( 'StartDecodeableAnim', CapabilityDecodable.ShowUnlockAnimation );
} )();
