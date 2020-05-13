'use-strict';

var CapabilityCanSticker = ( function()
{
	var m_emptySlotList = null;
	var m_scheduleHandle = null;
	var m_isRemoveStickers = false;
	var m_SlotSelectedForScratch = null;
	var m_Stickerpanel = $.GetContextPanel();

	var _Init = function()
	{
		var strMsg = $.GetContextPanel().GetAttributeString( "sticker-and-itemtosticker", "(not found)" );
		                   

		var idList = strMsg.split( ',' );
		m_isRemoveStickers = idList[ 0 ] === 'remove' ? true : false;
		var itemId = idList[ 1 ];
		var toolId = m_isRemoveStickers ? '' : idList[ 0 ];
	
		if ( !m_isRemoveStickers )
			m_emptySlotList = _GetEmptyStickerSlots( _GetSlotInfo( itemId ) );
		
		_SetItemModel( toolId, itemId, m_isRemoveStickers );
		_SetTitle( m_isRemoveStickers );
		_SetDescText( itemId, m_isRemoveStickers );
		_SetWarningText( m_isRemoveStickers, toolId, itemId );
		_ShowStickerIconsToApplyOrRemove( m_isRemoveStickers, toolId, itemId );
		_SetUpAsyncActionBar( itemId, toolId );
		_StickerBtnActions( toolId, itemId, m_isRemoveStickers );

		$.DispatchEvent( 'CapabilityPopupIsOpen', true );
	};

	                                                                                                    
	                                        
	                                                                                                    
	var _SetItemModel = function( toolId, itemId, isRemoveStickers )
	{
		if ( !InventoryAPI.IsItemInfoValid( itemId ) )
		{
			return;
		}
		
		var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerItemModel' );
		var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( itemId ) + '?stickers';

		elPanel.SetAsActivePreviewPanel();
		elPanel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			modelPath,
			false );
		
		elPanel.Data().id = itemId;

		if ( !isRemoveStickers )
		{
			_PreviewStickerInSlot( toolId, _GetSelectedStickerSlot() );
		}
	};

	var _SetTitle = function( isRemoveStickers )
	{
		var elTitle = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerTitle' );
		elTitle.text = isRemoveStickers ?
			$.Localize( '#SFUI_InvContextMenu_can_sticker_Wear' ) :
			$.Localize( '#SFUI_InvContextMenu_sticker_use' );
	};

	var _SetDescText = function( itemId, isRemoveStickers )
	{
		var elDescLabel = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerDesc' );
		var currentName = ItemInfo.GetName( itemId );

		elDescLabel.SetDialogVariable( 'name', currentName );
		elDescLabel.text = isRemoveStickers ?
			$.Localize( '#popup_can_sticker_scrape', elDescLabel ) :
			$.Localize( '#popup_can_sticker_desc', elDescLabel );
	};

	var _SetWarningText = function( isRemoveStickers, toolId, itemId )
	{
		var elLabel = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerWarning' );
		var warningText = '';

		if ( isRemoveStickers )
		{
			warningText = $.Localize( '#SFUI_Sticker_Wear_How_To' );
		}
		else
		{
			warningText = _GetWarningTradeRestricted( elLabel, toolId, itemId );
			if ( !warningText )
			{
				warningText = $.Localize( '#SFUI_InvUse_Warning_use_can_sticker' );
			}
		}

		elLabel.text = warningText;
	};

	var _GetWarningTradeRestricted = function( elLabel, toolId, itemId )
	{
		         
		                                                                                                                           
		                                                                                                                                    
		var strSpecialWarning = '';
		var strSpecialParam = null;
		var bIsPerfectWorld = MyPersonaAPI.GetLauncherType() === "perfectworld" ? true : false;

		if ( !bIsPerfectWorld )
		{
			if ( InventoryAPI.IsMarketable( itemId ) )
			{
				if ( !InventoryAPI.IsMarketable( toolId ) )
				{
					strSpecialParam = InventoryAPI.GetItemAttributeValue( toolId, "tradable after date" );
					if ( strSpecialParam !== undefined && strSpecialParam !== null )
					{
						strSpecialWarning = _GetSpecialWarningString( strSpecialParam, "#popup_can_sticker_warning_marketrestricted" );
					}
				}
				else
				{
					strSpecialWarning = _GetStickerMarketDateGreater( elLabel, toolId, itemId );
				}
			}
		}
		else
		{
			strSpecialWarning = _GetStickerMarketDateGreater( elLabel, toolId, itemId );
		}
		
		return strSpecialWarning;
	}

	var _GetStickerMarketDateGreater = function( elLabel, toolId, itemId )
	{
		                                                                               
		var rtTradableAfterSticker = InventoryAPI.GetItemAttributeValue( toolId, "{uint32}tradable after date" );
		var rtTradableAfterWeapon = InventoryAPI.GetItemAttributeValue( itemId, "{uint32}tradable after date" );
		if ( rtTradableAfterSticker != undefined && rtTradableAfterSticker != null &&
			( rtTradableAfterWeapon == undefined || rtTradableAfterWeapon == null || rtTradableAfterSticker > rtTradableAfterWeapon ) )
		{
			var strSpecialParam = null;
			strSpecialParam = InventoryAPI.GetItemAttributeValue( toolId, "tradable after date" );
			if ( strSpecialParam != undefined && strSpecialParam != null )
			{
				return _GetSpecialWarningString( strSpecialParam, "#popup_can_sticker_warning_traderestricted" );
			}
		}

		return '';
	};

	var _GetSpecialWarningString = function( strSpecialParam, warningText )
	{
		var elLabel = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerWarning' );
		
		elLabel.SetDialogVariable( 'date', strSpecialParam );
		return $.Localize( warningText, elLabel );
	}

	var _ShowStickerIconsToApplyOrRemove = function( isRemoveStickers, toolId, itemId )
	{
		var elStickerToApply = $.GetContextPanel().FindChildInLayoutFile( 'StickerToAppy' );
		elStickerToApply.SetHasClass( 'hidden', isRemoveStickers );

		var elStickersToRemove = $.GetContextPanel().FindChildInLayoutFile( 'StickersToRemove' );
		elStickersToRemove.SetHasClass( 'hidden', !isRemoveStickers );

		if ( isRemoveStickers )
		{
			var slotCount = InventoryAPI.GetItemStickerSlotCount( itemId );
			
			for ( var i = 0; i < slotCount; i++ )
			{
				var imagePath = InventoryAPI.GetItemStickerImageBySlot( itemId, i );
				if ( imagePath )
				{
					var elSticker = $.CreatePanel( 'Button', elStickersToRemove, imagePath );
					elSticker.BLoadLayoutSnippet( 'ScrapeStickerBtn' );
					elSticker.FindChildInLayoutFile( 'ScrapeStickerImage' ).SetImage( 'file://{images_econ}' + imagePath + '_large.png' );
					elSticker.SetPanelEvent( 'onactivate', _OnScratchSticker.bind( undefined, elSticker, itemId, i ) );
				}
			}
		}
		else
		{
			elStickerToApply.itemid = toolId;
		}
	};

	var _SetUpAsyncActionBar = function( itemId, toolId )
	{
		$.GetContextPanel().SetAttributeString( 'toolid', toolId );
		
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.Init(
			elAsyncActionBarPanel,
			itemId,
			_GetSettingCallback,
			_AsyncActionPerformedCallback
		);
	};
	
	var _GetSettingCallback = function( settingname, defaultvalue )
	{
		return m_Stickerpanel.GetAttributeString( settingname, defaultvalue );
	};

	var _AsyncActionPerformedCallback = function()
	{
		m_Stickerpanel.FindChildInLayoutFile( 'CanStickerContinue' ).enabled = false;
		m_Stickerpanel.FindChildInLayoutFile( 'CanStickerNextPos' ).enabled = false;
	};

	var _StickerBtnActions = function( toolId, itemId, isRemoveStickers )
	{
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.EnableDisableOkBtn( elAsyncActionBarPanel, false );
		
		var elContinueBtn = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerContinue' );
		var elNextSlotBtn = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerNextPos' );
		
		elContinueBtn.SetHasClass( 'hidden', isRemoveStickers );
		elNextSlotBtn.SetHasClass( 'hidden', isRemoveStickers );

		if ( !isRemoveStickers )
		{	
			elContinueBtn.SetPanelEvent( 'onactivate', _OnContinue.bind( undefined, elContinueBtn ) );
			elNextSlotBtn.SetPanelEvent( 'onactivate', _NextSlot.bind( undefined, elContinueBtn, toolId ) );
		}
	};

	                                                                                                    
	              
	                                                                                                    
	var _OnContinue = function( elContinueBtn )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'generic_button_press', 'MOUSE' );

		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.EnableDisableOkBtn( elAsyncActionBarPanel, true );

		$.GetContextPanel().SetAttributeString( 'selectedstickerslot', _GetSelectedStickerSlot() );

		$.GetContextPanel().FindChildInLayoutFile( 'StickerToAppy' ).RemoveClass( 'popup-cansticker-pickedslot--anim' );
		$.GetContextPanel().FindChildInLayoutFile( 'StickerToAppy' ).AddClass( 'popup-cansticker-pickedslot--anim' );
	};

	var _NextSlot = function( elContinueBtn, toolId )
	{
		_ActiveSlotIndex.IncrementIndex();

		var activeIndex = _GetSelectedStickerSlot();
		_PreviewStickerInSlot( toolId, activeIndex );

		elContinueBtn.enabled = true;
		
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.EnableDisableOkBtn( elAsyncActionBarPanel, false );
		
		_CameraAnim( activeIndex, true );
	};

	var _OnScratchSticker = function( elSticker, itemId, slotIndex )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'sticker_scratchOff', 'MOUSE' );

		if ( InventoryAPI.IsItemStickerAtExtremeWear( itemId, slotIndex ) )
		{
			UiToolkitAPI.ShowGenericPopupTwoOptions(
				$.Localize( '#SFUI_Sticker_Remove' ),
				$.Localize( '#SFUI_Sticker_Remove_Desc' ),
				'',
				$.Localize( '#SFUI_Sticker_Remove' ),
				function() { InventoryAPI.WearItemSticker( itemId, slotIndex ); },
				$.Localize( '#UI_Cancel'),
				function() { }
			);
		}
		else
		{
			            
			elSticker.FindChildInLayoutFile( 'ScrapingSpinner' ).RemoveClass( 'hidden' );
			m_SlotSelectedForScratch = slotIndex;
	
			_CameraAnim( slotIndex, true );
			InventoryAPI.HighlightStickerBySlot( slotIndex );
			InventoryAPI.WearItemSticker( itemId, slotIndex );
			
			m_scheduleHandle = $.Schedule( 5, _CancelWaitforCallBack );
			                                                                   
		
			var panelsList = $.GetContextPanel().FindChildInLayoutFile( 'StickersToRemove' ).Children();
			panelsList.forEach( element => element.enabled = false );
		}
	};

	                                                                                                    
	var _PreviewStickerInSlot = function( stickerId, slot )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'sticker_nextPosition', 'MOUSE' );

		var slotIndex = slot;

		InventoryAPI.PreviewStickerInModelPanel( stickerId, slotIndex );
		InventoryAPI.PeelEffectStickerBySlot( slotIndex );
	};

	var _ActiveSlotIndex = ( function()
	{
		var slotIndex = 0;

		var _IncrementIndex = function()
		{
			slotIndex++;
		};

		var _GetIndex = function()
		{
			return slotIndex;
		};

		return {
			IncrementIndex: _IncrementIndex,
			GetIndex: _GetIndex
		};
	} )();

	                                                                                                    
	          
	                                                                                                    
	var m_cameraRules = [
		{ weapontype: 'weapon_elite', slotsForSecondCamera: [ 2, 3 ], cameraPreset: 1 },
		{ weapontype: 'weapon_revolver', slotsForSecondCamera: [ 4 ], cameraPreset: 1 },
		{ weapontype: 'weapon_nova', slotsForSecondCamera: [ 1, 2, 3 ], cameraPreset: 1 },
		{ weapontype: 'weapon_m249', slotsForSecondCamera: [ 3 ], cameraPreset: 1 }
	];

	var _CameraAnim = function( activeIndex, bTransition )
	{
		var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerItemModel' );
		var defName = ItemInfo.GetItemDefinitionName( elPanel.Data().id );
		var weaponProp = m_cameraRules.find( weapon => weapon.weapontype === defName );

		if ( weaponProp )
		{
			if ( weaponProp.slotsForSecondCamera.includes( activeIndex ) )
			{
				elPanel.SetCameraPreset( weaponProp.cameraPreset, bTransition );
			}
			else
			{
				elPanel.SetCameraPreset( 0, bTransition );
			}
		}
	};

	var _GetSlotInfo = function( itemId )
	{
		var slotsCount = InventoryAPI.GetItemStickerSlotCount( itemId );
		var slotInfoList = [];

		for ( var i = 0; i < slotsCount; i++ )
		{
			var StickerPath = InventoryAPI.GetItemStickerImageBySlot( itemId, i );
			slotInfoList.push( { index: i, path: !StickerPath ? 'empty' : StickerPath } );
		}

		return slotInfoList;
	};

	var _GetEmptyStickerSlots = function( slotInfoList )
	{
		return slotInfoList.filter( function( slot )
		{
			if ( slot.path === 'empty' )
				return true;
		} );
	};

	var _GetSelectedStickerSlot = function()
	{
		var emptySlotCount = m_emptySlotList.length;
		var activeIndex = ( _ActiveSlotIndex.GetIndex() % emptySlotCount );
		
		return m_emptySlotList[ activeIndex ].index;
	};

	                                                                                                    
	var _ClosePopUp = function()
	{
		_CancelHandleForTimeout();
		
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );

		if( !elAsyncActionBarPanel.BHasClass( 'hidden' ))
		{
			InspectAsyncActionBar.OnEventToClose();
		}
	};

	var _CancelWaitforCallBack = function()
	{
		_CancelHandleForTimeout();
		_ClosePopUp();

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
	};

	var _OnFinishedScratch = function( itemid )
	{
		_CancelHandleForTimeout();
		
		var panelsList = $.GetContextPanel().FindChildInLayoutFile( 'StickersToRemove' ).Children();
		panelsList.forEach( element => {
			element.enabled = true;
			element.FindChildInLayoutFile( 'ScrapingSpinner' ).AddClass( 'hidden' );
			
		} );

		var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'CanStickerItemModel' );
		_SetItemModel( '', elPanel.Data().id, true );
		_CameraAnim( m_SlotSelectedForScratch, false );
	};

	var _CancelHandleForTimeout = function()
	{
		if ( m_scheduleHandle !== null )
		{
			                                                                        
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}
	};
	
	return {
		Init: _Init,
		ClosePopUp: _ClosePopUp,
		NextSlot: _NextSlot,
		OnFinishedScratch: _OnFinishedScratch
	};
} )();

( function()
{
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', CapabilityCanSticker.OnFinishedScratch );
} )();
