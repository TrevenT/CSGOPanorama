'use strict';

var InventoryInspect = ( function()
{
	var _Init = function ()
	{
		var itemId = $.GetContextPanel().GetAttributeString( "itemid", null );

		                                               
		    
		   	                                              
		   	       
		    

		                                                                      
		                                
		                                                                        
		                                                                                                     
		var elItemModelImagePanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectModelOrImage' );
		InspectModelImage.Init( elItemModelImagePanel, itemId );

		var elActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectActionBar' );
		InspectActionBar.Init(
			elActionBarPanel,
			itemId,
			_GetSettingCallback,
			_GetSettingCallbackInt,
			elItemModelImagePanel
		);

		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.Init(
			elAsyncActionBarPanel,
			itemId,
			_GetSettingCallback
		);

		var elHeaderPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectHeader' );
		InspectHeader.Init( elHeaderPanel, itemId, _GetSettingCallback );

		var elCapabilityPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpCapabilityHeader' );
		CapabiityHeader.Init( elCapabilityPanel, itemId, _GetSettingCallback );

		var elPurchasePanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectPurchaseBar' );
		InpsectPurchaseBar.Init( elPurchasePanel, itemId, _GetSettingCallback );

		PlayShowPanelSound( itemId );
		
		_SetDescription( itemId );
		_LoadEquipNotification();
	};

	var m_Inspectpanel = $.GetContextPanel();
	var _GetSettingCallback = function( settingname, defaultvalue )
	{
		return m_Inspectpanel.GetAttributeString( settingname, defaultvalue );
	};

	var _GetSettingCallbackInt = function( settingname, defaultvalue )
	{
		return m_Inspectpanel.GetAttributeInt( settingname, defaultvalue );
	};

	var PlayShowPanelSound = function ( itemId )
	{
		var slot = ItemInfo.GetSlot( itemId );
		var slotSubPosition = ItemInfo.GetSlotSubPosition( itemId );

		                                                                       
		var inspectSound = "";
		if(slot == "heavy" || slot == "rifle" || slot == "smg" || slot == "secondary") {
			                   
			inspectSound = "inventory_inspect_weapon";
		} else if(slot == "melee") {
			                     
			inspectSound = "inventory_inspect_knife";
		} else if(ItemInfo.ItemMatchDefName( itemId, 'sticker' )) {
			               
			inspectSound = "inventory_inspect_sticker";
		} else if(slot == "spray") {
			                
			inspectSound = "inventory_inspect_graffiti";
		} else if(slot == "musickit") {
			                 
			inspectSound = "inventory_inspect_musicKit";
		} else if(slot == "flair0") {
			            
			inspectSound = "inventory_inspect_coin";
		} else if(slot == "clothing" && slotSubPosition == "clothing_hands") {
			              
			inspectSound = "inventory_inspect_gloves";
		} else {
			               
			inspectSound = "inventory_inspect_sticker";
		}

		$.DispatchEvent( "PlaySoundEffect", inspectSound, "MOUSE" );
	}

	var _SetDescription = function (id)
	{
		if ( !InventoryAPI.IsValidItemID( id ) )
		{
			return;
		}
		
		var elDesc = $.GetContextPanel().FindChildInLayoutFile( 'InspectItemDesc' );
		var descText = InventoryAPI.GetItemDescription( id );

		                                           
		var shortString = descText.substring (0, descText.indexOf( "</font></b><br><font color='#9da1a9'>" ));
		elDesc.text = shortString === '' ? descText : shortString;
	};

	                                                                                                    
	var _LoadEquipNotification = function()
	{
		var elParent = $.GetContextPanel();
		
		var elNotification = $.CreatePanel( 'Panel', elParent, 'InspectNotificationEquip' );
		elNotification.BLoadLayout( 'file://{resources}/layout/notification/notification_equip.xml', false, false );
	};

	var _ShowNotification = function( slotInt, slotString, prevEquippedItemId, newEquippedItemId )
	{
		var elNotification = $.GetContextPanel().FindChildInLayoutFile( 'InspectNotificationEquip' );
		EquipNotification.ShowEquipNotification( elNotification, slotString, newEquippedItemId );
	};

	var _ItemAcquired = function( ItemId )
	{
		var storeItemId = $.GetContextPanel().GetAttributeString( "storeitemid", "" );
		if( storeItemId )
		{
			_ClosePopup();
			$.DispatchEvent( 'ShowAcknowledgePopup', '', ItemId );
			$.DispatchEvent( 'HideStoreStatusPanel', '' );
		}
	};

	var _ClosePopup = function()
	{
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		var elPurchase = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectPurchaseBar' );
		var elInspectBar = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectActionBar' );

		if( !elAsyncActionBarPanel.BHasClass( 'hidden' ))
		{
			InspectAsyncActionBar.OnEventToClose();
		}
		else if ( !elPurchase.BHasClass( 'hidden' ) )
		{
			InpsectPurchaseBar.ClosePopup();
		}
		else
		{
			InspectActionBar.CloseBtnAction();
		}
	};

	return{
		Init: _Init,
		ShowNotification: _ShowNotification,
		ClosePopup: _ClosePopup,
		ItemAcquired: _ItemAcquired
	};
} )();

( function()
{
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_PlayerEquipSlotChanged', InventoryInspect.ShowNotification );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PurchaseCompleted', InventoryInspect.ItemAcquired );
} )();
